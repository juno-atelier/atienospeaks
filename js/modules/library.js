/* ============================================================
   library.js — Gentle lift + small tilt on the book covers.
   The covers are pre-rendered 3D cut-outs, so the motion stays
   subtle: ~5° tilt toward the pointer, a 6px lift, and the
   shelf's contact shadow shrinks/fades as the book rises.

   Tilt is applied to the inner .book-tilt wrapper; the outer
   .book keeps [data-reveal] for reveal.js, so the two never
   write the same transform. Fine pointers + motion only;
   touch, coarse pointers and reduced-motion get static covers.
   ============================================================ */

import { register } from "../plugins.js";
import { qs, qsa, on, prefersReducedMotion } from "../utils.js";

const MAX_TILT = 5;      // degrees
const LIFT     = -6;     // px
const RELEASE  = { duration: 450, easing: "easeOutQuad" };
const SHELF_UP = { scale: 0.86, opacity: 0.6 };

/* ---- Foundation helpers ---- */

/** True only for a mouse/trackpad that can hover. */
function canHoverFinely() {
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

/** Pointer position within a cached rect, as -0.5 … 0.5 on each axis. */
function pointerOffset(e, rect) {
  return {
    x: (e.clientX - rect.left) / rect.width - 0.5,
    y: (e.clientY - rect.top) / rect.height - 0.5,
  };
}

/** Write the tilt transform (format anime.js can parse back on release). */
function applyTilt(tilt, { x, y }) {
  tilt.style.transform =
    `translateY(${LIFT}px) rotateY(${x * MAX_TILT}deg) rotateX(${-y * MAX_TILT}deg)`;
}

/** Wire one book: cache its rect on enter, tilt on move (rAF), release on leave. */
function bindBook(book, anime) {
  const tilt  = qs(".book-tilt", book);
  const shelf = qs(".book-shelf", book);
  if (!tilt) return;

  let rect = null;
  let frame = 0;
  let last = null;

  on(book, "pointerenter", () => {
    rect = book.getBoundingClientRect();           // once per hover, not per move
    anime.remove([tilt, shelf].filter(Boolean));
    if (shelf) anime({ targets: shelf, ...SHELF_UP, duration: 250, easing: "easeOutQuad" });
  });

  on(book, "pointermove", (e) => {
    if (!rect) return;
    last = pointerOffset(e, rect);
    if (frame) return;
    frame = requestAnimationFrame(() => { frame = 0; applyTilt(tilt, last); });
  }, { passive: true });

  on(book, "pointerleave", () => {
    rect = null;
    if (frame) { cancelAnimationFrame(frame); frame = 0; }
    anime({ targets: tilt, translateY: 0, rotateX: 0, rotateY: 0, ...RELEASE });
    if (shelf) anime({ targets: shelf, scale: 1, opacity: 1, ...RELEASE });
  });
}

function initLibrary() {
  const books = qsa(".book");
  if (!books.length) return;                       // guard
  if (prefersReducedMotion() || !canHoverFinely()) return;
  const anime = window.anime;
  if (!anime) return;                              // static covers

  books.forEach((book) => bindBook(book, anime));
}

register(initLibrary); // self-registration
