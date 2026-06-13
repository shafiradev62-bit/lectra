/**
 * Hand-drawn style SVG sprites — no emoji, slightly wobbly strokes,
 * crayon-like fills, friendly children's-book feel.
 */
import type { SVGProps } from "react";

const stroke = "#1a1a1a";

function Wrap({ children, ...p }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" fill="none" strokeLinecap="round" strokeLinejoin="round" {...p}>
      {children}
    </svg>
  );
}

export function SpriteBiology(p: SVGProps<SVGSVGElement>) {
  return (
    <Wrap {...p}>
      <path d="M12 32 C 12 18, 26 10, 36 16 C 50 24, 50 44, 36 50 C 22 56, 12 46, 12 32 Z" fill="#a8d89a" stroke={stroke} strokeWidth="2.2" />
      <circle cx="28" cy="30" r="6" fill="#c46c8c" stroke={stroke} strokeWidth="2" />
      <circle cx="40" cy="38" r="3" fill="#f5d76e" stroke={stroke} strokeWidth="1.8" />
      <circle cx="22" cy="42" r="2.4" fill="#f5d76e" stroke={stroke} strokeWidth="1.5" />
    </Wrap>
  );
}

export function SpritePlanet(p: SVGProps<SVGSVGElement>) {
  return (
    <Wrap {...p}>
      <circle cx="32" cy="32" r="16" fill="#f4a26b" stroke={stroke} strokeWidth="2.2" />
      <ellipse cx="32" cy="34" rx="26" ry="6" fill="none" stroke={stroke} strokeWidth="2.2" />
      <path d="M22 28 q 6 -3 12 0" stroke={stroke} strokeWidth="1.5" fill="none" />
      <circle cx="50" cy="14" r="2" fill={stroke} />
      <circle cx="12" cy="18" r="1.5" fill={stroke} />
    </Wrap>
  );
}

export function SpriteAtom(p: SVGProps<SVGSVGElement>) {
  return (
    <Wrap {...p}>
      <ellipse cx="32" cy="32" rx="22" ry="8" stroke={stroke} strokeWidth="2.2" fill="none" />
      <ellipse cx="32" cy="32" rx="22" ry="8" stroke={stroke} strokeWidth="2.2" fill="none" transform="rotate(60 32 32)" />
      <ellipse cx="32" cy="32" rx="22" ry="8" stroke={stroke} strokeWidth="2.2" fill="none" transform="rotate(-60 32 32)" />
      <circle cx="32" cy="32" r="4" fill="#e85d3a" stroke={stroke} strokeWidth="1.8" />
    </Wrap>
  );
}

export function SpriteFlask(p: SVGProps<SVGSVGElement>) {
  return (
    <Wrap {...p}>
      <path d="M26 10 v 14 L 16 50 a 4 4 0 0 0 4 6 h 24 a 4 4 0 0 0 4 -6 L 38 24 V 10" fill="#9bd0e5" stroke={stroke} strokeWidth="2.2" />
      <path d="M22 10 h 20" stroke={stroke} strokeWidth="2.2" />
      <circle cx="26" cy="44" r="2" fill="#fff" stroke={stroke} strokeWidth="1.5" />
      <circle cx="34" cy="48" r="1.6" fill="#fff" stroke={stroke} strokeWidth="1.5" />
    </Wrap>
  );
}

export function SpriteCompass(p: SVGProps<SVGSVGElement>) {
  return (
    <Wrap {...p}>
      <path d="M20 50 L 32 10 L 44 50" fill="none" stroke={stroke} strokeWidth="2.4" />
      <path d="M32 10 v 8" stroke="#e85d3a" strokeWidth="2.4" />
      <circle cx="32" cy="12" r="2" fill="#e85d3a" stroke={stroke} strokeWidth="1.5" />
      <path d="M24 40 q 8 6 16 0" stroke={stroke} strokeWidth="2" fill="none" />
    </Wrap>
  );
}

export function SpritePillar(p: SVGProps<SVGSVGElement>) {
  return (
    <Wrap {...p}>
      <path d="M10 52 h 44" stroke={stroke} strokeWidth="2.4" />
      <path d="M12 16 L 32 6 L 52 16" fill="#f5d76e" stroke={stroke} strokeWidth="2.2" />
      <rect x="14" y="16" width="36" height="4" fill="#f5d76e" stroke={stroke} strokeWidth="2" />
      <rect x="18" y="22" width="4" height="26" fill="#fff" stroke={stroke} strokeWidth="2" />
      <rect x="30" y="22" width="4" height="26" fill="#fff" stroke={stroke} strokeWidth="2" />
      <rect x="42" y="22" width="4" height="26" fill="#fff" stroke={stroke} strokeWidth="2" />
    </Wrap>
  );
}

