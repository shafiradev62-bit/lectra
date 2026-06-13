import { Link, useParams, useLocation } from "wouter";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, ArrowRight, Loader2, Clock, Trash2, ChevronRight, Camera, Type, Upload, X } from "lucide-react";
import { generateLocalLesson } from "@/lib/lesson-generator";
import { generateFromPhotos } from "@/lib/ar3d-client";
import { saveLesson, listLessons, deleteLesson, type StoredLesson } from "@/lib/lesson-storage";
import { staggerFadeIn } from "@/lib/animations";
import {
  SpriteBiology, SpritePlanet, SpriteAtom, SpriteFlask,
  SpriteCompass, SpritePillar, SpriteGlobe, SpriteBone, SpriteMark,
} from "@/components/sprites";
import { dict, isLocale, type Locale } from "@/lib/i18n";

const SPRITES = [SpriteBiology, SpritePlanet, SpriteAtom, SpriteFlask, SpriteCompass, SpritePillar, SpriteGlobe, SpriteBone];
const MAX_CHARS = 500;
type CreateMode = "topic" | "photo";

function CreatePage() {
  const params = useParams<{ lang: string }>();
  const lang = params.lang;
  const locale = (isLocale(lang) ? lang : "id") as Locale;
  const t = dict[locale].create;
  const [, setLocation] = useLocation();

  const [mode, setMode] = useState<CreateMode>("topic");
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState(t.levels[1]);
  const [photos, setPhotos] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<StoredLesson[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try { setHistory(listLessons()); } catch { setHistory([]); }
  }, []);

  useEffect(() => {
    if (!loading) { setLoadingStep(0); return; }
    const id = setInterval(() => setLoadingStep((s) => (s + 1) % t.loadingSteps.length), 900);
    return () => clearInterval(id);
  }, [loading, t.loadingSteps.length]);

  useEffect(() => {
    if (suggestionsRef.current) staggerFadeIn(".suggestion-chip");
  }, [mode]);

  async function onSubmitTopic(e: React.FormEvent) {
    e.preventDefault();
    if (!topic.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      const lesson = await generateLocalLesson(topic.trim(), locale, level);
      const saved = saveLesson(topic.trim(), lesson);
      setLocation(`/${locale}/lesson/${saved.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.error);
    } finally {
      setLoading(false);
    }
  }

  async function onSubmitPhotos(e: React.FormEvent) {
    e.preventDefault();
    if (photos.length < 1 || loading) return;
    setLoading(true);
    setError(null);
    try {
      const model = await generateFromPhotos(photos);
      if (!model) throw new Error(t.error);
      const label = topic.trim() || (locale === "id" ? "Objek 3D Scan" : "3D Object Scan");
      const lesson = await generateLocalLesson(label, locale, level, model);
      const saved = saveLesson(label, lesson);
      setLocation(`/${locale}/lesson/${saved.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.error);
    } finally {
      setLoading(false);
    }
  }

  function handlePhotosSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    setPhotos((prev) => [...prev, ...files].slice(0, 8));
    e.target.value = "";
  }

  function removePhoto(i: number) {
    setPhotos((prev) => prev.filter((_, idx) => idx !== i));
  }

  function handleSuggestion(label: string) {
    setTopic(label);
    setMode("topic");
    textareaRef.current?.focus();
  }

  function handleDeleteHistory(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    deleteLesson(id);
    setHistory(listLessons());
  }

  const charsLeft = MAX_CHARS - topic.length;

  return (
    <div className="min-h-screen bg-background">
      <header className="px-6 md:px-12 py-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href={`/${locale}`} className="inline-flex items-center gap-2 text-sm font-medium hover:opacity-70 transition-opacity">
            <ArrowLeft className="w-4 h-4" /> {t.back}
          </Link>
          <div className="flex items-center gap-2 font-display font-bold">
            <SpriteMark className="w-5 h-5" /> Lectra
          </div>
        </div>
      </header>

      <main className="px-6 md:px-12 pb-24">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <h1 className="font-display text-4xl md:text-6xl leading-tight mb-4">
              {t.heading1}<em className="not-italic" style={{ color: "oklch(0.72 0.18 45)" }}>{t.headingEm}</em>?
            </h1>
            <p className="text-muted-foreground">{t.sub}</p>
          </motion.div>

          {/* Mode toggle */}
          <div className="flex gap-2 mb-6 p-1 bg-muted rounded-2xl">
            {(["topic", "photo"] as CreateMode[]).map((m) => (
              <motion.button
                key={m}
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={() => setMode(m)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition ${
                  mode === m ? "text-background shadow-md" : "text-muted-foreground hover:text-foreground"
                }`}
                style={mode === m ? { background: "oklch(0.18 0.01 60)" } : {}}
              >
                {m === "topic" ? <Type className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
                {m === "topic" ? t.topicMode : t.photoMode}
              </motion.button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {mode === "topic" ? (
              <motion.form
                key="topic"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={onSubmitTopic}
                className="bg-card border-2 border-ink rounded-3xl p-6 md:p-8"
                style={{ boxShadow: "8px 8px 0 var(--ink)" }}
              >
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold" htmlFor="topic-input">{t.topicLabel}</label>
                  <span className={`text-xs tabular-nums ${charsLeft < 80 ? "text-destructive font-semibold" : "text-muted-foreground"}`}>
                    {charsLeft} {t.charCount}
                  </span>
                </div>
                <textarea
                  id="topic-input"
                  ref={textareaRef}
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder={t.topicPlaceholder}
                  rows={3}
                  maxLength={MAX_CHARS}
                  className="w-full bg-background border border-border rounded-2xl px-4 py-3 text-base resize-none focus:outline-none focus:ring-2 focus:ring-accent transition"
                  disabled={loading}
                />
                <LevelPicker levels={t.levels} level={level} setLevel={setLevel} label={t.levelLabel} disabled={loading} />
                {error && <Alert error={error} />}
                <SubmitButton loading={loading} disabled={!topic.trim()} label={t.submit} loadingLabel={t.loadingSteps[loadingStep]} steps={t.loadingSteps.length} step={loadingStep} />
              </motion.form>
            ) : (
              <motion.form
                key="photo"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={onSubmitPhotos}
                className="bg-card border-2 border-ink rounded-3xl p-6 md:p-8"
                style={{ boxShadow: "8px 8px 0 var(--ink)" }}
              >
                <label className="block text-sm font-semibold mb-1">{t.photoLabel}</label>
                <p className="text-xs text-muted-foreground mb-4">{t.photoHint}</p>
                <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotosSelected} />
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading || photos.length >= 8}
                  className="w-full border-2 border-dashed border-border rounded-2xl py-10 flex flex-col items-center gap-2 hover:border-accent hover:bg-sun/20 transition disabled:opacity-50"
                >
                  <Upload className="w-8 h-8 text-muted-foreground" />
                  <span className="text-sm font-medium">{photos.length}/8 photos</span>
                </motion.button>
                {photos.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {photos.map((f, i) => (
                      <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-border">
                        <img src={URL.createObjectURL(f)} alt="" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removePhoto(i)}
                          className="absolute top-0.5 right-0.5 w-5 h-5 text-background rounded-full grid place-items-center"
                          style={{ background: "oklch(0.18 0.01 60)" }}>
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder={t.topicPlaceholder}
                  className="w-full mt-4 bg-background border border-border rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  disabled={loading}
                />
                <LevelPicker levels={t.levels} level={level} setLevel={setLevel} label={t.levelLabel} disabled={loading} />
                {error && <Alert error={error} />}
                <SubmitButton loading={loading} disabled={photos.length < 1} label={t.photoSubmit} loadingLabel={t.loadingSteps[loadingStep]} steps={t.loadingSteps.length} step={loadingStep} />
              </motion.form>
            )}
          </AnimatePresence>

          <div ref={suggestionsRef} className="mt-10">
            <p className="text-sm font-semibold text-muted-foreground mb-4 text-center">{t.suggestionsLabel}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {t.suggestions.map((label, i) => {
                const S = SPRITES[i % SPRITES.length];
                return (
                  <motion.button
                    key={label}
                    type="button"
                    className="suggestion-chip group bg-card border border-border rounded-2xl p-4 text-left transition disabled:opacity-50 opacity-0"
                    whileHover={{ y: -4, boxShadow: "4px 4px 0 var(--ink)", borderColor: "var(--ink)" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSuggestion(label)}
                    disabled={loading}
                  >
                    <S className="w-10 h-10 mb-2" />
                    <span className="text-sm font-medium leading-tight block">{label}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {history.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-12">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm font-semibold text-muted-foreground">{t.historyLabel}</p>
              </div>
              <div className="space-y-2">
                {history.slice(0, 5).map((item) => (
                  <motion.div
                    key={item.id}
                    whileHover={{ x: 4 }}
                    className="group flex items-center justify-between bg-card border border-border rounded-2xl px-4 py-3 hover:border-ink transition"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{item.topic}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(item.createdAt).toLocaleDateString(locale === "id" ? "id-ID" : "en-US", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 ml-3">
                      <button type="button" onClick={(e) => handleDeleteHistory(item.id, e)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <Link href={`/${locale}/lesson/${item.id}`} className="p-1.5 rounded-lg hover:bg-muted transition">
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}

function LevelPicker({ levels, level, setLevel, label, disabled }: { levels: string[]; level: string; setLevel: (v: string) => void; label: string; disabled: boolean }) {
  return (
    <>
      <label className="block text-sm font-semibold mt-5 mb-2">{label}</label>
      <div className="flex flex-wrap gap-2">
        {levels.map((l) => (
          <motion.button
            key={l}
            type="button"
            onClick={() => setLevel(l)}
            disabled={disabled}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 rounded-full text-sm font-medium border transition"
            style={level === l
              ? { background: "oklch(0.18 0.01 60)", color: "oklch(0.97 0.012 85)", border: "1.5px solid oklch(0.18 0.01 60)" }
              : { background: "transparent", border: "1.5px solid oklch(0.88 0.015 70)" }
            }
          >
            {l}
          </motion.button>
        ))}
      </div>
    </>
  );
}

function Alert({ error }: { error: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      role="alert"
      className="mt-5 px-4 py-3 rounded-xl bg-destructive/10 text-destructive text-sm"
    >
      {error}
    </motion.div>
  );
}

function SubmitButton({ loading, disabled, label, loadingLabel, steps, step }: { loading: boolean; disabled: boolean; label: string; loadingLabel: string; steps: number; step: number }) {
  return (
    <>
      <motion.button
        type="submit"
        disabled={disabled || loading}
        whileHover={disabled ? {} : { scale: 1.01, y: -2 }}
        whileTap={disabled ? {} : { scale: 0.99 }}
        className="w-full justify-center mt-6 disabled:opacity-60 disabled:cursor-not-allowed"
        style={{
          background: "oklch(0.72 0.18 45)",
          color: "white",
          borderRadius: "9999px",
          padding: "0.875rem 1.75rem",
          fontWeight: 700,
          fontSize: "1rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.5rem",
          boxShadow: "0 4px 0 oklch(0.55 0.18 40)",
        }}
      >
        {loading
          ? <><Loader2 className="w-4 h-4 animate-spin" />{loadingLabel}</>
          : <>{label} <ArrowRight className="w-4 h-4" /></>
        }
      </motion.button>
      {loading && (
        <div className="mt-3 h-1 rounded-full bg-border overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: "oklch(0.72 0.18 45)" }}
            animate={{ width: `${((step + 1) / steps) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      )}
    </>
  );
}

export default CreatePage;
