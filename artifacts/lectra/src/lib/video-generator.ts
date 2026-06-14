/**
 * Canvas-based animation video generator.
 * Uses browser-native MediaRecorder + Canvas 2D API.
 * No external deps required — works offline.
 *
 * Generates a 30-fps MP4 (or webm fallback) animation of the lesson
 * sections with title cards, shape visualizations, and key bullets.
 */

import type { Lesson, LessonShape } from "./lesson-generator";

// ─── Colour palette ────────────────────────────────────────────────────────

const PALETTE = {
  sun:     "#f5c542",
  leaf:    "#7ec97a",
  blush:   "#f4a8b8",
  sky:     "#88b8e8",
  orange:  "#f4a26b",
  ink:     "#1a1a1a",
  bg:      "#fffbf0",
  card:    "#ffffff",
  muted:   "#6b6560",
  accent:  "oklch(0.72 0.18 45)",
};

const CARD_COLORS = [PALETTE.sun, PALETTE.leaf, PALETTE.blush, PALETTE.sky];

// ─── Canvas helpers ─────────────────────────────────────────────────────────

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number): number {
  const words = text.split(" ");
  let line = "";
  let currentY = y;
  for (const word of words) {
    const testLine = line + word + " ";
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && line !== "") {
      ctx.fillText(line.trimEnd(), x, currentY);
      currentY += lineHeight;
      line = word + " ";
    } else {
      line = testLine;
    }
  }
  if (line.trim()) {
    ctx.fillText(line.trimEnd(), x, currentY);
    currentY += lineHeight;
  }
  return currentY;
}

// ─── Shape drawing ──────────────────────────────────────────────────────────

