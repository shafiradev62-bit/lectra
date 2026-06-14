import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useRef, useState, useCallback } from "react";
import QRCode from "qrcode";
import { ArrowLeft, Check, Download, Scan, X, Copy, Printer, RotateCcw, Trophy, ExternalLink, Video, Loader2 } from "lucide-react";
import { getLesson, type StoredLesson } from "@/lib/lesson-storage";
import { normalizeLesson } from "@/lib/lesson-generator";
import { Lesson3D, vertexCount, downloadGlb, type ShapeSpec } from "@/components/lesson-3d";
import { ModelViewerAR } from "@/components/model-viewer-ar";
import { SpriteBook, SpriteScan, SpriteMark, SpriteHeart } from "@/components/sprites";
import { dict, isLocale, type Locale } from "@/lib/i18n";
import { generateLessonVideo } from "@/lib/video-generator";

export const Route = createFileRoute("/$lang/lesson/$id")({
  component: LessonPage,
});

const CARD_BG = ["bg-sun", "bg-leaf", "bg-blush", "bg-sky"];

function useReadingProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    function onScroll() {
      const el = document.documentElement;
      const scrolled = el.scrollTop;
      const total = el.scrollHeight - el.clientHeight;
      setProgress(total > 0 ? Math.min(100, (scrolled / total) * 100) : 0);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return progress;
}