export function SpriteGlobe(p: SVGProps<SVGSVGElement>) {
  return (
    <Wrap {...p}>
      <circle cx="32" cy="32" r="20" fill="#88b8e8" stroke={stroke} strokeWidth="2.2" />
      <path d="M14 28 q 8 -4 18 -2 t 18 4" stroke={stroke} strokeWidth="1.8" fill="none" />
      <path d="M14 38 q 8 4 18 2 t 18 -4" stroke={stroke} strokeWidth="1.8" fill="none" />
      <path d="M22 16 q 4 16 0 32" stroke={stroke} strokeWidth="1.8" fill="none" />
      <path d="M42 16 q -4 16 0 32" stroke={stroke} strokeWidth="1.8" fill="none" />
    </Wrap>
  );
}

export function SpriteBone(p: SVGProps<SVGSVGElement>) {
  return (
    <Wrap {...p}>
      <path d="M16 16 a 6 6 0 0 1 10 4 L 44 38 a 6 6 0 0 1 4 10 a 6 6 0 0 1 -10 -4 L 20 26 a 6 6 0 0 1 -4 -10 Z" fill="#fff8e1" stroke={stroke} strokeWidth="2.2" />
    </Wrap>
  );
}

export function SpriteStar(p: SVGProps<SVGSVGElement>) {
  return (
    <Wrap {...p}>
      <path d="M32 8 L 38 24 L 56 26 L 42 38 L 46 56 L 32 46 L 18 56 L 22 38 L 8 26 L 26 24 Z" fill="#f5c542" stroke={stroke} strokeWidth="2.2" />
    </Wrap>
  );
}

export function SpriteSparkle(p: SVGProps<SVGSVGElement>) {
  return (
    <Wrap {...p}>
      <path d="M32 6 L 36 28 L 58 32 L 36 36 L 32 58 L 28 36 L 6 32 L 28 28 Z" fill="#e85d3a" stroke={stroke} strokeWidth="2" />
    </Wrap>
  );
}

export function SpriteBook(p: SVGProps<SVGSVGElement>) {
  return (
    <Wrap {...p}>
      <path d="M8 14 q 12 -4 24 2 q 12 -6 24 -2 v 38 q -12 -4 -24 2 q -12 -6 -24 -2 Z" fill="#f4a8b8" stroke={stroke} strokeWidth="2.2" />
      <path d="M32 16 v 38" stroke={stroke} strokeWidth="2" />
    </Wrap>
  );
}

export function SpriteRocket(p: SVGProps<SVGSVGElement>) {
  return (
    <Wrap {...p}>
      <path d="M32 6 q 12 12 12 28 v 14 h -24 v -14 q 0 -16 12 -28 Z" fill="#f5d76e" stroke={stroke} strokeWidth="2.2" />
      <circle cx="32" cy="26" r="4" fill="#fff" stroke={stroke} strokeWidth="1.8" />
      <path d="M20 40 l -8 12 l 12 -4" fill="#e85d3a" stroke={stroke} strokeWidth="2" />
      <path d="M44 40 l 8 12 l -12 -4" fill="#e85d3a" stroke={stroke} strokeWidth="2" />
      <path d="M26 48 l 12 0" stroke={stroke} strokeWidth="1.5" strokeDasharray="2 2" />
    </Wrap>
  );
}

