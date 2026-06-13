import { Link, useParams, useLocation } from "wouter";
import { Check, ArrowRight, Scan, Play, Globe, Menu, X, ExternalLink, BookOpen, Zap } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "motion/react";
import { animate, stagger } from "animejs";
import {
  SpriteBiology, SpritePlanet, SpriteAtom, SpriteFlask,
  SpriteCompass, SpritePillar, SpriteGlobe, SpriteBone,
  SpriteMark, SpriteHeart, SpriteSquiggle,
  SpriteRocket, SpriteDino, SpriteAstronaut, SpriteStar,
  BlobSun, BlobLeaf, BlobBlush,
} from "@/components/sprites";
import heroImg from "@/assets/hero-teacher.png";
import card3d from "@/assets/card-3d.jpg";
import cardAr from "@/assets/card-ar.jpg";
import { dict, isLocale, type Locale } from "@/lib/i18n";

type T = ReturnType<typeof tFor>;
function tFor(l: Locale) { return dict[l]; }

const SUBJECT_SPRITES = [SpriteBiology, SpritePlanet, SpriteAtom, SpriteFlask, SpriteCompass, SpritePillar, SpriteGlobe, SpriteBone];

function useScrolled(threshold = 10) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > threshold); }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return scrolled;
}

function Logo() {
  return (
    <span className="flex items-center gap-2 font-display text-2xl font-bold tracking-tight">
      <SpriteMark className="w-7 h-7" />
      Lectra
    </span>
  );
}

function LangSwitch({ locale }: { locale: Locale }) {
  const other: Locale = locale === "id" ? "en" : "id";
  return (
    <Link href={`/${other}`}>
      <motion.span
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="inline-flex items-center gap-1.5 text-sm font-semibold rounded-full border border-border px-3 py-1.5 hover:bg-secondary transition-colors cursor-pointer"
        aria-label="Switch language"
      >
        <motion.span
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
        >
          <Globe className="w-3.5 h-3.5" />
        </motion.span>
        {other.toUpperCase()}
      </motion.span>
    </Link>
  );
}

