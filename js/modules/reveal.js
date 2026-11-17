/* ============================================================
   reveal.js — GSAP ScrollTrigger entrance choreography.
   Headings marked [data-reveal="lines"] reveal line-by-line;
   any other [data-reveal] element fades/slides up on enter.
   This module establishes the GSAP + ScrollTrigger scaffold
   that parallax / journey / counters reuse (the Anchor).
   ============================================================ */

import { register } from "../plugins.js";
import { qs, qsa, prefersReducedMotion } from "../utils.js";

/* Wrap an element into masked lines, PRESERVING inline markup
   (e.g. the gold <em> emphasis) by treating each word and each
   child element as an atomic inline-block token. Returns the
   inner spans to animate. */
function splitLines(el) {
  // 1) Flatten child nodes into measurable tokens.
  const tokens = [];
  el.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      node.textContent.trim().split(/\s+/).filter(Boolean).forEach((w) => {
        const s = document.createElement("span");
        s.textContent = w;
        s.style.display = "inline-block";
        tokens.push(s);
      });
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      node.style.display = "inline-block"; // keep <em> etc. as one unit
      tokens.push(node);
    }
  });

  // 2) Lay tokens out so we can read their line via offsetTop.
  el.textContent = "";
  tokens.forEach((t) => el.append(t, document.createTextNode(" ")));

  const lines = [];
  let top = null;
  tokens.forEach((t) => {
    const o = t.offsetTop;
    if (o !== top) { top = o; lines.push([]); }
    lines[lines.length - 1].push(t);
  });

  // 3) Rebuild as masked lines, re-using the original token nodes.
  el.textContent = "";
  const inners = [];
  lines.forEach((group) => {
    const line = document.createElement("span");
    line.className = "r-line";
    const inner = document.createElement("span");
    inner.className = "r-line-inner";
    group.forEach((t, i) => {
      inner.append(t);
      if (i < group.length - 1) inner.append(document.createTextNode(" "));
    });
    line.append(inner);
    el.append(line);
    inners.push(inner);
  });
  el.style.opacity = "1"; // the mask + translate now carry the hidden state
  return inners;
}

function buildReveals() {
  const gsap = window.gsap;
  const ST = window.ScrollTrigger;
  if (!gsap || !ST) return;
  gsap.registerPlugin(ST);

  // 1) Heading line reveals
  qsa('[data-reveal="lines"]').forEach((el) => {
    const inners = splitLines(el);
    gsap.to(inners, {
      yPercent: 0,
      duration: 0.9,
      ease: "power3.out",
      stagger: 0.12,
      scrollTrigger: { trigger: el, start: "top 85%" },
    });
  });

  // 2) Generic element reveals (batched for performance)
  const items = qsa('[data-reveal="up"], [data-reveal="fade"]');
  if (items.length) {
    ST.batch(items, {
      start: "top 88%",
      onEnter: (batch) =>
        gsap.to(batch, {
          opacity: 1, y: 0,
          duration: 0.8, ease: "power2.out",
          stagger: 0.09, overwrite: true,
        }),
    });
  }

  ST.refresh();
}

function initReveal() {
  if (!qsa("[data-reveal]").length) return; // guard
  if (prefersReducedMotion()) return;        // CSS already shows everything
  // Split after fonts load so line grouping matches final layout.
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(buildReveals);
  } else {
    buildReveals();
  }
}

register(initReveal); // self-registration