export function SpriteDino(p: SVGProps<SVGSVGElement>) {
  return (
    <Wrap {...p}>
      {/* body */}
      <path d="M14 40 Q 14 28 24 24 Q 34 20 40 26 Q 48 30 46 42 Q 44 50 36 52 L 18 52 Q 14 52 14 46 Z" fill="#7ec97a" stroke={stroke} strokeWidth="2.2" />
      {/* head */}
      <path d="M40 26 Q 50 18 54 24 Q 58 30 50 34 Q 46 34 42 30 Z" fill="#7ec97a" stroke={stroke} strokeWidth="2" />
      {/* eye */}
      <circle cx="50" cy="24" r="2" fill={stroke} />
      <circle cx="51" cy="23.5" r="0.7" fill="#fff" />
      {/* spikes on back */}
      <path d="M24 24 L 20 14 L 26 22" fill="#a8d89a" stroke={stroke} strokeWidth="1.8" />
      <path d="M30 22 L 28 12 L 34 21" fill="#a8d89a" stroke={stroke} strokeWidth="1.8" />
      <path d="M36 22 L 36 14 L 40 22" fill="#a8d89a" stroke={stroke} strokeWidth="1.8" />
      {/* legs */}
      <path d="M20 52 L 18 60" stroke={stroke} strokeWidth="2.2" />
      <path d="M30 52 L 28 60" stroke={stroke} strokeWidth="2.2" />
      {/* tail */}
      <path d="M14 46 Q 6 48 8 56 Q 10 60 14 56" fill="#7ec97a" stroke={stroke} strokeWidth="2" />
    </Wrap>
  );
}

export function SpriteAstronaut(p: SVGProps<SVGSVGElement>) {
  return (
    <Wrap {...p}>
      {/* suit body */}
      <path d="M18 36 Q 14 36 14 44 L 14 54 Q 14 58 20 58 L 44 58 Q 50 58 50 54 L 50 44 Q 50 36 46 36 Z" fill="#fff8e1" stroke={stroke} strokeWidth="2.2" />
      {/* helmet */}
      <circle cx="32" cy="26" r="14" fill="#88b8e8" stroke={stroke} strokeWidth="2.4" />
      <circle cx="32" cy="26" r="10" fill="#c8e8f8" stroke={stroke} strokeWidth="1.5" />
      {/* visor glare */}
      <path d="M26 20 Q 28 18 32 20" stroke="#fff" strokeWidth="1.8" fill="none" />
      {/* arms */}
      <path d="M14 44 L 8 40 Q 6 38 8 36 Q 10 34 12 36 L 18 40" fill="#fff8e1" stroke={stroke} strokeWidth="2" />
      <path d="M50 44 L 56 40 Q 58 38 56 36 Q 54 34 52 36 L 46 40" fill="#fff8e1" stroke={stroke} strokeWidth="2" />
      {/* legs */}
      <path d="M22 58 L 20 62 Q 18 64 22 64 L 28 64 Q 30 64 30 62 L 30 58" fill="#fff8e1" stroke={stroke} strokeWidth="2" />
      <path d="M34 58 L 34 62 Q 34 64 38 64 L 42 64 Q 46 64 44 62 L 42 58" fill="#fff8e1" stroke={stroke} strokeWidth="2" />
      {/* pack on back (just a badge) */}
      <rect x="26" y="44" width="12" height="8" rx="2" fill="#f5c542" stroke={stroke} strokeWidth="1.5" />
    </Wrap>
  );
}

export function SpriteCube(p: SVGProps<SVGSVGElement>) {
  return (
    <Wrap {...p}>
      <path d="M32 6 L 56 18 V 46 L 32 58 L 8 46 V 18 Z" fill="#a8d89a" stroke={stroke} strokeWidth="2.2" />
      <path d="M32 6 L 32 30 M 32 30 L 8 18 M 32 30 L 56 18 M 32 30 L 32 58" stroke={stroke} strokeWidth="1.8" fill="none" />
    </Wrap>
  );
}

export function SpriteScan(p: SVGProps<SVGSVGElement>) {
  return (
    <Wrap {...p}>
      <path d="M10 22 V 14 q 0 -4 4 -4 h 8" stroke={stroke} strokeWidth="2.4" fill="none" />
      <path d="M54 22 V 14 q 0 -4 -4 -4 h -8" stroke={stroke} strokeWidth="2.4" fill="none" />
      <path d="M10 42 V 50 q 0 4 4 4 h 8" stroke={stroke} strokeWidth="2.4" fill="none" />
      <path d="M54 42 V 50 q 0 -4 -4 4 h -8" stroke={stroke} strokeWidth="2.4" fill="none" />
      <rect x="20" y="22" width="24" height="20" fill="#9bd0e5" stroke={stroke} strokeWidth="2" rx="3" />
      <path d="M20 32 h 24" stroke={stroke} strokeWidth="2" />
    </Wrap>
  );
}

