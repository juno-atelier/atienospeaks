/* ============================================================
   journey.js — The courthouse corridor. On wide screens with
   motion allowed it adds .is-corridor to #journey, pins the
   stage and dollies the camera forward down the hall; frames
   get a spotlight + light sweep as you approach and fade once
   you pass. Everywhere else (≤760px, reduced motion, no JS)
   the CSS vertical framed gallery shows instead.

   gsap.matchMedia() owns the mode switch, so resizing or
   rotating across the breakpoint builds / reverts cleanly.
   Hall geometry is read from the CSS vars on .journey (one
   source of truth, defined in home.css).
   ============================================================ */

import { register } from "../plugins.js";
import { qs, qsa, clamp } from "../utils.js";

/* The ONLY place the corridor breakpoint lives. */
const CORRIDOR_QUERY = "(min-width: 761px) and (prefers-reduced-motion: no-preference)";

/* Total pin length as a multiple of the viewport height.
   Tune by feel in the 2.5–3.2 range (≈250–320vh). */
const PIN_VH = 2.8;

/* Scrub catch-up in seconds. Lower = the camera tracks the scroll more
   tightly (true = frame-synced); higher = floatier. 0.8 measured ~250ms
   of drift after you stop scrolling. */
const SCRUB = 0.35;

/* Body class while the corridor is pinned (navbar.css drops the nav blur). */
const PINNED_CLASS = "corridor-pinned";

/* Depths (px, negative = in front of the camera) at which each
   per-frame effect starts / ends. */
const SPOT_IN   = [-750, -450];
const SPOT_OUT  = [-80, 120];
const SWEEP     = [-650, -250];
const FADE_PAST = [60, 320];

/* ---- Foundation helpers ---- */

/** Read the hall geometry the CSS declares on .journey. */
function readHallGeometry(section) {
  const css = getComputedStyle(section);
  const px = (name) => parseFloat(css.getPropertyValue(name)) || 0;
  return { first: px("--hall-first"), step: px("--hall-step"), dolly: px("--hall-dolly") };
}

/** 0 → 1 as z travels from a to b (clamped). */
function ramp(z, [a, b]) {
  return clamp((z - a) / (b - a), 0, 1);
}

/** Returns a setter that rounds to `steps` and only writes when the value
    changes — frames outside their light window never invalidate their layer. */
function changeOnlySetter(setter, steps) {
  let last = NaN;
  return (v) => {
    const q = Math.round(v * steps) / steps;
    if (q !== last) { last = q; setter(q); }
  };
}

/** One updater per frame: maps timeline progress → glow, sweep, fade. */
function buildFrameUpdater(frame, index, geo) {
  const glow  = qs(".frame-glow", frame);
  const sweep = qs(".frame-sweep", frame);
  const distance = geo.first + index * geo.step;

  const gsap = window.gsap;
  const setFrame = changeOnlySetter(gsap.quickSetter(frame, "opacity"), 64);
  const setGlow  = glow  ? changeOnlySetter(gsap.quickSetter(glow, "opacity"), 32) : () => {};
  const setSweep = sweep ? changeOnlySetter(gsap.quickSetter(sweep, "xPercent"), 1) : () => {};
  let hidden = false;

  return (progress) => {
    const z = -distance + geo.dolly * progress;      // frame depth right now
    const fade = 1 - ramp(z, FADE_PAST);
    setGlow(ramp(z, SPOT_IN) * (1 - ramp(z, SPOT_OUT)));
    setSweep(-120 + 240 * ramp(z, SWEEP));
    setFrame(fade);
    if ((fade <= 0) !== hidden) { hidden = fade <= 0; frame.style.visibility = hidden ? "hidden" : ""; }
  };
}

/** The camera move: forward dolly plus a slight sway (walls/floor drift). */
function buildDollyTimeline(world, geo, updaters) {
  const gsap = window.gsap;
  const tl = gsap.timeline({
    paused: true,
    onUpdate() { const p = this.progress(); updaters.forEach((u) => u(p)); },
  });
  tl.fromTo(world, { z: 0 }, { z: geo.dolly, ease: "none", duration: 1 }, 0);
  tl.fromTo(world, { rotationY: -1.2, y: 8 }, { rotationY: 1.2, y: -8, ease: "sine.inOut", duration: 1 }, 0);
  return tl;
}

/** Pin the stage and scrub the timeline across ~PIN_VH viewports. */
function pinCorridor(stage, tl) {
  window.ScrollTrigger.create({
    animation: tl,
    trigger: stage,
    start: "top top",
    end: () => "+=" + Math.round(window.innerHeight * PIN_VH),
    scrub: SCRUB,
    pin: true,
    toggleClass: { targets: document.body, className: PINNED_CLASS },
    anticipatePin: 1,
    invalidateOnRefresh: true,
  });
}

/** Enter corridor mode; returns the cleanup matchMedia runs on exit. */
function setupCorridor(section, stage, world) {
  section.classList.add("is-corridor");              // CSS lays out the hall first
  const geo = readHallGeometry(section);
  const frames = qsa(".milestone:not(.milestone--today)", section);
  const updaters = frames.map((f, i) => buildFrameUpdater(f, i, geo));

  const tl = buildDollyTimeline(world, geo, updaters);
  updaters.forEach((u) => u(0));                      // correct state before first scroll
  pinCorridor(stage, tl);

  return () => {
    section.classList.remove("is-corridor");
    document.body.classList.remove(PINNED_CLASS);
    window.gsap.set(qsa(".milestone, .frame-glow, .frame-sweep", section), { clearProps: "opacity,visibility,transform" });
  };
}

function initJourney() {
  const section = qs("#journey");
  const stage = section && qs(".corridor", section);
  const world = stage && qs(".corridor-world", stage);
  if (!section || !stage || !world) return;          // guard
  const gsap = window.gsap;
  const ST = window.ScrollTrigger;
  if (!gsap || !ST || !gsap.matchMedia) return;      // gallery stays
  gsap.registerPlugin(ST);

  gsap.matchMedia().add(CORRIDOR_QUERY, () => setupCorridor(section, stage, world));
}

register(initJourney); // self-registration
