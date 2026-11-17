/* ============================================================
   plugins.js — The module registry. The array is private;
   register() and runAll() are the ONLY exports. Nothing else
   belongs in this file.
   ============================================================ */

const plugins = [];

/** A module self-registers its init function here. */
export const register = (fn) => plugins.push(fn);

/** main.js calls this once, after the DOM is ready. Guarded
    inits mean a throw in one module is isolated per call site. */
export const runAll = () => {
  plugins.forEach((fn) => {
    try { fn(); }
    catch (err) { console.error("[Atienospeaks] module failed:", err); }
  });
};
