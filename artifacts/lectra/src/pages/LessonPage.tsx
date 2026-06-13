import { Link, useParams } from "wouter";
import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { ArrowLeft, Check, Download, Scan, X, Copy, Printer, RotateCcw, Trophy, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { getLesson, type StoredLesson } from "@/lib/lesson-storage";
import { normalizeLesson, type LessonShape } from "@/lib/lesson-generator";
import { Lesson3D, vertexCount, downloadGlb } from "@/components/lesson-3d";
import { ModelViewerAR } from "@/components/model-viewer-ar";
import { SpriteBook, SpriteScan, SpriteMark, SpriteHeart } from "@/components/sprites";
import { dict, isLocale, type Locale } from "@/lib/i18n";

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
  const params = useParams<{ lang: string; id: string }>();
  const lang = params.lang;
  const id = params.id;
  const locale = (isLocale(lang) ? lang : "id") as Locale;
  const t = dict[locale].lesson;

  const [stored, setStored] = useState<StoredLesson | null | undefined>(undefined);
  const [arSpec, setArSpec] = useState<{ spec: LessonShape; label: string } | null>(null);
  const [copied, setCopied] = useState(false);
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
    try {
      navigator.clipboard.writeText(window.location.href).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } catch {}
  }

  function handlePrint() {
    try { window.print(); } catch {}
  }

  if (stored === undefined) {
    return (
      <div className="min-h-screen grid place-items-center">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.2, repeat: Infinity }}
          className="flex flex-col items-center gap-3 text-muted-foreground"
        >
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "oklch(0.72 0.18 45)", borderTopColor: "transparent" }} />
          <span className="text-sm">{t.loading}</span>
        </motion.div>
      </div>
    );
  }
  if (stored === null) {
    return (
      <div className="min-h-screen grid place-items-center px-6 text-center">
        <div>
          <h1 className="font-display text-3xl mb-3">{t.notFoundTitle}</h1>
          <p className="text-muted-foreground mb-6">{t.notFoundSub}</p>
          <Link href={`/${locale}/create`}>
            <motion.span
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              style={{ background: "oklch(0.72 0.18 45)", color: "white", borderRadius: "9999px", padding: "0.875rem 1.75rem", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
            >
              {t.notFoundCta}
            </motion.span>
          </Link>
        </div>
      </div>
    );
  }

  const lesson = normalizeLesson(stored.lesson);

  return (
    <div className="min-h-screen bg-background">
      {/* Reading progress bar */}
      <motion.div
        className="fixed top-0 left-0 z-50 h-1 rounded-r-full"
        style={{ width: `${progress}%`, background: "oklch(0.72 0.18 45)" }}
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={t.progressLabel}
      />

      <header className="px-6 md:px-12 py-5 border-b border-border sticky top-0 z-40 backdrop-blur-md bg-background/90">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <Link href={`/${locale}`} className="inline-flex items-center gap-2 text-sm font-medium hover:opacity-70 transition-opacity shrink-0">
            <ArrowLeft className="w-4 h-4" /> {t.back}
          </Link>

          <div className="flex items-center gap-2">
            <motion.button
              onClick={handleCopyLink}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border border-border hover:border-ink transition"
              title={t.copyLink}
            >
              <Copy className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{copied ? t.copied : t.copyLink}</span>
            </motion.button>
            <motion.button
              onClick={handlePrint}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border border-border hover:border-ink transition print:hidden"
              title={t.print}
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.print}</span>
            </motion.button>
            <Link href={`/${locale}/create`} className="text-sm font-medium hover:underline hidden sm:inline">{t.newLesson}</Link>
            <div className="flex items-center gap-2 font-display font-bold">
              <SpriteMark className="w-5 h-5" /> Lectra
            </div>
          </div>
        </div>
      </header>

      <article className="max-w-5xl mx-auto px-6 md:px-12 py-12 print:py-6">
        {/* Title block */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 text-xs font-mono mb-4">
            <span className="px-2.5 py-1 rounded-full font-semibold text-background" style={{ background: "oklch(0.18 0.01 60)" }}>{lesson.level}</span>
            <span className="text-muted-foreground">{lesson.duration}</span>
            <span className="text-muted-foreground hidden sm:inline">
              {new Date(stored.createdAt).toLocaleDateString(locale === "id" ? "id-ID" : "en-US", { day: "numeric", month: "short", year: "numeric" })}
            </span>
          </div>
          <h1 className="font-display text-4xl md:text-6xl leading-[1.05] mb-4">{lesson.title}</h1>
          <p className="text-xl text-muted-foreground max-w-3xl">{lesson.subtitle}</p>
        </motion.div>

        {/* Intro card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="rounded-3xl p-8 md:p-10 mb-12 relative overflow-hidden"
          style={{ background: "oklch(0.88 0.16 95)" }}
        >
          <SpriteBook className="absolute -bottom-4 -right-4 w-36 h-36 opacity-60 print:hidden" />
          <p className="text-lg leading-relaxed text-ink max-w-2xl relative">{lesson.intro}</p>
        </motion.div>

        {/* Sections */}
        <div className="space-y-12">
          {lesson.sections.map((s, i) => {
            const bg = CARD_BG[i % CARD_BG.length];
            let verts = 0;
            try { verts = vertexCount(s.shape); } catch { verts = 0; }
            return (
              <motion.section
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6 }}
                className="grid md:grid-cols-5 gap-6 items-start"
              >
                <div className="md:col-span-3">
                  <p className="text-xs font-bold tracking-widest mb-2" style={{ color: "oklch(0.72 0.18 45)" }}>
                    {t.section} {String(i + 1).padStart(2, "0")} / {String(lesson.sections.length).padStart(2, "0")}
                  </p>
                  <h2 className="font-display text-3xl md:text-4xl mb-4 leading-tight">{s.heading}</h2>
                  <p className="text-foreground/80 leading-relaxed mb-5">{s.body}</p>
                  <ul className="space-y-2.5">
                    {s.bullets.map((b, j) => (
                      <motion.li
                        key={j}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: j * 0.07 }}
                        className="flex items-start gap-3"
                      >
                        <div className="w-5 h-5 rounded-full grid place-items-center mt-0.5 shrink-0" style={{ background: "oklch(0.78 0.16 150)" }}>
                          <Check className="w-3 h-3 text-ink" strokeWidth={3} />
                        </div>
                        <span className="text-foreground/90">{b}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>

                <div className="md:col-span-2 print:hidden">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className={`${bg} rounded-3xl p-4 relative`}
                  >
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
                      <motion.button
                        type="button"
                        onClick={() => setArSpec({ spec: s.shape, label: s.shape.label })}
                        disabled={!s.shape.modelUrl}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="rounded-xl py-2.5 text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ background: "oklch(0.18 0.01 60)", color: "white" }}
                      >
                        <Scan className="w-3.5 h-3.5" /> {t.viewAr}
                      </motion.button>
                      <motion.button
                        type="button"
                        disabled={!s.shape.modelUrl}
                        onClick={() => { if (s.shape.modelUrl) downloadGlb(s.shape, s.shape.label || s.heading); }}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="bg-background border-2 border-ink rounded-xl py-2.5 text-xs font-semibold inline-flex items-center justify-center gap-1.5 hover:bg-sun transition disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Download className="w-3.5 h-3.5" /> {t.downloadGlb}
                      </motion.button>
                    </div>
                  </motion.div>
                </div>
              </motion.section>
            );
          })}
        </div>

        {/* Vocabulary */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <SpriteHeart className="w-8 h-8" />
            <h2 className="font-display text-3xl">{t.vocab}</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {lesson.vocabulary.map((v, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -3, boxShadow: "3px 3px 0 var(--ink)" }}
                className="bg-card border border-border rounded-2xl p-5 transition-colors hover:border-ink"
              >
                <p className="font-display text-xl mb-1">{v.term}</p>
                <p className="text-sm text-muted-foreground">{v.meaning}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Quiz */}
        <section className="mt-20">
          <div className="flex items-center gap-3 mb-6">
            <SpriteScan className="w-8 h-8" />
            <h2 className="font-display text-3xl">{t.quiz}</h2>
          </div>
          <QuizSection quiz={lesson.quiz} t={t} locale={locale} />
        </section>
      </article>

      <AnimatePresence>
        {arSpec && <ArModal spec={arSpec.spec} label={arSpec.label} onClose={() => setArSpec(null)} t={t} locale={locale} />}
      </AnimatePresence>
    </div>
  );
}

type QuizQ = { question: string; options: string[]; correctIndex: number; explanation: string };
type TLesson = ReturnType<typeof dictPick>;
function dictPick(l: Locale) { return dict[l].lesson; }

function QuizSection({ quiz, t, locale }: { quiz: QuizQ[]; t: TLesson; locale: Locale }) {
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
          <QuizItem key={i} q={q} index={i} pick={answers[i]}
            onPick={(v) => { const next = [...answers]; next[i] = v; setAnswers(next); }} t={t} />
        ))}
      </div>
      {allDone && !showScore && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 text-center"
        >
          <motion.button
            onClick={() => setShowScore(true)}
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.97 }}
            style={{ background: "oklch(0.72 0.18 45)", color: "white", borderRadius: "9999px", padding: "0.875rem 1.75rem", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "0.5rem", boxShadow: "0 4px 0 oklch(0.55 0.18 40)" }}
          >
            <Trophy className="w-4 h-4" /> {t.quizScore}
          </motion.button>
        </motion.div>
      )}
      <AnimatePresence>
        {showScore && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="mt-8 rounded-3xl p-8 text-center"
            style={{ background: "oklch(0.88 0.16 95)" }}
          >
            <motion.div animate={{ rotate: [0, -10, 10, -5, 5, 0] }} transition={{ duration: 0.6 }}>
              <Trophy className="w-10 h-10 mx-auto mb-3 text-ink" />
            </motion.div>
            <p className="font-display text-4xl mb-1">
              {score} <span className="text-2xl font-normal text-ink/60">{t.quizScoreOf} {quiz.length}</span>
            </p>
            <div className="flex gap-2 items-center justify-center mt-4">
              {quiz.map((q, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.1, type: "spring" }}
                  className={`w-3 h-3 rounded-full border-2 border-ink`}
                  style={{ background: answers[i] === q.correctIndex ? "oklch(0.78 0.16 150)" : "oklch(0.82 0.10 20)" }}
                  title={`Q${i + 1}`}
                />
              ))}
            </div>
            <button onClick={handleRetry} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold hover:underline">
              <RotateCcw className="w-4 h-4" /> {t.quizRetry}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function QuizItem({ q, index, pick, onPick, t }: { q: QuizQ; index: number; pick: number | null; onPick: (i: number) => void; t: TLesson }) {
  const correct = pick === q.correctIndex;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-card border border-border rounded-2xl p-6 transition hover:border-ink/40"
    >
      <p className="font-display text-lg mb-4">{index + 1}. {q.question}</p>
      <div className="grid sm:grid-cols-2 gap-2.5">
        {q.options.map((opt, i) => {
          const isPicked = pick === i;
          const isRight = pick !== null && i === q.correctIndex;
          const isWrong = isPicked && i !== q.correctIndex;
          return (
            <motion.button
              key={i}
              disabled={pick !== null}
              onClick={() => onPick(i)}
              whileHover={pick === null ? { scale: 1.02, y: -1 } : {}}
              whileTap={pick === null ? { scale: 0.98 } : {}}
              aria-pressed={isPicked}
              className="text-left px-4 py-3 rounded-xl border-2 transition text-sm font-medium"
              style={{
                background: isRight ? "oklch(0.78 0.16 150)" : isWrong ? "oklch(0.85 0.08 20)" : "transparent",
                borderColor: isRight ? "oklch(0.78 0.16 150)" : isWrong ? "oklch(0.62 0.22 25)" : "oklch(0.88 0.015 70)",
                color: isRight ? "oklch(0.18 0.01 60)" : isWrong ? "oklch(0.62 0.22 25)" : undefined,
              }}
            >
              <span className="inline-flex items-center gap-2">
                {isRight && <Check className="w-3.5 h-3.5 shrink-0" strokeWidth={3} />}
                {opt}
              </span>
            </motion.button>
          );
        })}
      </div>
      {pick !== null && (
        <motion.p
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className={`mt-4 text-sm px-1 ${correct ? "text-foreground" : "text-muted-foreground"}`}
        >
          <span className="font-semibold">{correct ? t.correct : t.wrong}</span>{q.explanation}
        </motion.p>
      )}
    </motion.div>
  );
}

