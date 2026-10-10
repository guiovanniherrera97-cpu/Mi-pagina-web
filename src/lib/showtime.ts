/** Domingo 11 de octubre de 2026, hora de Guatemala (UTC−6, sin horario de verano). */
export const EVENT_START = Date.parse("2026-10-11T10:00:00-06:00");
export const EVENT_END = Date.parse("2026-10-11T12:00:00-06:00");

export type Phase = "before" | "live" | "after";

export function phaseOf(now: number): Phase {
  if (now < EVENT_START) return "before";
  if (now < EVENT_END) return "live";
  return "after";
}

export function remaining(now: number) {
  const diff = Math.max(0, EVENT_START - now);
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1000);
  return { days, hours, minutes, seconds };
}

export function pad2(n: number) {
  return String(Math.max(0, Math.floor(n))).padStart(2, "0");
}
