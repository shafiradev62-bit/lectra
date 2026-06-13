import { createFileRoute, useSearch } from "@tanstack/react-router";
import { Link, useParams } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { ModelViewerAR } from "@/components/model-viewer-ar";
import { isLocale, type Locale } from "@/lib/i18n";

type ArSearch = { model?: string; title?: string };

export const Route = createFileRoute("/$lang/ar")({
  validateSearch: (search: Record<string, unknown>): ArSearch => ({
    model: typeof search.model === "string" ? search.model : undefined,
    title: typeof search.title === "string" ? search.title : "3D Model",
  }),
  component: ArPage,
});

function ArPage() {
  const { lang } = useParams({ from: "/$lang/ar" });
  const locale = (isLocale(lang) ? lang : "id") as Locale;
  const { model, title } = useSearch({ from: "/$lang/ar" });

  if (!model) {
    return (
      <div className="min-h-screen grid place-items-center px-6 text-center">
        <div>
          <h1 className="font-display text-2xl mb-3">Model not found</h1>
          <Link to="/$lang/create" params={{ lang: locale }} className="btn-orange">
            {locale === "id" ? "Buat materi baru" : "Create new lesson"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="px-6 py-4 border-b border-border flex items-center gap-4">
        <Link to="/$lang" params={{ lang: locale }} className="inline-flex items-center gap-2 text-sm font-medium hover:opacity-70">
          <ArrowLeft className="w-4 h-4" /> Lectra
        </Link>
        <div>
          <h1 className="font-display text-lg">{title}</h1>
          <p className="text-xs text-muted-foreground">
            {locale === "id" ? "Tap ikon AR untuk lihat di ruangan" : "Tap AR icon to view in your space"}
          </p>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-2xl mx-auto h-[70vh] rounded-3xl overflow-hidden border-2 border-ink bg-sun/20">
          <ModelViewerAR glbUrl={model} label={title ?? "Model"} className="w-full h-full" />
        </div>
      </main>
    </div>
  );
}
