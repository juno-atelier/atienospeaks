/* ============================================================
   counters.js — Counts [data-count] numbers up when they enter
   the viewport. data-count = target, data-suffix / data-prefix
   optional. Respects reduced motion (shows final value).
   ============================================================ */

import { register } from "../plugins.js";
import { qsa, prefersReducedMotion } from "../utils.js";

function format(n, el) {
  const val = Math.round(n).toLocaleString("en-US");
  return (el.dataset.prefix || "") + val + (el.dataset.suffix || "");
}

function initCounters() {
  const els = qsa("[data-count]");
  if (!els.length) return; // guard

  const reduced = prefersReducedMotion();
  const gsap = window.gsap;
  const ST = window.ScrollTrigger;

  els.forEach((el) => {
    const target = parseFloat(el.dataset.count);
    if (reduced || !gsap || !ST) { el.textContent = format(target, el); return; }

    gsap.registerPlugin(ST);
    const obj = { v: 0 };
    gsap.to(obj, {
      v: target,
      duration: 1.6,
      ease: "power2.out",
      onUpdate: () => { el.textContent = format(obj.v, el); },
      scrollTrigger: { trigger: el, start: "top 90%", once: true },
    });
  });
}

register(initCounters); // self-registration
