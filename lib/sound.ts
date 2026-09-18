"use client";

/**
 * Notification chime, synthesised with the Web Audio API — no audio asset to ship
 * and nothing to load before it can play.
 *
 * Browsers block audio until the page has had a user gesture. Every notification
 * here originates from a click (a technician submitting an inspection, stock being
 * confirmed), so the context is always created inside a gesture and is allowed to
 * play. If it is ever blocked, the failure is swallowed — sound is a nicety, the
 * bell badge is the source of truth.
 */

let ctx: AudioContext | null = null;
let lastPlayedAt = 0;

/**
 * Two chimes inside this window would overlap into noise rather than read as two
 * alerts. It also absorbs React's development double-invoke of mount effects, so
 * an arrival announcement rings once either way.
 */
const MIN_GAP_MS = 350;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!ctx) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      ctx = new Ctor();
    }
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(audio: AudioContext, freq: number, startAt: number, duration: number, peak: number) {
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(freq, startAt);

  // Soft attack/decay so it reads as a chime rather than a beep.
  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(peak, startAt + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

  osc.connect(gain).connect(audio.destination);
  osc.start(startAt);
  osc.stop(startAt + duration + 0.02);
}

/**
 * `urgent` is the technician's "customer is in the shop right now" flag — three
 * rising notes, slightly louder, so it is distinguishable from routine traffic.
 */
export function playNotificationSound(urgent = false) {
  const now = Date.now();
  if (now - lastPlayedAt < MIN_GAP_MS) return;
  lastPlayedAt = now;

  const audio = getContext();
  if (!audio) return;
  try {
    const t = audio.currentTime + 0.01;
    if (urgent) {
      tone(audio, 784, t, 0.14, 0.09); // G5
      tone(audio, 988, t + 0.13, 0.14, 0.09); // B5
      tone(audio, 1319, t + 0.26, 0.22, 0.1); // E6
    } else {
      tone(audio, 880, t, 0.12, 0.06); // A5
      tone(audio, 1175, t + 0.11, 0.18, 0.06); // D6
    }
  } catch {
    // Audio unavailable — the visual notification still lands.
  }
}
