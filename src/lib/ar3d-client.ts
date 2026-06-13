/**
 * AR3D Engine client — production 3D generation for Lectra.
 * Connects to Lectra backend (port 8000) which runs semantic mesh + AR3D pipeline.
 */

const BACKEND =
  typeof import.meta !== "undefined" && import.meta.env?.VITE_AR3D_BACKEND
    ? import.meta.env.VITE_AR3D_BACKEND
    : "http://localhost:8000";

const BATCH_TIMEOUT_MS = 120_000;
const PHOTO_TIMEOUT_MS = 600_000;

export interface ModelResult {
  success: boolean;
  fileUrl?: string;
  vertices?: string | number;
  faces?: number;
  error?: string;
  prompt: string;
  cached?: boolean;
  source?: string;
}

export interface GeneratedModel {
  url: string;
  vertices: number;
  faces: number;
  source: string;
}

async function checkBackendHealth(): Promise<boolean> {
  try {
    const r = await fetch(`${BACKEND}/health`, { signal: AbortSignal.timeout(3000) });
    return r.ok;
  } catch {
    return false;
  }
}

/**
 * Generate production GLB models from topic labels (batch).
 */
export async function generate3DModelBatch(
  prompts: string[],
): Promise<(GeneratedModel | null)[]> {
  if (!prompts.length) return [];

  const healthy = await checkBackendHealth();
  if (!healthy) {
    console.warn("[AR3D] Backend offline — models will load on retry");
    return prompts.map(() => null);
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), BATCH_TIMEOUT_MS);

    const response = await fetch(`${BACKEND}/api/generate-batch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompts }),
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!response.ok) {
      console.error("[AR3D] HTTP error:", response.status);
      return prompts.map(() => null);
    }

    const results: ModelResult[] = await response.json();
    return results.map((r) => {
      if (!r.success || !r.fileUrl) return null;
      const verts =
        typeof r.vertices === "number"
          ? r.vertices
          : parseInt(String(r.vertices || "0").replace(/,/g, ""), 10) || 0;
      return {
        url: r.fileUrl,
        vertices: verts,
        faces: r.faces ?? 0,
        source: r.source ?? "ar3d",
      };
    });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      console.error("[AR3D] Batch timed out");
    } else {
      console.error("[AR3D] Error:", err);
    }
    return prompts.map(() => null);
  }
}

/**
 * Generate from 4–8 phone photos (photogrammetry path).
 */
export async function generateFromPhotos(
  files: File[],
  mode: "photogrammetry" | "single_image" = "photogrammetry",
): Promise<GeneratedModel | null> {
  if (!files.length) return null;

  const form = new FormData();
  files.forEach((f) => form.append("files", f));
  form.append("mode", mode);
  form.append("quality", "standard");

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), PHOTO_TIMEOUT_MS);

    const response = await fetch(`${BACKEND}/api/generate-photos`, {
      method: "POST",
      body: form,
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!response.ok) return null;
    const data = await response.json();
    if (!data.success || !data.fileUrl) return null;

    return {
      url: data.fileUrl,
      vertices: 0,
      faces: 0,
      source: data.source ?? "photogrammetry",
    };
  } catch (err) {
    console.error("[AR3D] Photo generation failed:", err);
    return null;
  }
}

/** Legacy single-model helper */
export async function generate3DModel(prompt: string): Promise<string | null> {
  const results = await generate3DModelBatch([prompt]);
  return results[0]?.url ?? null;
}

/** Download GLB file to user's device */
export function downloadGlb(url: string, name: string): void {
  const a = document.createElement("a");
  a.href = url;
  a.download = `lectra-${name.replace(/\s+/g, "-").toLowerCase()}.glb`;
  a.target = "_blank";
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/** Build AR viewer URL using model-viewer compatible GLB */
export function getArViewerUrl(glbUrl: string, title: string): string {
  const params = new URLSearchParams({ model: glbUrl, title });
  return `/ar-viewer?${params.toString()}`;
}

export { BACKEND as AR3D_BACKEND };
