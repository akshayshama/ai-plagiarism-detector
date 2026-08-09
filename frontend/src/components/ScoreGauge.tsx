import { useEffect, useState } from 'react';
import { motion, useMotionValue, animate } from 'framer-motion';

interface Props {
  value: number | null; // 0..1, or null when the metric is not applicable
  label: string;
  accent?: 'cyan' | 'green' | 'red' | 'primary';
  size?: number;
}

const ACCENTS = {
  cyan: { color: '#00e5ff', glow: 'glow-cyan' },
  green: { color: '#22e584', glow: 'glow-green' },
  red: { color: '#ff4d6d', glow: '' },
  primary: { color: '#7c5cff', glow: 'glow-primary' },
};

function valueColor(v: number) {
  if (v >= 0.75) return ACCENTS.green.color;
  if (v >= 0.5) return '#ffb020';
  return ACCENTS.red.color;
}

export default function ScoreGauge({ value, label, accent = 'cyan', size = 190 }: Props) {
  const [display, setDisplay] = useState(0);
  const mv = useMotionValue(0);

  useEffect(() => {
    const controls = animate(mv, value ?? 0, {
      duration: 1.4,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(v),
    });
    return controls.stop;
  }, [value, mv]);

  const isNA = value === null || value === undefined;
  const percent = Math.round(display * 100);
  const color = isNA
    ? '#8b90b0'
    : accent === 'cyan'
      ? valueColor(display)
      : ACCENTS[accent].color;
  const R = 74;
  const CIRC = Math.PI * R; // semicircle circumference
  const filled = CIRC * display;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size / 2 + 8 }}>
        <svg viewBox="0 0 160 88" className="h-full w-full">
          <path
            d="M 6 82 A 74 74 0 0 1 154 82"
            fill="none"
            stroke="rgba(148,163,255,0.12)"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <motion.path
            d="M 6 82 A 74 74 0 0 1 154 82"
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={CIRC}
            strokeDashoffset={CIRC - filled}
            style={{ filter: `drop-shadow(0 0 6px ${color}66)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-6">
          <span className="font-mono text-4xl font-bold" style={{ color }}>
            {isNA ? 'N/A' : percent}
            {!isNA && <span className="text-lg">%</span>}
          </span>
        </div>
      </div>
      <p className="mt-2 font-mono text-xs uppercase tracking-[0.25em] text-[#8b90b0]">{label}</p>
    </div>
  );
}
