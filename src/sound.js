// Tiny Web Audio sound engine — no audio files, everything synthesized.
// Gives the party game tactile feedback (taps, correct/wrong chimes, timer
// ticks, win fanfare) without shipping any assets. Respects a mute flag.

let ctx = null;
let muted = false;

function ac() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  // Browsers suspend audio until a user gesture; resume on demand.
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

function tone(freq, start, dur, { type = "sine", gain = 0.14, glideTo } = {}) {
  const c = ac();
  if (!c) return;
  const t0 = c.currentTime + start;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

export function setMuted(v) { muted = v; }
export function isMuted() { return muted; }

export const sfx = {
  tap()      { if (!muted) tone(520, 0, 0.07, { type: "triangle", gain: 0.08 }); },
  select()   { if (muted) return; tone(560, 0, 0.08, { type: "triangle" }); tone(760, 0.06, 0.1, { type: "triangle" }); },
  open()     { if (muted) return; tone(420, 0, 0.12, { type: "sine", glideTo: 720 }); },
  reveal()   { if (muted) return; tone(660, 0, 0.14, { type: "sine" }); tone(880, 0.1, 0.18, { type: "sine" }); },
  correct()  { if (muted) return; [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.09, 0.22, { type: "triangle", gain: 0.16 })); },
  wrong()    { if (muted) return; tone(300, 0, 0.22, { type: "sawtooth", gain: 0.1, glideTo: 150 }); },
  snatch()   { if (muted) return; tone(880, 0, 0.1, { type: "square", gain: 0.1 }); tone(1180, 0.09, 0.14, { type: "square", gain: 0.1 }); },
  tick()     { if (!muted) tone(880, 0, 0.04, { type: "square", gain: 0.05 }); },
  timeup()   { if (muted) return; tone(400, 0, 0.18, { type: "sawtooth", gain: 0.12 }); tone(320, 0.16, 0.3, { type: "sawtooth", gain: 0.12 }); },
  win()      { if (muted) return; [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, i * 0.12, 0.35, { type: "triangle", gain: 0.17 })); },
};
