/* ============================================================
   sw.js (module) — Registers the root service worker once the
   page has finished loading, so caching never competes with
   first paint. Only runs over http(s)/localhost.
   ============================================================ */

import { register } from "../plugins.js";
import { on } from "../utils.js";

function initSw() {
  if (!("serviceWorker" in navigator)) return; // guard
  if (location.protocol === "file:") return;     // SW needs a server

  on(window, "load", () => {
    navigator.serviceWorker
      .register("sw.js")
      .catch((err) => console.warn("[Atienospeaks] SW registration failed:", err));
  });
}

register(initSw); // self-registration
