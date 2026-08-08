import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BrainCircuit, GitCompareArrows, ShieldCheck, Activity } from 'lucide-react';

const STEPS = [
  { label: 'Tokenizing & preprocessing', icon: Activity, color: '#7c5cff' },
  { label: 'RoBERTa linguistic forensics', icon: BrainCircuit, color: '#00e5ff' },
  { label: 'Semantic fingerprinting', icon: GitCompareArrows, color: '#22e584' },
  { label: 'Fusing verdicts', icon: ShieldCheck, color: '#7c5cff' },
];

export default function AnalyzingOverlay() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((s) => Math.min(s + 1, STEPS.length - 1));
    }, 900);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#05060f]/85 backdrop-blur-xl"
    >
      <div className="relative w-full max-w-md px-6">
        <div className="relative h-56 w-full overflow-hidden rounded-2xl border border-[#7c5cff]/30 bg-[#0b0d1a] glow-primary">
          <div className="cyber-grid absolute inset-0 animate-grid-pan opacity-70" />

          <div className="absolute left-0 right-0 top-0 flex h-2 items-center justify-center">
            <span className="h-full w-32 rounded-b bg-[#00e5ff]/60 glow-cyan" />
          </div>

          <div
            className="absolute left-0 right-0 h-24 animate-scan"
            style={{
              background:
                'linear-gradient(to bottom, transparent, rgba(0,229,255,0.15), rgba(0,229,255,0.35), transparent)',
            }}
          />

          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'linear' }}
              className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#7c5cff]/30 border-t-[#7c5cff]"
            >
              <BrainCircuit className="h-6 w-6 text-[#c4b8ff]" />
            </motion.div>
            <p className="font-mono text-sm font-bold uppercase tracking-[0.3em] text-[#00e5ff]">
              Analyzing
            </p>
            <p className="font-mono text-xs text-[#8b90b0]">
              running deep models locally…
            </p>
          </div>

          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step ? 'w-8 bg-[#00e5ff]' : i < step ? 'w-4 bg-[#22e584]' : 'w-4 bg-white/15'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const active = i === step;
            const done = i < step;
            return (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: done || active ? 1 : 0.35, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex items-center gap-3"
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all ${
                    done
                      ? 'bg-[#22e584]/15 text-[#22e584]'
                      : active
                        ? 'bg-[#00e5ff]/15 text-[#00e5ff]'
                        : 'bg-white/5 text-[#8b90b0]'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span
                  className={`font-mono text-sm transition-colors ${
                    done ? 'text-[#22e584]' : active ? 'text-[#e8eaff]' : 'text-[#8b90b0]'
                  }`}
                >
                  {s.label}
                </span>
                {active && <span className="ml-auto h-2 w-2 animate-blink rounded-full bg-[#00e5ff]" />}
                {done && <span className="ml-auto font-mono text-[10px] text-[#22e584]">✓ done</span>}
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
