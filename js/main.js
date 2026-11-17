/* ============================================================
   main.js — Orchestrator. Imports every module (which triggers
   their self-registration), then runs them once the DOM is
   ready. Adding a module = one import line below; nothing else
   here changes. No feature logic lives in this file.

   The animation libraries (GSAP, ScrollTrigger, Anime.js) are
   loaded as plain <script> tags in index.html BEFORE this
   module, so they are available as window globals.
   ============================================================ */

import { runAll } from "./plugins.js";
import { qs, ready } from "./utils.js";

/* Import modules to trigger registration (order = init order) */
import "./modules/nav.js";
import "./modules/reveal.js";
import "./modules/parallax.js";   // drives the hero cut-out drift
import "./modules/journey.js";
import "./modules/counters.js";   // dormant: no [data-count] on the page yet
import "./modules/library.js";
import "./modules/micro.js";
import "./modules/fab.js";
import "./modules/sw.js";

function initApp() {
  runAll();

  // Orchestrator-level housekeeping (no feature logic)
  const yearEl = qs("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
}

ready(initApp);