function drawShape(ctx: CanvasRenderingContext2D, shape: LessonShape, cx: number, cy: number, size: number, t: number) {
  const color = /^#[0-9a-fA-F]{6}$/.test(shape.color) ? shape.color : "#f5c542";
  ctx.save();
  ctx.translate(cx, cy);

  const type = shape.type;

  if (type === "cube") {
    // Rotating isometric cube
    const angle = t * 1.2;
    const s = size * 0.55;
    ctx.rotate(angle);
    ctx.fillStyle = color;
    ctx.strokeStyle = PALETTE.ink;
    ctx.lineWidth = 2;
    // top face
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.7);
    ctx.lineTo(s * 0.7, -s * 0.3);
    ctx.lineTo(0, s * 0.1);
    ctx.lineTo(-s * 0.7, -s * 0.3);
    ctx.closePath();
    ctx.fillStyle = color + "cc";
    ctx.fill(); ctx.stroke();
    // right face
    ctx.beginPath();
    ctx.moveTo(0, s * 0.1);
    ctx.lineTo(s * 0.7, -s * 0.3);
    ctx.lineTo(s * 0.7, s * 0.5);
    ctx.lineTo(0, s * 0.9);
    ctx.closePath();
    ctx.fillStyle = color + "88";
    ctx.fill(); ctx.stroke();
    // left face
    ctx.beginPath();
    ctx.moveTo(0, s * 0.1);
    ctx.lineTo(-s * 0.7, -s * 0.3);
    ctx.lineTo(-s * 0.7, s * 0.5);
    ctx.lineTo(0, s * 0.9);
    ctx.closePath();
    ctx.fillStyle = color + "66";
    ctx.fill(); ctx.stroke();

  } else if (type === "torus") {
    // Torus as concentric rings
    ctx.rotate(t * 0.8);
    for (let i = 0; i < 3; i++) {
      const r = size * (0.3 + i * 0.18);
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.strokeStyle = i === 1 ? color : color + "88";
      ctx.lineWidth = i === 1 ? 8 : 4;
      ctx.stroke();
    }

  } else if (type === "icosahedron") {
    // Multi-triangle shape
    ctx.rotate(t * 0.6);
    const pts = 6;
    ctx.fillStyle = color + "cc";
    ctx.strokeStyle = PALETTE.ink;
    ctx.lineWidth = 1.5;
    for (let i = 0; i < pts; i++) {
      const a1 = (i / pts) * Math.PI * 2;
      const a2 = ((i + 1) / pts) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(a1) * size * 0.8, Math.sin(a1) * size * 0.8);
      ctx.lineTo(Math.cos(a2) * size * 0.8, Math.sin(a2) * size * 0.8);
      ctx.closePath();
      ctx.fillStyle = i % 2 === 0 ? color + "cc" : color + "88";
      ctx.fill(); ctx.stroke();
    }

  } else if (type === "dodecahedron") {
    ctx.rotate(t * 0.5);
    const pts = 5;
    ctx.strokeStyle = PALETTE.ink;
    ctx.lineWidth = 2;
    for (let ring = 0; ring < 2; ring++) {
      const r = size * (0.5 + ring * 0.3);
      ctx.beginPath();
      for (let i = 0; i <= pts; i++) {
        const a = (i / pts) * Math.PI * 2 + (ring * Math.PI / pts);
        ctx[i === 0 ? "moveTo" : "lineTo"](Math.cos(a) * r, Math.sin(a) * r);
      }
      ctx.closePath();
      ctx.fillStyle = ring === 0 ? color + "aa" : "transparent";
      ctx.fill(); ctx.stroke();
    }

  } else if (type === "cone") {
    ctx.rotate(t * 0.9);
    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.lineTo(size * 0.7, size * 0.6);
    ctx.lineTo(-size * 0.7, size * 0.6);
    ctx.closePath();
    ctx.fillStyle = color + "cc";
    ctx.strokeStyle = PALETTE.ink;
    ctx.lineWidth = 2;
    ctx.fill(); ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(0, size * 0.6, size * 0.7, size * 0.2, 0, 0, Math.PI * 2);
    ctx.fillStyle = color + "88";
    ctx.fill(); ctx.stroke();

  } else if (type === "cylinder") {
    ctx.rotate(t * 0.7);
    const w = size * 0.65;
    const h = size * 1.2;
    // Body
    ctx.fillStyle = color + "cc";
    ctx.strokeStyle = PALETTE.ink;
    ctx.lineWidth = 2;
    ctx.fillRect(-w, -h / 2, w * 2, h);
    ctx.strokeRect(-w, -h / 2, w * 2, h);
    // Top ellipse
    ctx.beginPath();
    ctx.ellipse(0, -h / 2, w, w * 0.3, 0, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill(); ctx.stroke();
    // Bottom ellipse
    ctx.beginPath();
    ctx.ellipse(0, h / 2, w, w * 0.3, 0, 0, Math.PI * 2);
    ctx.fillStyle = color + "88";
    ctx.fill(); ctx.stroke();

  } else if (type === "star") {
    ctx.rotate(t * 1.1);
    const pts5 = 5;
    const outer = size;
    const inner = size * 0.42;
    ctx.beginPath();
    for (let i = 0; i < pts5 * 2; i++) {
      const a = (i * Math.PI) / pts5 - Math.PI / 2;
      const r = i % 2 === 0 ? outer : inner;
      ctx[i === 0 ? "moveTo" : "lineTo"](Math.cos(a) * r, Math.sin(a) * r);
    }
    ctx.closePath();
    ctx.fillStyle = color + "ee";
    ctx.strokeStyle = PALETTE.ink;
    ctx.lineWidth = 2;
    ctx.fill(); ctx.stroke();

  } else if (type === "organic") {
    // Wobbly blob
    ctx.beginPath();
    const blobPts = 8;
    for (let i = 0; i <= blobPts; i++) {
      const a = (i / blobPts) * Math.PI * 2;
      const noise = 0.15 * Math.sin(a * 3 + t * 2) + 0.1 * Math.cos(a * 5 + t);
      const r = size * (0.8 + noise);
      if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
      else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    ctx.closePath();
    ctx.fillStyle = color + "cc";
    ctx.strokeStyle = PALETTE.ink;
    ctx.lineWidth = 2;
    ctx.fill(); ctx.stroke();

  } else if (type === "molecule") {
    // Atom + bonds
    const atomPositions = [[0, 0], [size * 0.8, size * 0.5], [-size * 0.8, size * 0.5], [0, -size * 0.9]];
    // Draw bonds first
    ctx.strokeStyle = "#d4d4d4";
    ctx.lineWidth = 4;
    for (let i = 1; i < atomPositions.length; i++) {
      ctx.beginPath();
      ctx.moveTo(atomPositions[0][0], atomPositions[0][1]);
      ctx.lineTo(atomPositions[i][0], atomPositions[i][1]);
      ctx.stroke();
    }
    // Draw atoms
    atomPositions.forEach(([x, y], i) => {
      ctx.beginPath();
      ctx.arc(x, y, i === 0 ? size * 0.32 : size * 0.22, 0, Math.PI * 2);
      ctx.fillStyle = i === 0 ? color : "#f5c542";
      ctx.strokeStyle = PALETTE.ink;
      ctx.lineWidth = 2;
      ctx.fill(); ctx.stroke();
    });
    ctx.rotate(t * 0.5);

  } else if (type === "terrain") {
    // Wavy terrain profile
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.fillStyle = color + "44";
    ctx.beginPath();
    ctx.moveTo(-size, size * 0.5);
    for (let x = -size; x <= size; x += 4) {
      const y = Math.sin((x / size) * Math.PI * 2 + t) * size * 0.35 + Math.cos((x / size) * Math.PI * 3 + t * 0.7) * size * 0.15;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(size, size * 0.5);
    ctx.closePath();
    ctx.fill(); ctx.stroke();

  } else {
    // Default: sphere-like circle with latitude lines
    ctx.rotate(t * 0.6);
    ctx.beginPath();
    ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.fillStyle = color + "cc";
    ctx.strokeStyle = PALETTE.ink;
    ctx.lineWidth = 2;
    ctx.fill(); ctx.stroke();
    // Latitude lines
    for (let i = 1; i < 4; i++) {
      const ry = (i / 4 - 0.5) * size * 2;
      const rw = Math.sqrt(Math.max(0, size * size - ry * ry));
      if (rw > 2) {
        ctx.beginPath();
        ctx.ellipse(0, ry, rw, rw * 0.3, 0, 0, Math.PI * 2);
        ctx.strokeStyle = PALETTE.ink + "44";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  }

  ctx.restore();
}

// ─── Frame renderers ─────────────────────────────────────────────────────────

function renderTitleCard(ctx: CanvasRenderingContext2D, W: number, H: number, lesson: Lesson, progress: number) {
  // Background
  ctx.fillStyle = PALETTE.bg;
  ctx.fillRect(0, 0, W, H);

  // Big accent blob top-right
  ctx.save();
  ctx.globalAlpha = 0.18;
  ctx.fillStyle = PALETTE.sun;
  ctx.beginPath();
  ctx.arc(W * 0.88, H * 0.15, H * 0.45, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Lectra logo mark (simple mark)
  const logoY = H * 0.12;
  ctx.fillStyle = PALETTE.ink;
  ctx.font = `bold 24px sans-serif`;
  ctx.fillText("◆ Lectra", 60, logoY);

  // Title — slides up
  const slideY = (1 - Math.min(1, progress * 2)) * 40;
  const alpha = Math.min(1, progress * 2.5);

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = PALETTE.ink;
  ctx.font = `bold ${Math.round(W * 0.055)}px serif`;
  ctx.textAlign = "center";
  const titleY = H * 0.42 + slideY;
  wrapText(ctx, lesson.title, W / 2, titleY, W * 0.75, W * 0.068);

  ctx.font = `${Math.round(W * 0.028)}px sans-serif`;
  ctx.fillStyle = PALETTE.muted;
  ctx.fillText(lesson.subtitle, W / 2, H * 0.58 + slideY);

  // Level + duration chips
  const chipY = H * 0.68 + slideY;
  const chips = [lesson.level, lesson.duration];
  const chipW = 140;
  const totalW = chips.length * chipW + (chips.length - 1) * 16;
  let chipX = W / 2 - totalW / 2;
  for (const chip of chips) {
    roundRect(ctx, chipX, chipY, chipW, 38, 19);
    ctx.fillStyle = PALETTE.ink;
    ctx.fill();
    ctx.font = `bold 13px sans-serif`;
    ctx.fillStyle = PALETTE.bg;
    ctx.fillText(chip, chipX + chipW / 2, chipY + 24);
    chipX += chipW + 16;
  }
  ctx.restore();
}

function renderSectionCard(
  ctx: CanvasRenderingContext2D,
  W: number, H: number,
  section: { heading: string; body: string; bullets: string[]; shape: LessonShape },
  index: number,
  progress: number,
  animTime: number,
) {
  const bg = CARD_COLORS[index % CARD_COLORS.length];

  // Background
  ctx.fillStyle = PALETTE.bg;
  ctx.fillRect(0, 0, W, H);

  // Left panel — big colour block
  const leftW = W * 0.42;
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, leftW, H);

  // Section number
  ctx.fillStyle = PALETTE.ink + "55";
  ctx.font = `bold ${Math.round(H * 0.22)}px serif`;
  ctx.textAlign = "center";
  ctx.fillText(String(index + 1).padStart(2, "0"), leftW / 2, H * 0.55);

  // Animated shape
  const shapeSize = Math.min(leftW, H) * 0.22;
  drawShape(ctx, section.shape, leftW / 2, H * 0.45, shapeSize, animTime);

  // Shape label
  ctx.fillStyle = PALETTE.ink;
  ctx.font = `bold 14px monospace`;
  ctx.textAlign = "center";
  ctx.fillText(section.shape.label.toUpperCase(), leftW / 2, H * 0.82);

  // Right panel — text
  const padL = leftW + 48;
  const textW = W - padL - 48;
  const slideX = (1 - Math.min(1, progress * 2.5)) * 30;
  const alpha = Math.min(1, progress * 2.5);

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(slideX, 0);

  // Section tag
  ctx.fillStyle = "#f4a26b";
  ctx.font = `bold 11px monospace`;
  ctx.textAlign = "left";
  ctx.fillText(`SECTION ${String(index + 1).padStart(2, "0")}`, padL, H * 0.2);

  // Heading
  ctx.fillStyle = PALETTE.ink;
  ctx.font = `bold ${Math.round(W * 0.038)}px serif`;
  const headingEndY = wrapText(ctx, section.heading, padL, H * 0.28, textW, W * 0.046);

  // Body — truncated to ~2 lines
  ctx.font = `${Math.round(W * 0.022)}px sans-serif`;
  ctx.fillStyle = PALETTE.muted;
  const bodyText = section.body.length > 160 ? section.body.slice(0, 157) + "…" : section.body;
  const bodyEndY = wrapText(ctx, bodyText, padL, headingEndY + 12, textW, W * 0.028);

  // Bullets
  const bulletStartY = bodyEndY + 16;
  ctx.font = `${Math.round(W * 0.02)}px sans-serif`;
  section.bullets.slice(0, 3).forEach((b, i) => {
    const by = bulletStartY + i * (W * 0.032);
    // bullet dot
    ctx.fillStyle = "#7ec97a";
    ctx.beginPath();
    ctx.arc(padL + 7, by - 4, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = PALETTE.ink;
    ctx.textAlign = "left";
    const bText = b.length > 80 ? b.slice(0, 77) + "…" : b;
    ctx.fillText(bText, padL + 18, by);
  });

  ctx.restore();

  // Lectra watermark bottom-right
  ctx.fillStyle = PALETTE.ink + "33";
  ctx.font = `bold 13px sans-serif`;
  ctx.textAlign = "right";
  ctx.fillText("Lectra", W - 24, H - 18);
}

function renderOutroCard(ctx: CanvasRenderingContext2D, W: number, H: number, lesson: Lesson, progress: number) {
  ctx.fillStyle = PALETTE.ink;
  ctx.fillRect(0, 0, W, H);

  // Decorative dots
  const dotColors = [PALETTE.sun, PALETTE.leaf, PALETTE.blush, PALETTE.sky];
  dotColors.forEach((c, i) => {
    ctx.save();
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(W * (0.1 + i * 0.28), H * 0.9, H * 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  const alpha = Math.min(1, progress * 3);
  ctx.save();
  ctx.globalAlpha = alpha;

  ctx.fillStyle = PALETTE.sun;
  ctx.font = `bold ${Math.round(W * 0.055)}px serif`;
  ctx.textAlign = "center";
  ctx.fillText(lesson.title, W / 2, H * 0.38);

  ctx.fillStyle = "#ffffff88";
  ctx.font = `${Math.round(W * 0.025)}px sans-serif`;
  ctx.fillText("Made with Lectra · lectra.id", W / 2, H * 0.52);

  // Section count badge
  roundRect(ctx, W / 2 - 80, H * 0.6, 160, 44, 22);
  ctx.fillStyle = PALETTE.sun + "33";
  ctx.fill();
  ctx.strokeStyle = PALETTE.sun;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = PALETTE.sun;
  ctx.font = `bold 15px sans-serif`;
  ctx.fillText(`${lesson.sections.length} sections · ${lesson.vocabulary.length} terms`, W / 2, H * 0.638);

  ctx.restore();
}

// ─── Main export ─────────────────────────────────────────────────────────────

export interface VideoGeneratorOptions {
  width?: number;
  height?: number;
  fps?: number;
  /** seconds per card */
  cardDuration?: number;
  onProgress?: (pct: number) => void;
}

/**
 * Generates an animated MP4/WebM video from a Lesson and returns a Blob URL.
 * Falls back to WebM if MP4 is not supported.
 */
export async function generateLessonVideo(
  lesson: Lesson,
  opts: VideoGeneratorOptions = {},
): Promise<{ url: string; mimeType: string; filename: string }> {
  const {
    width = 1280,
    height = 720,
    fps = 30,
    cardDuration = 4,
    onProgress,
  } = opts;

  // Pick supported MIME type
  const mimeTypes = [
    "video/mp4",
    "video/webm;codecs=h264",
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm",
  ];
  const mimeType = mimeTypes.find((m) => MediaRecorder.isTypeSupported(m)) ?? "video/webm";
  const ext = mimeType.startsWith("video/mp4") ? "mp4" : "webm";

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  const chunks: Blob[] = [];
  const stream = canvas.captureStream(fps);
  const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 4_000_000 });

  recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

  // Cards: title + sections + outro
  const cards: Array<{ type: "title" | "section" | "outro"; index?: number }> = [
    { type: "title" },
    ...lesson.sections.map((_, i) => ({ type: "section" as const, index: i })),
    { type: "outro" },
  ];

  const totalFrames = cards.length * cardDuration * fps;
  let frame = 0;

  return new Promise((resolve, reject) => {
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType });
      const url = URL.createObjectURL(blob);
      const safe = lesson.title.replace(/[^a-zA-Z0-9\u00C0-\u017E\s]/g, "").replace(/\s+/g, "-").toLowerCase();
      resolve({ url, mimeType, filename: `lectra-${safe}.${ext}` });
    };
    recorder.onerror = (e) => reject(new Error("MediaRecorder error: " + e));

    recorder.start();

    let cardIndex = 0;
    let cardFrame = 0;
    const framesPerCard = cardDuration * fps;

    function renderFrame() {
      if (frame >= totalFrames) {
        recorder.stop();
        return;
      }

      const progress = cardFrame / framesPerCard;
      const card = cards[cardIndex];
      const animTime = frame / fps;

      if (card.type === "title") {
        renderTitleCard(ctx, width, height, lesson, progress);
      } else if (card.type === "section" && card.index !== undefined) {
        renderSectionCard(ctx, width, height, lesson.sections[card.index], card.index, progress, animTime);
      } else {
        renderOutroCard(ctx, width, height, lesson, progress);
      }

      frame++;
      cardFrame++;
      if (cardFrame >= framesPerCard) {
        cardIndex++;
        cardFrame = 0;
      }

      onProgress?.(Math.round((frame / totalFrames) * 100));

      // Use requestAnimationFrame when available, otherwise setTimeout
      if (typeof requestAnimationFrame !== "undefined") {
        requestAnimationFrame(renderFrame);
      } else {
        setTimeout(renderFrame, 0);
      }
    }

    requestAnimationFrame(renderFrame);
  });
}
