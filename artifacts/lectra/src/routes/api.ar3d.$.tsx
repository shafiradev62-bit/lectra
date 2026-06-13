/**
 * Vercel proxy — forwards /api/ar3d/* to the VPS backend (HTTP).
 * This avoids browser Mixed Content errors when Vercel is HTTPS
 * but the VPS only speaks HTTP.
 */
import { createAPIFileRoute } from "@tanstack/react-start/api";

const VPS = process.env["VITE_AR3D_BACKEND"] ?? "http://76.13.17.91:8000";

export const APIRoute = createAPIFileRoute("/api/ar3d/$")({
  GET: ({ request }) => proxyRequest(request),
  POST: ({ request }) => proxyRequest(request),
  OPTIONS: () =>
    new Response(null, {
      status: 204,
      headers: corsHeaders(),
    }),
});

function corsHeaders(): HeadersInit {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

async function proxyRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  // Strip /api/ar3d prefix, forward the rest to VPS
  const path = url.pathname.replace(/^\/api\/ar3d/, "");
  const target = `${VPS}${path}${url.search}`;

  try {
    const upstream = await fetch(target, {
      method: request.method,
      headers: { "Content-Type": request.headers.get("Content-Type") ?? "application/json" },
      body: request.method !== "GET" ? request.body : undefined,
      // @ts-ignore — node fetch needs this for streaming
      duplex: "half",
    });

    const body = await upstream.arrayBuffer();
    return new Response(body, {
      status: upstream.status,
      headers: {
        "Content-Type": upstream.headers.get("Content-Type") ?? "application/octet-stream",
        ...corsHeaders(),
      },
    });
  } catch (err) {
    console.error("[ar3d-proxy] error:", err);
    return Response.json({ error: "Backend unreachable" }, { status: 502 });
  }
}
