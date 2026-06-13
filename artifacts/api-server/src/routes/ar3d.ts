/**
 * AR3D proxy — forwards /ar3d/* requests to the external AR3D backend.
 * Keeps the browser free of Mixed Content errors when the VPS speaks HTTP.
 *
 * Environment:
 *   AR3D_BACKEND  — base URL of the AR3D VPS, e.g. http://76.13.17.91:8000
 *                   Defaults to http://localhost:8000 for local dev.
 */
import { Router, type Request, type Response } from "express";

const router = Router();

function backend(): string {
  return process.env["AR3D_BACKEND"] ?? process.env["VITE_AR3D_BACKEND"] ?? "http://localhost:8000";
}

const PROXY_TIMEOUT_MS = 120_000;

/**
 * Generic proxy: strip the /ar3d prefix and forward everything to the backend.
 * Supports GET and POST (multipart included), streams the response body back.
 */
async function proxyToBackend(req: Request, res: Response): Promise<void> {
  const targetPath = req.path === "/" ? "" : req.path;
  const query = req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : "";
  const url = `${backend()}${targetPath}${query}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PROXY_TIMEOUT_MS);

  try {
    const init: RequestInit = {
      method: req.method,
      headers: buildHeaders(req),
      signal: controller.signal,
    };

    if (req.method !== "GET" && req.method !== "HEAD") {
      init.body = await readBody(req);
    }

    const upstream = await fetch(url, init);
    clearTimeout(timer);

    res.status(upstream.status);
    upstream.headers.forEach((value, key) => {
      const skip = ["transfer-encoding", "connection"];
      if (!skip.includes(key.toLowerCase())) res.setHeader(key, value);
    });

    const buf = await upstream.arrayBuffer();
    res.end(Buffer.from(buf));
  } catch (err) {
    clearTimeout(timer);
    if (err instanceof Error && err.name === "AbortError") {
      res.status(504).json({ error: "AR3D backend timed out" });
    } else {
      res.status(502).json({ error: "AR3D backend unreachable" });
    }
  }
}

function buildHeaders(req: Request): Record<string, string> {
  const out: Record<string, string> = {};
  const skip = new Set(["host", "connection", "transfer-encoding"]);
  for (const [k, v] of Object.entries(req.headers)) {
    if (!skip.has(k.toLowerCase()) && typeof v === "string") out[k] = v;
  }
  return out;
}

function readBody(req: Request): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (c: Buffer) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

router.all("/{*path}", proxyToBackend);

export default router;