export function SpriteController(p: SVGProps<SVGSVGElement>) {
  return (
    <Wrap {...p}>
      <path d="M16 20 q -8 0 -8 12 v 8 q 0 8 8 8 q 4 0 6 -4 h 20 q 2 4 6 4 q 8 0 8 -8 v -8 q 0 -12 -8 -12 Z" fill="#f4a8b8" stroke={stroke} strokeWidth="2.2" />
      <circle cx="20" cy="32" r="3" fill="#fff" stroke={stroke} strokeWidth="1.8" />
      <circle cx="44" cy="30" r="2" fill={stroke} />
      <circle cx="50" cy="34" r="2" fill={stroke} />
    </Wrap>
  );
}

export function SpriteMark(p: SVGProps<SVGSVGElement>) {
  return (
    <Wrap {...p}>
      <path d="M10 44 q 4 -28 22 -32 q 18 4 22 32 q -22 -10 -44 0 Z" fill="#f4a26b" stroke={stroke} strokeWidth="2.4" />
      <path d="M22 30 q 10 -6 20 0" stroke={stroke} strokeWidth="2" fill="none" />
      <circle cx="24" cy="22" r="2" fill={stroke} />
      <circle cx="40" cy="22" r="2" fill={stroke} />
    </Wrap>
  );
}

export function SpriteHeart(p: SVGProps<SVGSVGElement>) {
  return (
    <Wrap {...p}>
      <path d="M32 52 C 12 38 8 24 18 16 q 10 -6 14 6 q 4 -12 14 -6 c 10 8 6 22 -14 36 Z" fill="#f4a8b8" stroke={stroke} strokeWidth="2.2" />
    </Wrap>
  );
}

export function SpriteSquiggle(p: SVGProps<SVGSVGElement>) {
  return (
    <Wrap {...p}>
      <path d="M6 32 q 6 -16 14 0 t 14 0 t 14 0 t 14 0" stroke={stroke} strokeWidth="2.6" fill="none" />
    </Wrap>
  );
}

// ─── Hand-drawn organic blobs ─────────────────────────────────────────────────

export function BlobSun(p: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 120 110" fill="none" strokeLinejoin="round" strokeLinecap="round" {...p}>
      <path d="M12 28 Q 6 11 26 7 Q 46 2 64 11 Q 88 5 102 24 Q 113 45 103 66 Q 112 85 86 94 Q 60 102 38 89 Q 14 87 9 60 Q 5 40 12 28 Z" fill="#f5c542" stroke="#1a1a1a" strokeWidth="3.5"/>
      <path d="M18 32 Q 32 40 52 34" fill="none" stroke="#1a1a1a" strokeWidth="1.6" opacity="0.22"/>
      <path d="M22 52 Q 38 46 58 54 Q 74 48 84 56" fill="none" stroke="#1a1a1a" strokeWidth="1.3" opacity="0.16"/>
      <path d="M30 68 Q 46 62 66 70" fill="none" stroke="#1a1a1a" strokeWidth="1.2" opacity="0.14"/>
    </svg>
  );
}

export function BlobLeaf(p: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 120 110" fill="none" strokeLinejoin="round" strokeLinecap="round" {...p}>
      <path d="M14 22 Q 4 38 14 56 Q 8 78 30 90 Q 55 100 78 88 Q 100 82 106 58 Q 112 34 96 20 Q 74 8 48 14 Q 26 10 14 22 Z" fill="#7ec97a" stroke="#1a1a1a" strokeWidth="3.5"/>
      <path d="M20 38 Q 36 32 50 42 Q 66 34 80 44" fill="none" stroke="#1a1a1a" strokeWidth="1.5" opacity="0.2"/>
      <path d="M24 58 Q 42 52 56 62 Q 72 54 88 60" fill="none" stroke="#1a1a1a" strokeWidth="1.3" opacity="0.15"/>
    </svg>
  );
}

export function BlobBlush(p: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 120 105" fill="none" strokeLinejoin="round" strokeLinecap="round" {...p}>
      <path d="M10 30 Q 8 12 26 8 Q 50 3 70 14 Q 92 8 104 26 Q 110 48 98 68 Q 104 82 80 90 Q 52 96 30 82 Q 12 76 8 52 Q 6 38 10 30 Z" fill="#f4a8b8" stroke="#1a1a1a" strokeWidth="3.5"/>
      <path d="M18 36 Q 34 44 52 36 Q 68 46 82 38" fill="none" stroke="#1a1a1a" strokeWidth="1.5" opacity="0.2"/>
      <path d="M22 58 Q 40 52 58 60 Q 74 50 88 58" fill="none" stroke="#1a1a1a" strokeWidth="1.2" opacity="0.15"/>
    </svg>
  );
}
