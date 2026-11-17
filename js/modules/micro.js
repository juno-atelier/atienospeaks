/* ============================================================
   micro.js — Anime.js micro-interactions:
   • the hero copy staggers in on load
   • the gold swoosh under the title draws itself
   • buttons give a tactile press
   Reduced-motion users see the final state with no motion.
   ============================================================ */

import { register } from "../plugins.js";
import { qs, qsa, on, prefersReducedMotion } from "../utils.js";

/* Draw the swoosh stroke from 0 to full length. */
function drawSwoosh(anime) {
  const path = qs(".hero-swoosh path");
  if (!path) return;
  const len = path.getTotalLength();
  path.style.strokeDasharray = len;
  path.style.strokeDashoffset = len;
  anime({
    targets: path,
    strokeDashoffset: [len, 0],
    duration: 1500,
    easing: "easeInOutSine",
    delay: 650,
  });
}

function initMicro() {
  const hero = qs(".hero");
  if (!hero) return;                       // guard
  const anime = window.anime;
  const items = qsa(".intro-item");

  // No-motion path: reveal everything, skip the draw animation.
  if (prefersReducedMotion() || !anime) {
    items.forEach((i) => { i.style.opacity = "1"; i.style.transform = "none"; });
    const p = qs(".hero-swoosh path");
    if (p) p.style.strokeDasharray = "none";
    return;
  }

  anime.set(items, { opacity: 0, translateY: 26 });
  anime({
    targets: items,
    opacity: 1,
    translateY: 0,
    delay: anime.stagger(110, { start: 200 }),
    duration: 900,
    easing: "easeOutExpo",
  });

  drawSwoosh(anime);

  // Tactile button press
  qsa(".btn").forEach((b) =>
    on(b, "pointerdown", () =>
      anime({ targets: b, scale: [1, 0.96], duration: 130, direction: "alternate", easing: "easeOutQuad" })
    )
  );
}

register(initMicro); // self-registration
