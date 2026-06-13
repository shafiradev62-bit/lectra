/**
 * WebAR viewer using Google's model-viewer web component.
 * Supports iOS Quick Look, Android Scene Viewer, and WebXR.
 */

import { useEffect, useRef, useState } from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          src?: string;
          alt?: string;
          ar?: boolean;
          "ar-modes"?: string;
          "camera-controls"?: boolean;
          "auto-rotate"?: boolean;
          "shadow-intensity"?: string;
          loading?: string;
          reveal?: string;
        },
        HTMLElement
      >;
    }
  }
}

const MODEL_VIEWER_SCRIPT =
  "https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js";

let scriptLoaded = false;
let scriptLoading: Promise<void> | null = null;

function loadModelViewerScript(): Promise<void> {
  if (scriptLoaded) return Promise.resolve();
  if (scriptLoading) return scriptLoading;
  scriptLoading = new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${MODEL_VIEWER_SCRIPT}"]`)) {
      scriptLoaded = true;
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.type = "module";
    script.src = MODEL_VIEWER_SCRIPT;
    script.onload = () => {
      scriptLoaded = true;
      resolve();
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
  return scriptLoading;
}

interface ModelViewerARProps {
  glbUrl: string;
  label: string;
  className?: string;
  autoRotate?: boolean;
}

export function ModelViewerAR({
  glbUrl,
  label,
  className = "",
  autoRotate = true,
}: ModelViewerARProps) {
  const ref = useRef<HTMLElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadModelViewerScript()
      .then(() => setReady(true))
      .catch(console.error);
  }, []);

  if (!ready) {
    return (
      <div className={`flex items-center justify-center bg-sun/30 rounded-2xl min-h-[280px] ${className}`}>
        <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <model-viewer
      ref={ref as React.RefObject<HTMLElement>}
      src={glbUrl}
      alt={label}
      ar
      ar-modes="webxr scene-viewer quick-look"
      camera-controls
      auto-rotate={autoRotate ? "" : undefined}
      shadow-intensity="1"
      loading="eager"
      reveal="auto"
      class={className}
      style={{ width: "100%", height: "100%", minHeight: "280px", background: "transparent" }}
    />
  );
}

export function ArViewerPage({ glbUrl, title }: { glbUrl: string; title: string }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="px-6 py-4 border-b border-border">
        <h1 className="font-display text-xl">{title}</h1>
        <p className="text-sm text-muted-foreground">Tap AR button to view in your space</p>
      </header>
      <main className="flex-1 p-4">
        <ModelViewerAR glbUrl={glbUrl} label={title} className="w-full h-full rounded-3xl" />
      </main>
    </div>
  );
}