function LessonPage() {
  const { id, lang } = useParams({ from: "/$lang/lesson/$id" });
  const locale = (isLocale(lang) ? lang : "id") as Locale;
  const t = dict[locale].lesson;

  const [stored, setStored] = useState<StoredLesson | null | undefined>(undefined);
  const [arSpec, setArSpec] = useState<{ spec: ShapeSpec; label: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [videoState, setVideoState] = useState<"idle" | "generating" | "ready" | "error">("idle");
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState<{ url: string; filename: string } | null>(null);
  const progress = useReadingProgress();

  useEffect(() => {
    try {
      const lesson = getLesson(id);
      setStored(lesson);
    } catch (err) {
      console.error("[LessonPage] Error getting lesson:", err);
      setStored(null);
    }
  }, [id]);

  function handleCopyLink() {
    if (typeof window === "undefined") return;
    try {
      navigator.clipboard.writeText(window.location.href).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } catch {
      // Ignore copy errors
    }
  }

  function handlePrint() {
    try {
      window.print();
    } catch {
      // Ignore print errors
    }
  }

  const handleGenerateVideo = useCallback(async () => {
    if (!stored || videoState === "generating") return;
    // Clean up previous video URL
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl.url);
      setVideoUrl(null);
    }
    setVideoState("generating");
    setVideoProgress(0);
    try {
      const lesson = normalizeLesson(stored.lesson);
      const result = await generateLessonVideo(lesson, {
        onProgress: (pct) => setVideoProgress(pct),
      });
      setVideoUrl({ url: result.url, filename: result.filename });
      setVideoState("ready");
    } catch (err) {
      console.error("[Video] Generation failed:", err);
      setVideoState("error");
      setTimeout(() => setVideoState("idle"), 3000);
    }
  }, [stored, videoState, videoUrl]);

  function handleDownloadVideo() {
    if (!videoUrl) return;
    const a = document.createElement("a");
    a.href = videoUrl.url;
    a.download = videoUrl.filename;
    a.click();
  }

  if (stored === undefined) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
          <span className="text-sm">{t.loading}</span>
        </div>
      </div>
    );
  }
  if (stored === null) {
    return (
      <div className="min-h-screen grid place-items-center px-6 text-center">
        <div>
          <h1 className="font-display text-3xl mb-3">{t.notFoundTitle}</h1>
          <p className="text-muted-foreground mb-6">{t.notFoundSub}</p>
          <Link to="/$lang/create" params={{ lang: locale }} className="btn-orange">{t.notFoundCta}</Link>
        </div>
      </div>
    );
  }

  // Normalize lesson to make sure it's safe
  const lesson = normalizeLesson(stored.lesson);

  return (
    <div className="min-h-screen bg-background">
      {/* Reading progress bar */}
      <div
        className="fixed top-0 left-0 z-50 h-1 bg-accent transition-all duration-150"
        style={{ width: `${progress}%` }}
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={t.progressLabel}
      />

      <header className="px-6 md:px-12 py-5 border-b border-border sticky top-0 z-40 backdrop-blur-md bg-background/90">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <Link to="/$lang" params={{ lang: locale }} className="inline-flex items-center gap-2 text-sm font-medium hover:opacity-70 transition-opacity shrink-0">
            <ArrowLeft className="w-4 h-4" /> {t.back}
          </Link>

          <div className="flex items-center gap-2">
            {/* Generate / Download Video */}
            {videoState === "idle" && (
              <button
                onClick={handleGenerateVideo}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border border-border hover:border-ink transition print:hidden"
                title={t.generateVideo}
                aria-label={t.generateVideo}
              >
                <Video className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.generateVideo}</span>
              </button>
            )}
            {videoState === "generating" && (
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border border-accent text-accent print:hidden">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span className="hidden sm:inline">{videoProgress}%</span>
              </div>
            )}
            {videoState === "ready" && (
              <button
                onClick={handleDownloadVideo}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-leaf border border-leaf text-ink hover:opacity-90 transition print:hidden"
                title={t.downloadVideo}
                aria-label={t.downloadVideo}
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.downloadVideo}</span>
              </button>
            )}
            {videoState === "error" && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border border-destructive text-destructive print:hidden">
                {t.videoError}
              </span>
            )}
            {/* Copy link */}
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border border-border hover:border-ink transition"
              title={t.copyLink}
              aria-label={t.copyLink}
            >
              <Copy className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{copied ? t.copied : t.copyLink}</span>
            </button>
            {/* Print */}
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border border-border hover:border-ink transition print:hidden"
              title={t.print}
              aria-label={t.print}
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.print}</span>
            </button>
            <Link to="/$lang/create" params={{ lang: locale }} className="text-sm font-medium hover:underline hidden sm:inline">{t.newLesson}</Link>
            <div className="flex items-center gap-2 font-display font-bold">
              <SpriteMark className="w-5 h-5" /> Lectra
            </div>
          </div>
        </div>
      </header>

      <article className="max-w-5xl mx-auto px-6 md:px-12 py-12 print:py-6">
        {/* Title block */}
        <div className="mb-12">
          <div className="flex items-center gap-3 text-xs font-mono mb-4">
            <span className="px-2.5 py-1 rounded-full bg-ink text-background font-semibold">{lesson.level}</span>
            <span className="text-muted-foreground">{lesson.duration}</span>
            <span className="text-muted-foreground hidden sm:inline">
              {new Date(stored.createdAt).toLocaleDateString(locale === "id" ? "id-ID" : "en-US", { day: "numeric", month: "short", year: "numeric" })}
            </span>
          </div>
          <h1 className="font-display text-4xl md:text-6xl leading-[1.05] mb-4">{lesson.title}</h1>
          <p className="text-xl text-muted-foreground max-w-3xl">{lesson.subtitle}</p>
        </div>

        {/* Intro card */}
        <div className="rounded-3xl bg-sun p-8 md:p-10 mb-12 relative overflow-hidden">
          <SpriteBook className="absolute -bottom-4 -right-4 w-36 h-36 opacity-60 print:hidden" />
          <p className="text-lg leading-relaxed text-ink max-w-2xl relative">{lesson.intro}</p>
        </div>

        {/* Sections */}
        <div className="space-y-12">
          {lesson.sections.map((s, i) => {
            const bg = CARD_BG[i % CARD_BG.length];
            let verts = 0;
            try {
              verts = vertexCount(s.shape);
            } catch {
              verts = 0;
            }
            return (
              <section key={i} className="grid md:grid-cols-5 gap-6 items-start">
                <div className="md:col-span-3">
                  <p className="text-xs font-bold tracking-widest text-accent mb-2">
                    {t.section} {String(i + 1).padStart(2, "0")} / {String(lesson.sections.length).padStart(2, "0")}
                  </p>
                  <h2 className="font-display text-3xl md:text-4xl mb-4 leading-tight">{s.heading}</h2>
                  <p className="text-foreground/80 leading-relaxed mb-5">{s.body}</p>
                  <ul className="space-y-2.5">
                    {s.bullets.map((b, j) => (
                      <li key={j} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-leaf grid place-items-center mt-0.5 shrink-0" aria-hidden="true">
                          <Check className="w-3 h-3 text-ink" strokeWidth={3} />
                        </div>
                        <span className="text-foreground/90">{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="md:col-span-2 print:hidden">
                  <div className={`${bg} rounded-3xl p-4 relative`}>
                    <div className="aspect-square w-full rounded-2xl bg-background/40 overflow-hidden">
                      <Lesson3D spec={s.shape} />
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs px-1">
                      <span className="font-mono font-semibold text-ink/80">
                        {verts > 0 ? `${verts.toLocaleString()} ${t.vertices}` : t.pipeline}
                      </span>
                      <span className="font-semibold text-ink/80">{s.shape.label}</span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setArSpec({ spec: s.shape, label: s.shape.label })}
                        disabled={!s.shape.modelUrl}
                        className="bg-ink text-background rounded-xl py-2.5 text-xs font-semibold inline-flex items-center justify-center gap-1.5 hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed"
                        aria-label={`${t.viewAr} — ${s.shape.label}`}
                      >
                        <Scan className="w-3.5 h-3.5" /> {t.viewAr}
                      </button>
                      <button
                        type="button"
                        disabled={!s.shape.modelUrl}
                        onClick={() => {
                          if (s.shape.modelUrl) downloadGlb(s.shape, s.shape.label || s.heading);
                        }}
                        className="bg-background border-2 border-ink rounded-xl py-2.5 text-xs font-semibold inline-flex items-center justify-center gap-1.5 hover:bg-sun transition disabled:opacity-40 disabled:cursor-not-allowed"
                        aria-label={`${t.downloadGlb} — ${s.shape.label}`}
                      >
                        <Download className="w-3.5 h-3.5" /> {t.downloadGlb}
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            );
          })}
        </div>

        {/* Vocabulary */}
        <section className="mt-20" aria-labelledby="vocab-heading">
          <div className="flex items-center gap-3 mb-6">
            <SpriteHeart className="w-8 h-8" aria-hidden="true" />
            <h2 id="vocab-heading" className="font-display text-3xl">{t.vocab}</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {lesson.vocabulary.map((v, i) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-5 hover:border-ink transition">
                <p className="font-display text-xl mb-1">{v.term}</p>
                <p className="text-sm text-muted-foreground">{v.meaning}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Quiz */}
        <section className="mt-20" aria-labelledby="quiz-heading">
          <div className="flex items-center gap-3 mb-6">
            <SpriteScan className="w-8 h-8" aria-hidden="true" />
            <h2 id="quiz-heading" className="font-display text-3xl">{t.quiz}</h2>
          </div>
          <QuizSection quiz={lesson.quiz} t={t} locale={locale} />
        </section>
      </article>

      {arSpec && <ArModal spec={arSpec.spec} label={arSpec.label} onClose={() => setArSpec(null)} t={t} locale={locale} />}
    </div>
  );
}

type QuizQ = { question: string; options: string[]; correctIndex: number; explanation: string };
type TLesson = ReturnType<typeof dictPick>;
function dictPick(l: Locale) { return dict[l].lesson; }

function QuizSection({
  quiz, t, locale,
}: { quiz: QuizQ[]; t: TLesson; locale: Locale }) {
  const [answers, setAnswers] = useState<(number | null)[]>(() => quiz.map(() => null));
  const [showScore, setShowScore] = useState(false);

  const answered = answers.filter((a) => a !== null).length;
  const allDone = answered === quiz.length;
  const score = answers.filter((a, i) => a === quiz[i].correctIndex).length;

  function handleRetry() {
    setAnswers(quiz.map(() => null));
    setShowScore(false);
  }

  return (
    <div>
      <div className="space-y-5">
        {quiz.map((q, i) => (
          <QuizItem
            key={i}
            q={q}
            index={i}
            pick={answers[i]}
            onPick={(v) => {
              const next = [...answers];
              next[i] = v;
              setAnswers(next);
            }}
            t={t}
          />
        ))}
      </div>

      {/* Score summary */}
      {allDone && !showScore && (
        <div className="mt-8 text-center">
          <button
            onClick={() => setShowScore(true)}
            className="btn-orange hover:btn-orange-hover"
          >
            <Trophy className="w-4 h-4" /> {t.quizScore}
          </button>
        </div>
      )}

      {showScore && (
        <div className="mt-8 bg-sun rounded-3xl p-8 text-center">
          <Trophy className="w-10 h-10 mx-auto mb-3 text-ink" />
          <p className="font-display text-4xl mb-1">
            {score} <span className="text-2xl font-normal text-ink/60">{t.quizScoreOf} {quiz.length}</span>
          </p>
          <div className="flex gap-2 items-center justify-center mt-4">
            {quiz.map((q, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full ${
                  answers[i] === q.correctIndex ? "bg-leaf border-2 border-ink" : "bg-blush border-2 border-ink"
                }`}
                title={`Q${i + 1}`}
              />
            ))}
          </div>
          <button onClick={handleRetry} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold hover:underline">
            <RotateCcw className="w-4 h-4" /> {t.quizRetry}
          </button>
        </div>
      )}
    </div>
  );
}

function QuizItem({
  q, index, pick, onPick, t,
}: { q: QuizQ; index: number; pick: number | null; onPick: (i: number) => void; t: TLesson }) {
  const correct = pick === q.correctIndex;
  return (
    <div className="bg-card border border-border rounded-2xl p-6 transition hover:border-ink/40">
      <p className="font-display text-lg mb-4">{index + 1}. {q.question}</p>
      <div className="grid sm:grid-cols-2 gap-2.5" role="group" aria-label={`Question ${index + 1} options`}>
        {q.options.map((opt, i) => {
          const isPicked = pick === i;
          const isRight = pick !== null && i === q.correctIndex;
          const isWrong = isPicked && i !== q.correctIndex;
          return (
            <button
              key={i}
              disabled={pick !== null}
              onClick={() => onPick(i)}
              aria-pressed={isPicked}
              className={`text-left px-4 py-3 rounded-xl border-2 transition text-sm font-medium ${
                isRight
                  ? "bg-leaf border-leaf text-ink"
                  : isWrong
                  ? "bg-destructive/10 border-destructive text-destructive"
                  : "bg-background border-border hover:border-ink"
              }`}
            >
              <span className="inline-flex items-center gap-2">
                {isRight && <Check className="w-3.5 h-3.5 shrink-0" strokeWidth={3} />}
                {opt}
              </span>
            </button>
          );
        })}
      </div>
      {pick !== null && (
        <p className={`mt-4 text-sm px-1 ${ correct ? "text-foreground" : "text-muted-foreground"}`}>
          <span className="font-semibold">{correct ? t.correct : t.wrong}</span>{q.explanation}
        </p>
      )}
    </div>
  );
}

function ArModal({
  spec, label, onClose, t, locale,
}: {
  spec: ShapeSpec;
  label: string;
  onClose: () => void;
  t: TLesson;
  locale: Locale;
}) {
  const [qr, setQr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const arPageUrl = typeof window !== "undefined" && spec.modelUrl
    ? `${window.location.origin}/${locale}/ar?model=${encodeURIComponent(spec.modelUrl)}&title=${encodeURIComponent(label)}`
    : typeof window !== "undefined"
    ? window.location.href
    : "";

  useEffect(() => {
    if (!arPageUrl) return;
    QRCode.toDataURL(arPageUrl, { width: 280, margin: 1, color: { dark: "#1a1a1a", light: "#ffffff" } }).then(setQr);
  }, [arPageUrl]);

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    modalRef.current?.focus();
    return () => prev?.focus();
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function handleCopy() {
    if (!arPageUrl) return;
    navigator.clipboard.writeText(arPageUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleDownloadQr() {
    if (!qr) return;
    const a = document.createElement("a");
    a.href = qr;
    a.download = `lectra-ar-${label.replace(/\s+/g, "-").toLowerCase()}.png`;
    a.click();
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm grid place-items-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={t.arTitle}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="bg-background rounded-3xl max-w-3xl w-full p-6 md:p-8 relative outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 grid place-items-center rounded-full hover:bg-muted transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="grid md:grid-cols-2 gap-6 items-center">
          <div className="aspect-square w-full rounded-2xl bg-sun overflow-hidden">
            {spec.modelUrl ? (
              <ModelViewerAR glbUrl={spec.modelUrl} label={label} className="w-full h-full" />
            ) : (
              <Lesson3D spec={spec} />
            )}
          </div>
          <div>
            <p className="text-xs font-bold tracking-widest text-accent mb-2">{t.arTag} · {label.toUpperCase()}</p>
            <h3 className="font-display text-3xl mb-3 leading-tight">{t.arTitle}</h3>
            <p className="text-muted-foreground text-sm mb-5">{t.arSub}</p>
            <div className="bg-card border border-border rounded-2xl p-4 inline-block mb-4">
              {qr
                ? <img src={qr} alt={`QR code for ${label} AR view`} width={200} height={200} className="rounded" />
                : <div className="w-[200px] h-[200px] bg-muted rounded animate-pulse" aria-label="Loading QR code" />}
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleDownloadQr}
                disabled={!qr}
                className="inline-flex items-center gap-2 text-sm font-semibold hover:underline disabled:opacity-40"
              >
                <Download className="w-4 h-4" /> {t.downloadQr}
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-2 text-sm font-semibold hover:underline"
              >
                <Copy className="w-4 h-4" /> {copied ? t.copied : t.copyLink}
              </button>
              {spec.modelUrl && (
                <a
                  href={arPageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold hover:underline"
                >
                  <ExternalLink className="w-4 h-4" /> {t.openAr}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
