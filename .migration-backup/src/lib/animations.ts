/**
 * Anime.js v4 + Framer Motion animation utilities for Lectra.
 */

import { animate, stagger } from "animejs";

export function animateCounter(
  el: HTMLElement | null,
  target: number,
  duration = 1200,
): void {
  if (!el) return;
  const obj = { val: 0 };
  animate(obj, {
    val: target,
    duration,
    ease: "outExpo",
    onUpdate: () => {
      el.textContent = Math.round(obj.val).toLocaleString();
    },
  });
}

export function staggerFadeIn(selector: string, delay = 80): void {
  animate(selector, {
    opacity: [0, 1],
    translateY: [24, 0],
    delay: stagger(delay),
    duration: 700,
    ease: "outCubic",
  });
}

export function pulseElement(el: HTMLElement | null): void {
  if (!el) return;
  animate(el, {
    scale: [1, 1.05, 1],
    duration: 600,
    ease: "inOutQuad",
  });
}

export function floatLoop(el: HTMLElement | null) {
  if (!el) return null;
  return animate(el, {
    translateY: [-8, 8],
    duration: 2000,
    alternate: true,
    loop: true,
    ease: "inOutSine",
  });
}

export const framerSpring = {
  type: "spring" as const,
  stiffness: 260,
  damping: 20,
};

export const framerFadeUp = {
  initial: { opacity: 0, y: 32 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
};

export const framerStagger = (i: number) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] },
});

export const framerScaleIn = {
  initial: { opacity: 0, scale: 0.92 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
};