function Nav({ locale, t }: { locale: Locale; t: T }) {
  const scrolled = useScrolled();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [, setLocation] = useLocation();

  useEffect(() => {
    function onResize() { if (window.innerWidth >= 768) setMobileOpen(false); }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const navLinks = [
    { href: "#features", label: t.nav.features },
    { href: "#resources", label: locale === "id" ? "Referensi" : "Resources" },
    { href: "#showcase", label: t.nav.showcase },
    { href: "#pricing", label: t.nav.pricing },
  ];

  return (
    <header className={`px-6 md:px-12 py-5 sticky top-0 z-40 transition-all duration-200 ${scrolled ? "backdrop-blur-md bg-background/90 border-b border-border shadow-sm" : "bg-transparent"}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href={`/${locale}`}><Logo /></Link>

        <nav className="hidden md:flex items-center gap-10 text-sm font-medium text-foreground/80">
          {navLinks.map((l) => (
            <a key={l.href} href={l.href} className="hover:text-foreground transition-colors">{l.label}</a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LangSwitch locale={locale} />
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setLocation(`/${locale}/create`)}
            className="btn-orange text-sm hidden sm:inline-flex"
            style={{ background: "oklch(0.72 0.18 45)", color: "white", padding: "0.75rem 1.5rem", borderRadius: "9999px", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
          >
            {t.nav.cta}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="md:hidden w-9 h-9 grid place-items-center rounded-full border border-border hover:bg-secondary transition"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={t.nav.menu}
          >
            <motion.div animate={mobileOpen ? { rotate: 90 } : { rotate: 0 }} transition={{ duration: 0.3 }}>
              {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </motion.div>
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden mt-3 pb-4 border-t border-border pt-4 flex flex-col gap-3"
          >
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} className="text-sm font-medium py-1.5 px-2 rounded-lg hover:bg-secondary transition" onClick={() => setMobileOpen(false)}>{l.label}</a>
            ))}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => { setMobileOpen(false); setLocation(`/${locale}/create`); }}
              style={{ background: "oklch(0.72 0.18 45)", color: "white", borderRadius: "9999px", padding: "0.75rem 1.5rem", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
            >
              {t.nav.cta}
            </motion.button>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

function Hero({ locale, t }: { locale: Locale; t: T }) {
  const [, setLocation] = useLocation();
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (heroRef.current) {
      animate(".hero-char", {
        opacity: [0, 1],
        translateY: [20, 0],
        delay: stagger(30),
        duration: 600,
        easing: "easeOutExpo",
      });
    }
  }, []);

  return (
    <section className="px-6 md:px-12 pt-10 pb-20 overflow-hidden" ref={heroRef}>
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl leading-[1.02] mb-6">
              {t.hero.title1}<em className="not-italic" style={{ color: "oklch(0.72 0.18 45)" }}>{t.hero.titleEm}</em>{t.hero.title2}
            </h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="text-lg text-muted-foreground max-w-xl mb-8 leading-relaxed"
          >
            {t.hero.subtitle}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="flex flex-wrap items-center gap-3 mb-10"
          >
            <motion.button
              whileHover={{ scale: 1.06, y: -3 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setLocation(`/${locale}/create`)}
              style={{ background: "oklch(0.72 0.18 45)", color: "white", borderRadius: "9999px", padding: "0.875rem 1.75rem", fontWeight: 700, fontSize: "1rem", display: "inline-flex", alignItems: "center", gap: "0.5rem", boxShadow: "0 4px 0 oklch(0.55 0.18 40)" }}
            >
              {t.hero.primary} <ArrowRight className="w-4 h-4" />
            </motion.button>
            <motion.a
              href="#showcase"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              style={{ background: "oklch(0.78 0.16 150)", color: "oklch(0.18 0.01 60)", borderRadius: "9999px", padding: "0.875rem 1.75rem", fontWeight: 700, fontSize: "1rem", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
            >
              <Play className="w-4 h-4" fill="currentColor" /> {t.hero.demo}
            </motion.a>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center gap-4"
          >
            <div className="flex -space-x-2">
              {["#f5c542", "#7ec97a", "#f4a8b8", "#88b8e8"].map((c) => (
                <motion.div
                  key={c}
                  whileHover={{ scale: 1.2, zIndex: 10 }}
                  className="w-9 h-9 rounded-full border-2 border-background"
                  style={{ background: c }}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <SpriteHeart className="w-7 h-7" />
              <p className="text-xs text-muted-foreground max-w-[200px] leading-snug">{t.hero.social}</p>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <BlobSun className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[42%] w-[390px] h-[350px] opacity-75 -rotate-[4deg] pointer-events-none" />
          <BlobLeaf className="absolute top-8 right-8 w-28 h-28 opacity-80 rotate-[7deg] pointer-events-none" />
          <BlobBlush className="absolute bottom-14 left-1 w-20 h-20 opacity-80 -rotate-12 pointer-events-none" />

          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <img src={heroImg} alt="Teacher with Lectra" width={1024} height={1024} className="relative w-full max-w-md mx-auto" />
          </motion.div>

          {/* 3D sticker */}
          <motion.div
            className="absolute top-2 -left-4 md:left-0 -rotate-6 w-[148px]"
            animate={{ rotate: [-6, -4, -6], y: [0, -4, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <svg viewBox="0 0 148 110" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full drop-shadow-md">
              <path d="M6 18 Q 7 5 20 4 L 132 6 Q 144 7 143 20 L 141 92 Q 140 104 127 105 L 18 103 Q 6 102 7 89 Z" fill="#fffbf0" stroke="#1a1a1a" strokeWidth="2.5" strokeLinejoin="round"/>
              <path d="M14 22 Q 15 14 22 14 L 126 16 Q 133 16 132 23 L 131 70 Q 130 77 123 77 L 23 75 Q 16 75 15 68 Z" fill="#f5c542" stroke="#1a1a1a" strokeWidth="2"/>
              <path d="M50 28 L 74 22 L 98 28 L 98 58 L 74 64 L 50 58 Z" fill="#f4a26b" stroke="#1a1a1a" strokeWidth="2.2" strokeLinejoin="round"/>
              <path d="M74 22 L 74 52 M 74 52 L 50 58 M 74 52 L 98 58" stroke="#1a1a1a" strokeWidth="1.8" fill="none"/>
              <path d="M118 30 L 121 38 L 129 38 L 123 43 L 125 51 L 118 47 L 111 51 L 113 43 L 107 38 L 115 38 Z" fill="#fff" stroke="#1a1a1a" strokeWidth="1.5"/>
              <path d="M22 84 Q 22 80 26 80 L 90 81 Q 94 81 94 84 L 94 96 Q 94 99 90 99 L 26 98 Q 22 98 22 95 Z" fill="#fff" stroke="#1a1a1a" strokeWidth="1.5"/>
              <text x="30" y="93" fontFamily="monospace" fontSize="9" fontWeight="bold" fill="#1a1a1a">cell.obj · 824 verts</text>
            </svg>
          </motion.div>

          {/* AR sticker */}
          <motion.div
            className="absolute bottom-4 -right-4 md:right-0 rotate-5 w-[148px]"
            animate={{ rotate: [5, 8, 5], y: [0, 5, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <svg viewBox="0 0 148 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full drop-shadow-md">
              <path d="M8 16 Q 9 4 22 5 L 130 7 Q 142 8 141 21 L 139 100 Q 138 112 125 111 L 20 109 Q 8 108 9 95 Z" fill="#fffbf0" stroke="#1a1a1a" strokeWidth="2.5" strokeLinejoin="round"/>
              <path d="M16 22 Q 17 14 24 14 L 124 16 Q 131 16 130 23 L 129 75 Q 128 82 121 82 L 25 80 Q 18 80 17 73 Z" fill="#7ec97a" stroke="#1a1a1a" strokeWidth="2"/>
              <path d="M34 30 V 24 Q 34 20 38 20 H 44" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
              <path d="M110 30 V 24 Q 110 20 106 20 H 100" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
              <path d="M34 66 V 72 Q 34 76 38 76 H 44" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
              <path d="M110 66 V 72 Q 110 76 106 76 H 100" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
              <path d="M58 62 Q 56 50 62 44 Q 68 38 76 42 Q 84 46 84 54 Q 84 62 78 66 Q 72 68 68 64 L 64 70 Z" fill="#fff" stroke="#1a1a1a" strokeWidth="2" strokeLinejoin="round"/>
              <circle cx="71" cy="46" r="2" fill="#1a1a1a"/>
              <path d="M36 48 Q 52 44 74 48 Q 96 52 112 48" stroke="#1a1a1a" strokeWidth="2" fill="none" strokeLinecap="round"/>
              <path d="M22 89 Q 22 85 26 85 L 122 86 Q 126 86 126 89 L 126 103 Q 126 107 122 107 L 26 106 Q 22 106 22 103 Z" fill="#fff" stroke="#1a1a1a" strokeWidth="1.5"/>
              <text x="36" y="100" fontFamily="monospace" fontSize="9" fontWeight="bold" fill="#1a1a1a">{t.hero.badge2}</text>
            </svg>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function Subjects({ locale, t }: { locale: Locale; t: T }) {
  const [, setLocation] = useLocation();
  return (
    <section className="px-6 md:px-12 pb-20">
      <div className="max-w-7xl mx-auto">
        <SpriteSquiggle className="w-32 h-6 mx-auto mb-6 text-ink/60" />
        <p className="text-center font-display text-2xl md:text-3xl mb-8">{t.subjects.heading}</p>
        <div className="flex flex-wrap justify-center gap-3">
          {t.subjects.items.map((label, i) => {
            const S = SUBJECT_SPRITES[i];
            return (
              <motion.button
                key={label}
                type="button"
                onClick={() => setLocation(`/${locale}/create`)}
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300 }}
                style={{ background: "white", border: "1.5px solid oklch(0.88 0.015 70)", borderRadius: "9999px", padding: "0.5rem 1rem", fontSize: "0.875rem", fontWeight: 500, display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
              >
                <motion.div whileHover={{ rotate: 10, scale: 1.2 }} transition={{ type: "spring", stiffness: 400 }}>
                  <S className="w-6 h-6" />
                </motion.div>
                {label}
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function WhyLectra({ t }: { t: T }) {
  const colors = ["bg-sun", "bg-leaf", "bg-blush", "bg-sky", "bg-sun", "bg-leaf"];
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="features" className="px-6 md:px-12 py-20 bg-card border-y border-border" ref={ref}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="font-display text-4xl md:text-5xl mb-4">{t.why.heading}</h2>
          <p className="text-muted-foreground">{t.why.sub}</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {t.why.cards.map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <FeatureCard color={colors[i]} {...c} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ color, tag, title, desc, chip1, chip2 }: { color: string; tag: string; title: string; desc: string; chip1?: string; chip2?: string }) {
  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: "6px 6px 0 var(--ink)" }}
      transition={{ type: "spring", stiffness: 300 }}
      className={`${color} rounded-3xl p-7 relative overflow-hidden cursor-default`}
    >
      <p className="text-[10px] font-bold tracking-[0.15em] text-ink/60 mb-4">{tag}</p>
      <h3 className="font-display text-2xl text-ink mb-3 leading-tight">{title}</h3>
      <p className="text-sm text-ink/75 leading-relaxed mb-6">{desc}</p>
      <div className="relative h-12">
        {chip1 && <span className="absolute left-0 top-0 bg-card border border-border rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm -rotate-2">{chip1}</span>}
        {chip2 && <span className="absolute right-2 top-5 bg-card border border-border rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm rotate-3">{chip2}</span>}
      </div>
    </motion.div>
  );
}

const WORLD_RESOURCES = [
  {
    name: "Khan Academy",
    desc: { id: "Video & latihan gratis K-12 seluruh dunia", en: "Free K-12 video lessons & exercises worldwide" },
    color: "#f5c542", sprite: "academy", url: "https://khanacademy.org", tag: "Math · Science · Art",
    topics: [
      { id: "Sistem Tata Surya", en: "Solar System" },
      { id: "Segitiga Pythagoras", en: "Pythagorean Triangle" },
      { id: "Sel Darah Merah", en: "Red Blood Cell" },
    ],
  },
  {
    name: "BBC Bitesize",
    desc: { id: "Materi kurikulum Inggris lengkap", en: "UK curriculum learning materials" },
    color: "#88b8e8", sprite: "bbc", url: "https://bbc.co.uk/bitesize", tag: "K-12 · GCSE · A-Level",
    topics: [
      { id: "Rangka Manusia", en: "Human Skeleton" },
      { id: "Siklus Air", en: "Water Cycle" },
      { id: "Atom Hidrogen", en: "Hydrogen Atom" },
    ],
  },
  {
    name: "CK-12",
    desc: { id: "Buku pelajaran digital & simulasi FlexBook", en: "Free digital textbooks & FlexBook simulations" },
    color: "#a8d89a", sprite: "ck12", url: "https://ck12.org", tag: "STEM · Interactive",
    topics: [
      { id: "DNA Double Helix", en: "DNA Double Helix" },
      { id: "Gunung Berapi", en: "Volcano" },
      { id: "Jantung Manusia", en: "Human Heart" },
    ],
  },
  {
    name: "OpenStax",
    desc: { id: "Buku teks perguruan tinggi gratis peer-review", en: "Free peer-reviewed college textbooks" },
    color: "#f4a8b8", sprite: "open", url: "https://openstax.org", tag: "College · University",
    topics: [
      { id: "Neuron Saraf", en: "Neuron Cell" },
      { id: "Kristal Garam NaCl", en: "NaCl Crystal" },
      { id: "Orbit Elektron", en: "Electron Orbit" },
    ],
  },
  {
    name: "PhET Simulations",
    desc: { id: "Simulasi sains interaktif dari Univ. Colorado", en: "Interactive science simulations — Univ. Colorado" },
    color: "#f5c542", sprite: "phet", url: "https://phet.colorado.edu", tag: "Physics · Chem · Bio",
    topics: [
      { id: "Molekul Air H2O", en: "Water Molecule H2O" },
      { id: "Magnet Batang", en: "Bar Magnet" },
      { id: "Prisma Pelangi", en: "Rainbow Prism" },
    ],
  },
  {
    name: "TED-Ed",
    desc: { id: "Pelajaran animasi dari para ahli dunia", en: "Animated lessons from world experts" },
    color: "#88b8e8", sprite: "ted", url: "https://ed.ted.com", tag: "All subjects · Video",
    topics: [
      { id: "Otak Manusia", en: "Human Brain" },
      { id: "Rantai Makanan", en: "Food Chain" },
      { id: "Siklus Karbon", en: "Carbon Cycle" },
    ],
  },
  {
    name: "Crash Course",
    desc: { id: "Video edukasi cepat & menyenangkan", en: "Fast, fun educational video series" },
    color: "#a8d89a", sprite: "crash", url: "https://thecrashcourse.com", tag: "YouTube · Free",
    topics: [
      { id: "Mitokondria Sel", en: "Cell Mitochondria" },
      { id: "Lempeng Tektonik", en: "Tectonic Plate" },
      { id: "Atom Karbon", en: "Carbon Atom" },
    ],
  },
  {
    name: "Nat Geo Education",
    desc: { id: "Konten geografi & sains dari National Geographic", en: "Geography & science content from Nat Geo" },
    color: "#f4a8b8", sprite: "geo", url: "https://education.nationalgeographic.org", tag: "Geography · Science",
    topics: [
      { id: "Terumbu Karang", en: "Coral Reef" },
      { id: "Gunung Everest", en: "Mount Everest" },
      { id: "Aurora Borealis", en: "Aurora Borealis" },
    ],
  },
];

const ResourceSprites = [SpriteRocket, SpriteDino, SpriteAstronaut, SpriteStar, SpriteBiology, SpriteAtom, SpritePlanet, SpriteFlask];

function WorldResources({ locale }: { locale: Locale }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="resources" className="px-6 md:px-12 py-24" ref={ref}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full border border-border bg-card text-sm font-semibold">
              <BookOpen className="w-4 h-4" style={{ color: "oklch(0.72 0.18 45)" }} />
              {locale === "id" ? "Referensi Dunia" : "World Learning Resources"}
            </div>
            <h2 className="font-display text-4xl md:text-5xl mb-4">
              {locale === "id" ? "Sumber belajar terbaik" : "Best learning sources"}
              <br />
              <em className="not-italic" style={{ color: "oklch(0.72 0.18 45)" }}>
                {locale === "id" ? "dari seluruh dunia" : "from around the world"}
              </em>
            </h2>
            <p className="text-muted-foreground">
              {locale === "id"
                ? "Semua gratis. Gunakan langsung di kelasmu — Lectra integrasikan topik ini menjadi materi 3D & AR interaktif."
                : "All free. Use directly in your classroom — Lectra turns these topics into interactive 3D & AR lessons."}
            </p>
          </motion.div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {WORLD_RESOURCES.map((r, i) => {
            const Sprite = ResourceSprites[i % ResourceSprites.length];
            return (
              <motion.div
                key={r.name}
                initial={{ opacity: 0, y: 24 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                whileHover={{ y: -4, boxShadow: "4px 4px 0 var(--ink)" }}
                className="bg-card border-2 border-border rounded-3xl p-5 flex flex-col gap-3 transition-all hover:border-ink"
              >
                {/* Header — links to external site */}
                <a href={r.url} target="_blank" rel="noopener noreferrer" className="flex items-start justify-between group">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: r.color + "66" }}>
                    <Sprite className="w-8 h-8" />
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition mt-1" />
                </a>
                <div>
                  <p className="font-display text-lg leading-tight mb-0.5">{r.name}</p>
                  <p className="text-xs text-muted-foreground leading-snug">{r.desc[locale as "id" | "en"]}</p>
                </div>
                {/* Real 3D topic chips — each generates a real lesson */}
                <div className="flex flex-col gap-1.5 mt-auto">
                  <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">
                    {locale === "id" ? "Buat model 3D dari:" : "Generate 3D model:"}
                  </p>
                  {r.topics.map((tp) => (
                    <Link
                      key={tp.en}
                      href={`/${locale}/create?topic=${encodeURIComponent(locale === "id" ? tp.id : tp.en)}`}
                      className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl border border-border text-xs font-semibold transition-all hover:border-ink hover:shadow-sm group/chip"
                      style={{ background: r.color + "22" }}
                    >
                      <span className="truncate">{locale === "id" ? tp.id : tp.en}</span>
                      <ArrowRight className="w-3 h-3 shrink-0 opacity-0 group-hover/chip:opacity-100 transition" style={{ color: "oklch(0.72 0.18 45)" }} />
                    </Link>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-10 rounded-3xl p-8 text-center"
          style={{ background: "oklch(0.78 0.16 150)", border: "2px solid oklch(0.18 0.01 60)" }}
        >
          <div className="flex items-center justify-center gap-3 mb-3">
            <Zap className="w-5 h-5" style={{ color: "oklch(0.18 0.01 60)" }} />
            <p className="font-display text-2xl text-ink">
              {locale === "id"
                ? "Ubah topik apapun jadi materi 3D interaktif"
                : "Turn any topic into interactive 3D lessons"}
            </p>
          </div>
          <p className="text-ink/75 text-sm mb-6">
            {locale === "id"
              ? "Pilih topik dari referensi di atas → ketik di Lectra → dapat materi lengkap dengan 3D & AR dalam detik"
              : "Pick a topic from above → type in Lectra → get a full 3D & AR lesson in seconds"}
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function Showcase({ locale, t }: { locale: Locale; t: T }) {
  const [, setLocation] = useLocation();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="showcase" className="px-6 md:px-12 py-24" ref={ref}>
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-10 items-center mb-20">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.7 }}
          whileHover={{ scale: 1.02, rotate: 1 }}
          className="rounded-3xl p-8 relative"
          style={{ background: "oklch(0.88 0.16 95)" }}
        >
          <img src={card3d} alt="3D model with vertices" width={1024} height={768} loading="lazy" className="rounded-2xl w-full" />
          <motion.div
            animate={{ rotate: [3, 5, 3] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute top-12 right-12 bg-card rounded-xl px-3 py-1.5 text-xs font-semibold shadow"
          >
            {t.showcase.a.badge}
          </motion.div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <p className="text-xs font-bold tracking-widest mb-3" style={{ color: "oklch(0.72 0.18 45)" }}>{t.showcase.a.tag}</p>
          <h2 className="font-display text-4xl md:text-5xl mb-5 leading-tight">{t.showcase.a.title}</h2>
          <p className="text-muted-foreground mb-6 leading-relaxed">{t.showcase.a.body}</p>
          <ul className="space-y-3 mb-8">
            {t.showcase.a.bullets.map((b) => (
              <li key={b} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full grid place-items-center shrink-0" style={{ background: "oklch(0.78 0.16 150)" }}>
                  <Check className="w-3 h-3 text-ink" strokeWidth={3} />
                </div>
                <span>{b}</span>
              </li>
            ))}
          </ul>
          <motion.button
            whileHover={{ scale: 1.05, x: 5 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setLocation(`/${locale}/create`)}
            style={{ background: "oklch(0.18 0.01 60)", color: "oklch(0.97 0.012 85)", borderRadius: "9999px", padding: "0.75rem 1.5rem", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
          >
            {t.showcase.a.cta} <ArrowRight className="w-4 h-4" />
          </motion.button>
        </motion.div>
      </div>

      <div className="grid md:grid-cols-2 gap-10 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="order-2 md:order-1"
        >
          <p className="text-xs font-bold tracking-widest mb-3" style={{ color: "oklch(0.72 0.18 45)" }}>{t.showcase.b.tag}</p>
          <h2 className="font-display text-4xl md:text-5xl mb-5 leading-tight">{t.showcase.b.title}</h2>
          <p className="text-muted-foreground mb-6 leading-relaxed">{t.showcase.b.body}</p>
          <ul className="space-y-3 mb-8">
            {t.showcase.b.bullets.map((b) => (
              <li key={b} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full grid place-items-center shrink-0" style={{ background: "oklch(0.78 0.16 150)" }}>
                  <Check className="w-3 h-3 text-ink" strokeWidth={3} />
                </div>
                <span>{b}</span>
              </li>
            ))}
          </ul>
          <motion.button
            whileHover={{ scale: 1.05, x: 5 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setLocation(`/${locale}/create`)}
            style={{ background: "oklch(0.18 0.01 60)", color: "oklch(0.97 0.012 85)", borderRadius: "9999px", padding: "0.75rem 1.5rem", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
          >
            {t.showcase.b.cta} <Scan className="w-4 h-4" />
          </motion.button>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="order-1 md:order-2 rounded-3xl p-8 relative"
          style={{ background: "oklch(0.78 0.16 150)" }}
        >
          <img src={cardAr} alt="AR dinosaur" width={1024} height={768} loading="lazy" className="rounded-2xl w-full" />
          <motion.div
            animate={{ rotate: [-3, -5, -3] }}
            transition={{ duration: 3.5, repeat: Infinity }}
            className="absolute bottom-12 left-12 bg-card rounded-xl px-3 py-1.5 text-xs font-semibold shadow"
          >
            {t.showcase.b.badge}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function Pricing({ locale, t }: { locale: Locale; t: T }) {
  const [, setLocation] = useLocation();
  const price = locale === "id" ? "Rp20rb" : "$2";
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  return (
    <section id="pricing" className="px-6 md:px-12 py-24 bg-card border-y border-border" ref={ref}>
      <div className="max-w-3xl mx-auto text-center mb-12">
        <h2 className="font-display text-4xl md:text-5xl mb-4">{t.pricing.heading}</h2>
        <p className="text-muted-foreground">{t.pricing.sub}</p>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="max-w-md mx-auto relative"
      >
        <motion.div
          animate={{ rotate: [12, 14, 12] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute -top-4 -right-4 z-10 font-display text-sm font-bold px-4 py-2 rounded-full border border-ink/10"
          style={{ background: "oklch(0.88 0.16 95)" }}
        >
          {t.pricing.perDay}
        </motion.div>
        <div className="bg-background border-2 border-ink rounded-3xl p-8" style={{ boxShadow: "8px 8px 0 var(--ink)" }}>
          <p className="text-xs font-bold tracking-widest mb-2" style={{ color: "oklch(0.72 0.18 45)" }}>{t.pricing.tag}</p>
          <h3 className="font-display text-3xl mb-4">{t.pricing.plan}</h3>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="font-display text-6xl font-bold">{price}</span>
            <span className="text-muted-foreground">{t.pricing.per}</span>
          </div>
          <p className="text-sm text-muted-foreground mb-6">{t.pricing.trial}</p>
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setLocation(`/${locale}/create`)}
            className="w-full justify-center mb-6"
            style={{ background: "oklch(0.72 0.18 45)", color: "white", borderRadius: "9999px", padding: "0.875rem 1.75rem", fontWeight: 700, fontSize: "1rem", display: "flex", alignItems: "center", gap: "0.5rem", boxShadow: "0 4px 0 oklch(0.55 0.18 40)" }}
          >
            {t.pricing.cta} <ArrowRight className="w-4 h-4" />
          </motion.button>
          <ul className="space-y-3">
            {t.pricing.perks.map((p, i) => (
              <motion.li
                key={p}
                initial={{ opacity: 0, x: -10 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.3 + i * 0.06 }}
                className="flex items-start gap-3 text-sm"
              >
                <div className="w-5 h-5 rounded-full grid place-items-center mt-0.5 shrink-0" style={{ background: "oklch(0.78 0.16 150)" }}>
                  <Check className="w-3 h-3 text-ink" strokeWidth={3} />
                </div>
                <span>{p}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      </motion.div>
    </section>
  );
}

function CTA({ locale, t }: { locale: Locale; t: T }) {
  const [, setLocation] = useLocation();
  return (
    <section className="px-6 md:px-12 py-24">
      <div className="max-w-5xl mx-auto rounded-[2.5rem] p-12 md:p-16 text-center relative overflow-hidden" style={{ background: "oklch(0.88 0.16 95)" }}>
        <BlobBlush className="absolute -top-9 -left-7 w-44 h-40 opacity-85 -rotate-6 pointer-events-none" />
        <BlobLeaf className="absolute -bottom-9 -right-9 w-52 h-46 opacity-80 rotate-[9deg] pointer-events-none" />
        <div className="relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-4xl md:text-6xl mb-5 leading-tight">
              {t.finalCta.title1}<em className="not-italic">{t.finalCta.titleEm}</em>.
            </h2>
          </motion.div>
          <p className="text-ink/75 mb-8 max-w-xl mx-auto">{t.finalCta.sub}</p>
          <motion.button
            whileHover={{ scale: 1.06, y: -3 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setLocation(`/${locale}/create`)}
            style={{ background: "oklch(0.72 0.18 45)", color: "white", borderRadius: "9999px", padding: "0.875rem 1.75rem", fontWeight: 700, fontSize: "1rem", display: "inline-flex", alignItems: "center", gap: "0.5rem", boxShadow: "0 4px 0 oklch(0.55 0.18 40)" }}
          >
            {t.finalCta.cta} <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </section>
  );
}

function Footer({ t, locale }: { t: T; locale: Locale }) {
  return (
    <footer className="px-6 md:px-12 py-10 border-t border-border">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-3">
          <Logo />
          <span>© 2026 Lectra · AR3D Engine</span>
        </div>
        <div className="flex gap-6">
          <a href="#features" className="hover:text-foreground">{t.footer.privacy}</a>
          <a href="#pricing" className="hover:text-foreground">{t.footer.terms}</a>
          <a href="mailto:hello@lectra.id" className="hover:text-foreground">{t.footer.contact}</a>
          <Link href={`/${locale}/create`} className="hover:text-foreground">{t.footer.schools}</Link>
        </div>
      </div>
    </footer>
  );
}

function LandingPage() {
  const params = useParams<{ lang: string }>();
  const lang = params.lang;
  const locale = (isLocale(lang) ? lang : "id") as Locale;
  const t = dict[locale];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav locale={locale} t={t} />
      <Hero locale={locale} t={t} />
      <Subjects locale={locale} t={t} />
      <WhyLectra t={t} />
      <WorldResources locale={locale} />
      <Showcase locale={locale} t={t} />
      <Pricing locale={locale} t={t} />
      <CTA locale={locale} t={t} />
      <Footer t={t} locale={locale} />
    </div>
  );
}

export default LandingPage;
