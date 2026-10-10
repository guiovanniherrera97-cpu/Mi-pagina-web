/** Lejana caja de música de feria. Apagada hasta que alguien la enciende. */
const NOTES = [262, 330, 392, 523, 392, 330, 440, 392, 349, 294, 330, 392];

type Rig = {
  ctx: AudioContext;
  gain: GainNode;
  timer: number;
  next: number;
  step: number;
  stopped: boolean;
};

let rig: Rig | null = null;

function tone(ctx: AudioContext, dest: GainNode, freq: number, time: number, amount = 1) {
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(freq, time);
  g.gain.setValueAtTime(0.0001, time);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002, 0.85 * amount), time + 0.03);
  g.gain.exponentialRampToValueAtTime(0.0001, time + 0.36);
  osc.connect(g);
  g.connect(dest);
  osc.start(time);
  osc.stop(time + 0.4);
}

export function setAmbience(on: boolean) {
  if (!on) {
    stopAmbience();
    return;
  }
  if (rig && !rig.stopped) return;
  const ctx = new AudioContext();
  const gain = ctx.createGain();
  gain.gain.value = 0.05;
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 1600;
  gain.connect(filter);
  filter.connect(ctx.destination);

  const next: Rig = {
    ctx,
    gain,
    timer: 0,
    next: ctx.currentTime + 0.08,
    step: 0,
    stopped: false,
  };
  rig = next;

  const tick = () => {
    if (next.stopped) return;
    const horizon = ctx.currentTime + 0.28;
    while (next.next < horizon) {
      const freq = NOTES[next.step % NOTES.length] ?? 392;
      tone(ctx, gain, freq, next.next);
      if (next.step % 4 === 0) tone(ctx, gain, freq / 2, next.next, 0.45);
      next.next += 0.44;
      next.step += 1;
    }
  };

  next.timer = window.setInterval(tick, 140);
  void ctx.resume();
}

export function stopAmbience() {
  const current = rig;
  if (!current) return;
  current.stopped = true;
  window.clearInterval(current.timer);
  rig = null;
  try {
    current.gain.gain.cancelScheduledValues(current.ctx.currentTime);
    current.gain.gain.setValueAtTime(Math.max(0.0001, current.gain.gain.value), current.ctx.currentTime);
    current.gain.gain.linearRampToValueAtTime(0.0001, current.ctx.currentTime + 0.08);
  } catch {
    /* context already closing */
  }
  window.setTimeout(() => {
    void current.ctx.close().catch(() => undefined);
  }, 180);
}
