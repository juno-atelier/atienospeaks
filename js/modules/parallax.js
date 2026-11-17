/* ============================================================
   parallax.js — GSAP parallax drift on any [data-parallax]
   element. data-speed controls strength (default 0.2).
   ============================================================ */

import { register } from "../plugins.js";
import { qsa, prefersReducedMotion } from "../utils.js";

function initParallax() {
  const els = qsa("[data-parallax]");
  if (!els.length) return;                    // guard
  if (prefersReducedMotion()) return;
  const gsap = window.gsap;
  const ST = window.ScrollTrigger;
  if (!gsap || !ST) return;
  gsap.registerPlugin(ST);

  els.forEach((el) => {
    const speed = parseFloat(el.dataset.speed || "0.2");
    gsap.to(el, {
      yPercent: -speed * 100,
      ease: "none",
      scrollTrigger: {
        trigger: el.closest("section") || el,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });
  });
}

register(initParallax); // self-registration