function ArModal({ spec, label, onClose, t, locale }: { spec: LessonShape; label: string; onClose: () => void; t: TLesson; locale: Locale }) {
  const [qr, setQr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const arPageUrl = typeof window !== "undefined" && spec.modelUrl
    ? `${window.location.origin}/${locale}/ar?model=${encodeURIComponent(spec.modelUrl)}&title=${encodeURIComponent(label)}`
    : typeof window !== "undefined" ? window.location.href : "";

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
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function handleCopy() {
    if (!arPageUrl) return;
    navigator.clipboard.writeText(arPageUrl).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }

  function handleDownloadQr() {
    if (!qr) return;
    const a = document.createElement("a");
    a.href = qr; a.download = `lectra-ar-${label.replace(/\s+/g, "-").toLowerCase()}.png`; a.click();
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm grid place-items-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        ref={modalRef}
        tabIndex={-1}
        className="bg-background rounded-3xl max-w-3xl w-full p-6 md:p-8 relative outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        <motion.button
          type="button"
          onClick={onClose}
          whileHover={{ scale: 1.1, rotate: 90 }}
          transition={{ duration: 0.2 }}
          className="absolute top-4 right-4 w-9 h-9 grid place-items-center rounded-full hover:bg-muted transition"
        >
          <X className="w-5 h-5" />
        </motion.button>
        <div className="grid md:grid-cols-2 gap-6 items-center">
          <div className="aspect-square w-full rounded-2xl bg-sun overflow-hidden">
            {spec.modelUrl
              ? <ModelViewerAR glbUrl={spec.modelUrl} label={label} className="w-full h-full" />
              : <Lesson3D spec={spec} />
            }
          </div>
          <div>
            <p className="text-xs font-bold tracking-widest mb-2" style={{ color: "oklch(0.72 0.18 45)" }}>{t.arTag} · {label.toUpperCase()}</p>
            <h3 className="font-display text-3xl mb-3 leading-tight">{t.arTitle}</h3>
            <p className="text-muted-foreground text-sm mb-5">{t.arSub}</p>
            <div className="bg-card border border-border rounded-2xl p-4 inline-block mb-4">
              {qr
                ? <img src={qr} alt={`QR code for ${label} AR view`} width={200} height={200} className="rounded" />
                : <div className="w-[200px] h-[200px] bg-muted rounded animate-pulse" />}
            </div>
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={handleDownloadQr} disabled={!qr}
                className="inline-flex items-center gap-2 text-sm font-semibold hover:underline disabled:opacity-40">
                <Download className="w-4 h-4" /> {t.downloadQr}
              </button>
              <button type="button" onClick={handleCopy}
                className="inline-flex items-center gap-2 text-sm font-semibold hover:underline">
                <Copy className="w-4 h-4" /> {copied ? t.copied : t.copyLink}
              </button>
              {spec.modelUrl && (
                <a href={arPageUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold hover:underline">
                  <ExternalLink className="w-4 h-4" /> {t.openAr}
                </a>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default LessonPage;
