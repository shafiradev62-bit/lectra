import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { Check, ArrowRight, Scan, Play, Globe, Menu, X } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { motion } from "motion/react";
import { animate, stagger } from "animejs";
import {
  SpriteBiology, SpritePlanet, SpriteAtom, SpriteFlask,
  SpriteCompass, SpritePillar, SpriteGlobe, SpriteBone,
  SpriteMark, SpriteHeart, SpriteSquiggle,
  BlobSun, BlobLeaf, BlobBlush,
} from "@/components/sprites";
import heroImg from "@/assets/hero-teacher.png";
import card3d from "@/assets/card-3d.jpg";
import cardAr from "@/assets/card-ar.jpg";
import { dict, isLocale, type Locale } from "@/lib/i18n";

export const Route = createFileRoute("/$lang/")({
  head: ({ params }) => {
    const lang = isLocale(params.lang) ? params.lang : "id";
    const t = dict[lang];
    const title = lang === "id"
      ? "Lectra — Generator media belajar, 3D & AR untuk guru"
      : "Lectra — 3D, AR & lesson builder for teachers";
    return { meta: [{ title }, { name: "description", content: t.hero.subtitle }] };
  },
  component: Page,
});

function Page() {
  const { lang } = useParams({ from: "/$lang/" });
  const locale = (isLocale(lang) ? lang : "id") as Locale;
  const t = dict[locale];
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav locale={locale} t={t} />
      <Hero locale={locale} t={t} />
      <Subjects locale={locale} t={t} />
      <WhyLectra t={t} />
      <Showcase locale={locale} t={t} />
      <Pricing locale={locale} t={t} />
      <CTA locale={locale} t={t} />
      <Footer t={t} locale={locale} />
    </div>
  );
}

const SUBJECT_SPRITES = [SpriteBiology, SpritePlanet, SpriteAtom, SpriteFlask, SpriteCompass, SpritePillar, SpriteGlobe, SpriteBone];
type T = ReturnType<typeof tFor>;
function tFor(l: Locale) { return dict[l]; }

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
    <Link
      to="/$lang"
      params={{ lang: other }}
      asChild
    >
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="inline-flex items-center gap-1.5 text-sm font-semibold rounded-full border border-border px-3 py-1.5 hover:bg-secondary transition-colors"
        aria-label="Switch language"
      >
        <motion.span
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
        >
          <Globe className="w-3.5 h-3.5" />
        </motion.span>
        {other.toUpperCase()}
      </motion.button>
    </Link>
  );
}

