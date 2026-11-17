/* ============================================================
   fab.js — Scroll-to-top floating action button.
   ============================================================ */

import { register } from "../plugins.js";
import { qs, on, prefersReducedMotion } from "../utils.js";

function initFab() {
  const btn = qs("#toTop");
  if (!btn) return; // guard

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      btn.classList.toggle("visible", window.scrollY > 640);
      ticking = false;
    });
  };
  on(window, "scroll", onScroll, { passive: true });
  onScroll();

  on(btn, "click", () => {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  });
}

register(initFab); // self-registration
