/* ============================================================
   utils.js — Pure DOM helpers. No app logic, no side effects.
   Every module imports from here instead of touching the DOM
   API directly (DRY: one place for selectors + events).
   ============================================================ */

export const qs  = (sel, ctx = document) => ctx.querySelector(sel);
export const qsa = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

export const on = (el, evt, handler, opts) => {
  if (!el) return () => {};
  el.addEventListener(evt, handler, opts);
  return () => el.removeEventListener(evt, handler, opts);
};

/** Trailing debounce. */
export const debounce = (fn, wait = 150) => {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
};

/** Resolve once the DOM is parsed. */
export const ready = (fn) => {
  if (document.readyState !== "loading") fn();
  else document.addEventListener("DOMContentLoaded", fn, { once: true });
};

/** Single source of truth for the user's motion preference. */
export const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Clamp helper used by the 3D tilt maths. */
export const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
