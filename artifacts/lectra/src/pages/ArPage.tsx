import { Link, useParams, useSearch } from "wouter";
import { ArrowLeft } from "lucide-react";
import { ModelViewerAR } from "@/components/model-viewer-ar";
import { isLocale, type Locale } from "@/lib/i18n";

function ArPage() {
  const params = useParams<{ lang: string }>();
  const lang = params.lang;
  const locale = (isLocale(lang) ? lang : "id") as Locale;
  const search = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const model = search.get("model") ?? undefined;
  const title = search.get("title") ?? "3D Model";

  if (!model) {
    return (
      <div className="min-h-screen grid place-items-center px-6 text-center">
        <div>
          <h1 className="font-display text-2xl mb-3">Model not found</h1>
          <Link href={`/${locale}/create`} className="btn-orange">
            {locale === "id" ? "Buat materi baru" : "Create new lesson"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="px-6 py-4 border-b border-border flex items-center gap-4">
        <Link href={`/${locale}`} className="inline-flex items-center gap-2 text-sm font-medium hover:opacity-70">
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
          <ModelViewerAR glbUrl={model} label={title} className="w-full h-full" />
        </div>
      </main>
    </div>
  );
}

export default ArPage;
