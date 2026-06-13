import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, Link, createRootRouteWithContext, useRouter, HeadContent, Scripts } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import "../styles.css";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error("ROOT ERROR:", error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Error: {error.message || "Something went wrong"}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          {String(error)}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Lectra — 3D, AR & lesson builder for teachers" },
      { name: "description", content: "Lectra turns your lesson topics into 3D models with real vertices, AR experiences, interactive slides, and mini-games — all running locally, no API keys." },
      { property: "og:title", content: "Lectra — 3D, AR & Game Builder untuk Guru" },
      { property: "og:description", content: "Bangun media belajar interaktif: 3D, AR, dan game otomatis. Hanya 20rb/bulan." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700;9..144,800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  const CSS_VARS = `
:root{--radius:1rem;--background:oklch(0.97 0.012 85);--foreground:oklch(0.18 0.01 60);--card:oklch(0.99 0.005 85);--card-foreground:oklch(0.18 0.01 60);--popover:oklch(0.99 0.005 85);--popover-foreground:oklch(0.18 0.01 60);--primary:oklch(0.18 0.01 60);--primary-foreground:oklch(0.97 0.012 85);--secondary:oklch(0.93 0.02 80);--secondary-foreground:oklch(0.18 0.01 60);--muted:oklch(0.93 0.02 80);--muted-foreground:oklch(0.45 0.02 60);--accent:oklch(0.72 0.18 45);--accent-foreground:oklch(0.99 0 0);--destructive:oklch(0.62 0.22 25);--destructive-foreground:oklch(0.99 0 0);--border:oklch(0.88 0.015 70);--input:oklch(0.93 0.02 80);--ring:oklch(0.72 0.18 45);--sun:oklch(0.88 0.16 95);--leaf:oklch(0.78 0.16 150);--blush:oklch(0.82 0.10 20);--sky:oklch(0.82 0.10 240);--ink:oklch(0.18 0.01 60)}
*,::before,::after{box-sizing:border-box;border-width:0;border-style:solid;border-color:oklch(0.88 0.015 70)}
html{line-height:1.5;-webkit-text-size-adjust:100%;scroll-behavior:smooth}
body{margin:0;background-color:oklch(0.97 0.012 85);color:oklch(0.18 0.01 60);font-family:"Plus Jakarta Sans",sans-serif;-webkit-font-smoothing:antialiased}
h1,h2,h3,h4{font-family:"Fraunces",serif;font-weight:700;letter-spacing:-0.025em}
img,video{max-width:100%;height:auto}
a{color:inherit;text-decoration:inherit}
button,input,select,textarea{font-family:inherit;font-size:100%;font-weight:inherit;line-height:inherit;color:inherit;margin:0;padding:0}
`;
  return (
    <html lang="en">
      <head>
        <style dangerouslySetInnerHTML={{ __html: CSS_VARS }} />
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
    </QueryClientProvider>
  );
}