function Nav({ locale, t }: { locale: Locale; t: T }) {
  const scrolled = useScrolled();
  const [mobileOpen, setMobileOpen] = useState(false);

  // close mobile menu on resize to desktop
  useEffect(() => {
    function onResize() { if (window.innerWidth >= 768) setMobileOpen(false); }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const navLinks = [
    { href: "#features", label: t.nav.features },
    { href: "#showcase", label: t.nav.showcase },
    { href: "#pricing", label: t.nav.pricing },
  ];

  return (
    <header
      className={`px-6 md:px-12 py-5 sticky top-0 z-40 transition-all duration-200 ${
        scrolled ? "backdrop-blur-md bg-background/90 border-b border-border shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/$lang" params={{ lang: locale }} aria-label="Lectra home">
          <Logo />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-10 text-sm font-medium text-foreground/80" aria-label="Main navigation">
          {navLinks.map((l) => (
            <a key={l.href} href={l.href} className="hover:text-foreground transition-colors">{l.label}</a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LangSwitch locale={locale} />
          <Link to="/$lang/create" params={{ lang: locale }} asChild className="hidden sm:inline-flex">
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="btn-orange text-sm hover:btn-orange-hover"
            >
              {t.nav.cta}
            </motion.button>
          </Link>
          {/* Mobile hamburger */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="md:hidden w-9 h-9 grid place-items-center rounded-full border border-border hover:bg-secondary transition"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={t.nav.menu}
            aria-expanded={mobileOpen}
          >
            <motion.div
              animate={mobileOpen ? { rotate: 90 } : { rotate: 0 }}
              transition={{ duration: 0.3 }}
            >
              {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </motion.div>
          </motion.button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <nav
          className="md:hidden mt-3 pb-4 border-t border-border pt-4 flex flex-col gap-3"
          aria-label="Mobile navigation"
        >
          {navLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium py-1.5 px-2 rounded-lg hover:bg-secondary transition"
              onClick={() => setMobileOpen(false)}
            >
              {l.label}
            </a>
          ))}
          <Link
            to="/$lang/create"
            params={{ lang: locale }}
            className="btn-orange text-sm hover:btn-orange-hover justify-center mt-2"
            onClick={() => setMobileOpen(false)}
          >
            {t.nav.cta}
          </Link>
        </nav>
      )}
    </header>
  );
}

function Hero({ locale, t }: { locale: Locale; t: T }) {
  const primaryBtnRef = useRef<HTMLButtonElement>(null);
  const demoBtnRef = useRef<HTMLButtonElement>(null);

  const handlePrimaryClick = () => {
    if (primaryBtnRef.current) {
      animate({
        targets: primaryBtnRef.current,
        scale: [1, 0.95, 1.05, 1],
        duration: 400,
        ease: "inOutQuad",
      });
    }
  };

  const handleDemoClick = () => {
    if (demoBtnRef.current) {
      animate({
        targets: demoBtnRef.current,
        scale: [1, 0.9, 1.1, 1],
        rotate: [0, -3, 3, 0],
        duration: 500,
        ease: "inOutQuad",
      });
    }
  };

  return (
    <section className="px-6 md:px-12 pt-10 pb-20">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl leading-[1.02] mb-6">
            {t.hero.title1}<em className="not-italic text-accent">{t.hero.titleEm}</em>{t.hero.title2}
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mb-8 leading-relaxed">{t.hero.subtitle}</p>
          <div className="flex flex-wrap items-center gap-3 mb-10">
            <Link to="/$lang/create" params={{ lang: locale }} asChild>
              <motion.button
                ref={primaryBtnRef}
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.97 }}
                onClick={handlePrimaryClick}
                className="btn-orange hover:btn-orange-hover"
              >
                <motion.span
                  initial={{ x: 0 }}
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  className="inline-flex items-center gap-2"
                >
                  {t.hero.primary} <ArrowRight className="w-4 h-4" />
                </motion.span>
              </motion.button>
            </Link>
            <motion.a
              href="#showcase"
              ref={demoBtnRef as any}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDemoClick}
              className="btn-green inline-flex items-center"
            >
              <Play className="w-4 h-4" fill="currentColor" /> {t.hero.demo}
            </motion.a>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              {["#f5c542", "#7ec97a", "#f4a8b8", "#88b8e8"].map((c) => (
                <div key={c} className="w-9 h-9 rounded-full border-2 border-background" style={{ background: c }} />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <SpriteHeart className="w-7 h-7" />
              <p className="text-xs text-muted-foreground max-w-[200px] leading-snug">{t.hero.social}</p>
            </div>
          </div>
        </div>

        <div className="relative">
          {/* hand-drawn wobbly blobs — organic & crayon-like, no more perfect AI circles */}
          <BlobSun className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[42%] w-[390px] h-[350px] opacity-75 -rotate-[4deg] pointer-events-none" />
          <BlobLeaf className="absolute top-8 right-8 w-28 h-28 opacity-80 rotate-[7deg] pointer-events-none" />
          <BlobBlush className="absolute bottom-14 left-1 w-20 h-20 opacity-80 -rotate-12 pointer-events-none" />
          <img src={heroImg} alt="Teacher with Lectra" width={1024} height={1024} className="relative w-full max-w-md mx-auto" />

          {/* Top-left: hand-drawn 3D sticker */}
          <div className="absolute top-2 -left-4 md:left-0 -rotate-6 w-[148px]">
            <svg viewBox="0 0 148 110" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full drop-shadow-md">
              {/* wobbly paper card background */}
              <path d="M6 18 Q 7 5 20 4 L 132 6 Q 144 7 143 20 L 141 92 Q 140 104 127 105 L 18 103 Q 6 102 7 89 Z" fill="#fffbf0" stroke="#1a1a1a" strokeWidth="2.5" strokeLinejoin="round"/>
              {/* sun-colored inner area */}
              <path d="M14 22 Q 15 14 22 14 L 126 16 Q 133 16 132 23 L 131 70 Q 130 77 123 77 L 23 75 Q 16 75 15 68 Z" fill="#f5c542" stroke="#1a1a1a" strokeWidth="2"/>
              {/* hand-drawn cube */}
              <path d="M50 28 L 74 22 L 98 28 L 98 58 L 74 64 L 50 58 Z" fill="#f4a26b" stroke="#1a1a1a" strokeWidth="2.2" strokeLinejoin="round"/>
              <path d="M74 22 L 74 52 M 74 52 L 50 58 M 74 52 L 98 58" stroke="#1a1a1a" strokeWidth="1.8" fill="none"/>
              {/* little star doodle */}
              <path d="M118 30 L 121 38 L 129 38 L 123 43 L 125 51 L 118 47 L 111 51 L 113 43 L 107 38 L 115 38 Z" fill="#fff" stroke="#1a1a1a" strokeWidth="1.5"/>
              {/* label text area */}
              <path d="M22 84 Q 22 80 26 80 L 90 81 Q 94 81 94 84 L 94 96 Q 94 99 90 99 L 26 98 Q 22 98 22 95 Z" fill="#fff" stroke="#1a1a1a" strokeWidth="1.5"/>
              <text x="30" y="93" fontFamily="monospace" fontSize="9" fontWeight="bold" fill="#1a1a1a">cell.obj · 824 verts</text>
            </svg>
          </div>

          {/* Bottom-right: hand-drawn AR sticker */}
          <div className="absolute bottom-4 -right-4 md:right-0 rotate-5 w-[148px]">
            <svg viewBox="0 0 148 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full drop-shadow-md">
              {/* wobbly card */}
              <path d="M8 16 Q 9 4 22 5 L 130 7 Q 142 8 141 21 L 139 100 Q 138 112 125 111 L 20 109 Q 8 108 9 95 Z" fill="#fffbf0" stroke="#1a1a1a" strokeWidth="2.5" strokeLinejoin="round"/>
              {/* leaf-colored inner */}
              <path d="M16 22 Q 17 14 24 14 L 124 16 Q 131 16 130 23 L 129 75 Q 128 82 121 82 L 25 80 Q 18 80 17 73 Z" fill="#7ec97a" stroke="#1a1a1a" strokeWidth="2"/>
              {/* hand-drawn AR scan corners */}
              <path d="M34 30 V 24 Q 34 20 38 20 H 44" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
              <path d="M110 30 V 24 Q 110 20 106 20 H 100" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
              <path d="M34 66 V 72 Q 34 76 38 76 H 44" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
              <path d="M110 66 V 72 Q 110 76 106 76 H 100" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
              {/* small dino silhouette inside scan */}
              <path d="M58 62 Q 56 50 62 44 Q 68 38 76 42 Q 84 46 84 54 Q 84 62 78 66 Q 72 68 68 64 L 64 70 Z" fill="#fff" stroke="#1a1a1a" strokeWidth="2" strokeLinejoin="round"/>
              <circle cx="71" cy="46" r="2" fill="#1a1a1a"/>
              {/* wavy scan line */}
              <path d="M36 48 Q 52 44 74 48 Q 96 52 112 48" stroke="#1a1a1a" strokeWidth="2" fill="none" strokeLinecap="round"/>
              {/* bottom label */}
              <path d="M22 89 Q 22 85 26 85 L 122 86 Q 126 86 126 89 L 126 103 Q 126 107 122 107 L 26 106 Q 22 106 22 103 Z" fill="#fff" stroke="#1a1a1a" strokeWidth="1.5"/>
              <text x="36" y="100" fontFamily="monospace" fontSize="9" fontWeight="bold" fill="#1a1a1a">{t.hero.badge2}</text>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}

function Subjects({ locale, t }: { locale: Locale; t: T }) {
  return (
    <section className="px-6 md:px-12 pb-20">
      <div className="max-w-7xl mx-auto">
        <SpriteSquiggle className="w-32 h-6 mx-auto mb-6 text-ink/60" />
        <p className="text-center font-display text-2xl md:text-3xl mb-8">{t.subjects.heading}</p>
        <div className="flex flex-wrap justify-center gap-3">
          {t.subjects.items.map((label, i) => {
            const S = SUBJECT_SPRITES[i];
            return (
              <Link key={label} to="/$lang/create" params={{ lang: locale }} asChild>
                <motion.button
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="chip hover:bg-secondary transition flex items-center gap-2"
                >
                  <motion.div
                    whileHover={{ rotate: 10, scale: 1.2 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <S className="w-6 h-6" />
                  </motion.div>
                  {label}
                </motion.button>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function WhyLectra({ t }: { t: T }) {
  const colors = ["bg-sun", "bg-leaf", "bg-blush", "bg-sky", "bg-sun", "bg-leaf"];
  return (
    <section id="features" className="px-6 md:px-12 py-20 bg-card border-y border-border">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="font-display text-4xl md:text-5xl mb-4">{t.why.heading}</h2>
          <p className="text-muted-foreground">{t.why.sub}</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {t.why.cards.map((c, i) => <Card key={c.title} color={colors[i]} {...c} />)}
        </div>
      </div>
    </section>
  );
}

function Card({ color, tag, title, desc, chip1, chip2 }: { color: string; tag: string; title: string; desc: string; chip1?: string; chip2?: string }) {
  return (
    <div className={`${color} rounded-3xl p-7 relative overflow-hidden`}>
      <p className="text-[10px] font-bold tracking-[0.15em] text-ink/60 mb-4">{tag}</p>
      <h3 className="font-display text-2xl text-ink mb-3 leading-tight">{title}</h3>
      <p className="text-sm text-ink/75 leading-relaxed mb-6">{desc}</p>
      <div className="relative h-12">
        {chip1 && <span className="absolute left-0 top-0 bg-card border border-border rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm -rotate-2">{chip1}</span>}
        {chip2 && <span className="absolute right-2 top-5 bg-card border border-border rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm rotate-3">{chip2}</span>}
      </div>
    </div>
  );
}

function Showcase({ locale, t }: { locale: Locale; t: T }) {
  return (
    <section id="showcase" className="px-6 md:px-12 py-24">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-10 items-center mb-20">
        <motion.div 
          whileHover={{ scale: 1.02, rotate: 1 }}
          className="rounded-3xl bg-sun p-8 relative"
        >
          <img src={card3d} alt="3D model with vertices" width={1024} height={768} loading="lazy" className="rounded-2xl w-full" />
          <div className="absolute top-12 right-12 bg-card rounded-xl px-3 py-1.5 text-xs font-semibold shadow rotate-3">{t.showcase.a.badge}</div>
        </motion.div>
        <div>
          <p className="text-xs font-bold tracking-widest text-accent mb-3">{t.showcase.a.tag}</p>
          <h2 className="font-display text-4xl md:text-5xl mb-5 leading-tight">{t.showcase.a.title}</h2>
          <p className="text-muted-foreground mb-6 leading-relaxed">{t.showcase.a.body}</p>
          <ul className="space-y-3 mb-8">
            {t.showcase.a.bullets.map((b) => (
              <li key={b} className="flex items-center gap-3"><Check className="w-5 h-5 text-leaf" /> <span>{b}</span></li>
            ))}
          </ul>
          <Link to="/$lang/create" params={{ lang: locale }} asChild>
            <motion.button
              whileHover={{ scale: 1.05, x: 5 }}
              whileTap={{ scale: 0.97 }}
              className="btn-dark inline-flex items-center gap-2"
            >
              {t.showcase.a.cta} <ArrowRight className="w-4 h-4" />
            </motion.button>
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-10 items-center">
        <div className="order-2 md:order-1">
          <p className="text-xs font-bold tracking-widest text-accent mb-3">{t.showcase.b.tag}</p>
          <h2 className="font-display text-4xl md:text-5xl mb-5 leading-tight">{t.showcase.b.title}</h2>
          <p className="text-muted-foreground mb-6 leading-relaxed">{t.showcase.b.body}</p>
          <ul className="space-y-3 mb-8">
            {t.showcase.b.bullets.map((b) => (
              <li key={b} className="flex items-center gap-3"><Check className="w-5 h-5 text-leaf" /> <span>{b}</span></li>
            ))}
          </ul>
          <Link to="/$lang/create" params={{ lang: locale }} asChild>
            <motion.button
              whileHover={{ scale: 1.05, x: 5 }}
              whileTap={{ scale: 0.97 }}
              className="btn-dark inline-flex items-center gap-2"
            >
              {t.showcase.b.cta} <Scan className="w-4 h-4" />
            </motion.button>
          </Link>
        </div>
        <div className="order-1 md:order-2 rounded-3xl bg-leaf p-8 relative">
          <img src={cardAr} alt="AR dinosaur" width={1024} height={768} loading="lazy" className="rounded-2xl w-full" />
          <div className="absolute bottom-12 left-12 bg-card rounded-xl px-3 py-1.5 text-xs font-semibold shadow -rotate-3">{t.showcase.b.badge}</div>
        </div>
      </div>
    </section>
  );
}

function Pricing({ locale, t }: { locale: Locale; t: T }) {
  const price = locale === "id" ? "Rp20rb" : "$2";
  return (
    <section id="pricing" className="px-6 md:px-12 py-24 bg-card border-y border-border">
      <div className="max-w-3xl mx-auto text-center mb-12">
        <h2 className="font-display text-4xl md:text-5xl mb-4">{t.pricing.heading}</h2>
        <p className="text-muted-foreground">{t.pricing.sub}</p>
      </div>
      <div className="max-w-md mx-auto relative">
        <div className="absolute -top-4 -right-4 z-10 bg-sun font-display text-sm font-bold px-4 py-2 rounded-full rotate-12 border border-ink/10">{t.pricing.perDay}</div>
        <div className="bg-background border-2 border-ink rounded-3xl p-8" style={{ boxShadow: "8px 8px 0 var(--ink)" }}>
          <p className="text-xs font-bold tracking-widest text-accent mb-2">{t.pricing.tag}</p>
          <h3 className="font-display text-3xl mb-4">{t.pricing.plan}</h3>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="font-display text-6xl font-bold">{price}</span>
            <span className="text-muted-foreground">{t.pricing.per}</span>
          </div>
          <p className="text-sm text-muted-foreground mb-6">{t.pricing.trial}</p>
          <Link to="/$lang/create" params={{ lang: locale }} className="btn-orange w-full justify-center mb-6 hover:btn-orange-hover">
            {t.pricing.cta} <ArrowRight className="w-4 h-4" />
          </Link>
          <ul className="space-y-3">
            {t.pricing.perks.map((p) => (
              <li key={p} className="flex items-start gap-3 text-sm">
                <div className="w-5 h-5 rounded-full bg-leaf grid place-items-center mt-0.5 shrink-0">
                  <Check className="w-3 h-3 text-ink" strokeWidth={3} />
                </div>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function CTA({ locale, t }: { locale: Locale; t: T }) {
  return (
    <section className="px-6 md:px-12 py-24">
      <div className="max-w-5xl mx-auto bg-sun rounded-[2.5rem] p-12 md:p-16 text-center relative overflow-hidden">
        {/* hand-drawn blobs instead of clean floating circles */}
        <BlobBlush className="absolute -top-9 -left-7 w-44 h-40 opacity-85 -rotate-6 pointer-events-none" />
        <BlobLeaf className="absolute -bottom-9 -right-9 w-52 h-46 opacity-80 rotate-[9deg] pointer-events-none" />
        <div className="relative">
          <h2 className="font-display text-4xl md:text-6xl mb-5 leading-tight">
            {t.finalCta.title1}<em className="not-italic">{t.finalCta.titleEm}</em>.
          </h2>
          <p className="text-ink/75 mb-8 max-w-xl mx-auto">{t.finalCta.sub}</p>
          <Link to="/$lang/create" params={{ lang: locale }} className="btn-orange hover:btn-orange-hover">
            {t.finalCta.cta} <ArrowRight className="w-4 h-4" />
          </Link>
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
          <Link to="/$lang/create" params={{ lang: locale }} className="hover:text-foreground">{t.footer.schools}</Link>
        </div>
      </div>
    </footer>
  );
}
