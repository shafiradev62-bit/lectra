/**
 * Mobile AR3D client — calls the shared API server's AR3D proxy.
 * The API server at /api/ar3d forwards to the external AR3D VPS backend.
 * Falls back gracefully (returns null) when the backend is offline.
 */

export interface GeneratedModel {
  url: string;
  vertices: number;
  faces: number;
  source: string;
}

function getBackendBase(): string {
  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  if (domain) return `https://${domain}/api/ar3d`;
  return "http://localhost:8080/api/ar3d";
}

async function checkHealth(): Promise<boolean> {
  try {
    const r = await fetch(`${getBackendBase()}/health`, {
      signal: AbortSignal.timeout(5000),
    });
    return r.ok;
  } catch {
    return false;
  }
}

/**
 * Generate a 3D model from phone photos.
 * Uploads images via multipart/form-data to the AR3D proxy.
 * Returns null if the backend is offline or generation fails.
 */
export async function generateFromPhotos(
  photoUris: string[],
  mode: "photogrammetry" | "single_image" = "photogrammetry",
): Promise<GeneratedModel | null> {
  if (!photoUris.length) return null;

  const healthy = await checkHealth();
  if (!healthy) return null;

  const form = new FormData();
  photoUris.forEach((uri, i) => {
    // React Native FormData accepts { uri, name, type } objects
    form.append("files", {
      uri,
      name: `photo_${i}.jpg`,
      type: "image/jpeg",
    } as any);
  });
  form.append("mode", mode);
  form.append("quality", "standard");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 300_000);

  try {
    const response = await fetch(`${getBackendBase()}/api/generate-photos`, {
      method: "POST",
      body: form,
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!response.ok) return null;
    const data = await response.json();
    if (!data.success || !data.fileUrl) return null;

    const verts =
      typeof data.vertices === "number"
        ? data.vertices
        : parseInt(String(data.vertices || "0").replace(/,/g, ""), 10) || 0;

    return {
      url: data.fileUrl,
      vertices: verts,
      faces: data.faces ?? 0,
      source: data.source ?? "photogrammetry",
    };
  } catch {
    clearTimeout(timer);
    return null;
  }
}
