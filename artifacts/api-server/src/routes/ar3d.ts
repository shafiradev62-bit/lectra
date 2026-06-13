/**
 * AR3D proxy — forwards /ar3d/* requests to the external AR3D backend.
 * Keeps the browser free of Mixed Content errors when the VPS speaks HTTP.
 *
 * Body forwarding strategy:
 *   - JSON / urlencoded: express.json() and express.urlencoded() in app.ts
 *     have already consumed and parsed the stream into req.body.
 *     Re-serialize req.body so the upstream receives the correct bytes.
 *   - Multipart (file upload): express middleware does NOT consume multipart
 *     streams, so we can pipe req (the raw IncomingMessage) directly.
 *   - GET / HEAD / no-body: no body sent.
 *
 * Environment:
 *   AR3D_BACKEND  — base URL of the AR3D VPS, e.g. http://76.13.17.91:8000
 *                   Defaults to http://localhost:8000 for local dev.
 */
import { Router, type Request, type Response } from "express";

const router = Router();

function backend(): string {
  return (
    process.env["AR3D_BACKEND"] ??
    process.env["VITE_AR3D_BACKEND"] ??
    "http://localhost:8000"
  );
}

const PROXY_TIMEOUT_MS = 120_000;

async function proxyToBackend(req: Request, res: Response): Promise<void> {
  const targetPath = req.path === "/" ? "" : req.path;
  const query = req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : "";
  const url = `${backend()}${targetPath}${query}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PROXY_TIMEOUT_MS);

  try {
    const headers = buildHeaders(req);
    const init: RequestInit = { method: req.method, headers, signal: controller.signal };

    if (req.method !== "GET" && req.method !== "HEAD") {
      const ct = (req.headers["content-type"] ?? "").toLowerCase();

      if (ct.includes("multipart/form-data")) {
        // Express has NOT consumed multipart streams — pipe raw bytes
        init.body = await readRawBody(req);
        // Keep original content-type (with boundary)
      } else if (ct.includes("application/json")) {
        // express.json() already parsed; re-serialize
        const json = JSON.stringify(req.body ?? {});
        init.body = json;
        headers["content-type"] = "application/json";
        headers["content-length"] = Buffer.byteLength(json).toString();
        delete headers["transfer-encoding"];
      } else if (ct.includes("application/x-www-form-urlencoded")) {
        // express.urlencoded() already parsed; re-encode
        const encoded = new URLSearchParams(req.body as Record<string, string>).toString();
        init.body = encoded;
        headers["content-type"] = "application/x-www-form-urlencoded";
        headers["content-length"] = Buffer.byteLength(encoded).toString();
        delete headers["transfer-encoding"];
      } else {
        // Unknown — try raw stream
        init.body = await readRawBody(req);
      }
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
  const skip = new Set(["host", "connection", "transfer-encoding", "content-length"]);
  for (const [k, v] of Object.entries(req.headers)) {
    if (!skip.has(k.toLowerCase()) && typeof v === "string") out[k] = v;
  }
  return out;
}

function readRawBody(req: Request): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (c: Buffer) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

router.all("/{*path}", proxyToBackend);

export default router;
