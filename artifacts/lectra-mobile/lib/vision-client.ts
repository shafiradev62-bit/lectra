/**
 * Vision client — sends a base64 image to the API server's /vision/scan
 * endpoint and returns the extracted educational topic.
 * Returns { topic: "", confidence: "none" } gracefully when AI is unavailable.
 */

export interface VisionScanResult {
  topic: string;
  confidence: "high" | "low" | "none";
}

function getApiBase(): string {
  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  if (domain) return `https://${domain}/api`;
  return "http://localhost:8080/api";
}

export async function scanImageForTopic(
  imageBase64: string,
  mimeType = "image/jpeg",
): Promise<VisionScanResult> {
  try {
    const response = await fetch(`${getApiBase()}/vision/scan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageBase64, mimeType }),
      signal: AbortSignal.timeout(15_000),
    });
    if (!response.ok) return { topic: "", confidence: "none" };
    const data = (await response.json()) as VisionScanResult;
    return data;
  } catch {
    return { topic: "", confidence: "none" };
  }
}
