/* ============================================================
   nav.js — Navbar behaviour: sticky-scroll state, mobile
   drawer toggle, and scroll-spy for the active link.
   ============================================================ */

import { register } from "../plugins.js";
import { qs, qsa, on } from "../utils.js";

function initNav() {
  const nav = qs("#siteNav");
  if (!nav) return; // early-return guard

  const toggle = qs("#navToggle", nav);
  const scrim = qs("#navScrim");
  const links = qsa(".nav-links a", nav);

  /* --- Sticky state on scroll (rAF-throttled) --- */
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      nav.classList.toggle("scrolled", window.scrollY > 24);
      ticking = false;
    });
  };
  on(window, "scroll", onScroll, { passive: true });
  onScroll();

  /* --- Mobile drawer --- */
  const setOpen = (open) => {
    document.body.classList.toggle("nav-open", open);
    if (toggle) toggle.setAttribute("aria-expanded", String(open));
  };
  on(toggle, "click", () => setOpen(!document.body.classList.contains("nav-open")));
  on(scrim, "click", () => setOpen(false));
  on(document, "keydown", (e) => { if (e.key === "Escape") setOpen(false); });
  links.forEach((a) => on(a, "click", () => setOpen(false)));

  /* --- Scroll-spy: highlight the link whose section is in view --- */
  const byId = new Map();
  links.forEach((a) => {
    const id = a.getAttribute("href");
    if (id && id.startsWith("#") && id.length > 1) byId.set(id.slice(1), a);
  });
  const sections = [...byId.keys()].map((id) => document.getElementById(id)).filter(Boolean);
  if (sections.length) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((l) => l.classList.remove("active"));
        const active = byId.get(entry.target.id);
        if (active) active.classList.add("active");
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
    sections.forEach((s) => spy.observe(s));
  }
}

register(initNav); // self-registration
