import { useEffect, useState } from "react";

const COLORS = ["var(--color-crimson)", "var(--color-gold)", "var(--color-spark)", "var(--color-cream)"];

type Bit = {
  id: number;
  left: number;
  drift: number;
  delay: number;
  duration: number;
  color: string;
  turn: number;
};

let seq = 1;

function makeBits(count: number, burst: boolean): Bit[] {
  return Array.from({ length: count }, () => {
    seq += 1;
    return {
      id: seq,
      left: burst ? 28 + Math.random() * 44 : Math.random() * 100,
      drift: (Math.random() - 0.5) * (burst ? 180 : 80),
      delay: Math.random() * (burst ? 0.15 : 0.4),
      duration: burst ? 1.5 + Math.random() * 0.8 : 7 + Math.random() * 5,
      color: COLORS[seq % COLORS.length] ?? COLORS[0],
      turn: (Math.random() - 0.5) * 280,
    };
  });
}

export function Confetti() {
  const [bits, setBits] = useState<Bit[]>([]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const drop = (burst: boolean) => {
      const next = makeBits(burst ? 28 : 8, burst);
      setBits((current) => [...current, ...next].slice(-70));
      window.setTimeout(() => {
        const ids = new Set(next.map((bit) => bit.id));
        setBits((current) => current.filter((bit) => !ids.has(bit.id)));
      }, burst ? 2800 : 13000);
    };
    drop(false);
    const hello = window.setTimeout(() => drop(true), 700);
    const onBurst = () => drop(true);
    window.addEventListener("circus-burst", onBurst);
    return () => {
      window.clearTimeout(hello);
      window.removeEventListener("circus-burst", onBurst);
    };
  }, []);

  return (
    <div className="confetti" aria-hidden="true">
      {bits.map((bit) => (
        <i
          key={bit.id}
          style={{
            left: `${bit.left}%`,
            background: bit.color,
            animationDelay: `${bit.delay}s`,
            animationDuration: `${bit.duration}s`,
            ["--drift" as string]: `${bit.drift}px`,
            ["--turn" as string]: `${bit.turn}deg`,
          }}
        />
      ))}
    </div>
  );
}
