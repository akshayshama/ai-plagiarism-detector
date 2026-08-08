import { motion } from 'framer-motion';
import { Cpu } from 'lucide-react';

export default function NeonTitle() {
  const letters = 'AI CODE PLAGIARISM DETECTOR'.split('');

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="flex items-center gap-3 rounded-full border border-[#7c5cff]/30 bg-[#7c5cff]/10 px-4 py-1.5"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-[#22e584]" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#22e584]" />
        </span>
        <span className="font-mono text-xs uppercase tracking-[0.3em] text-[#8b90b0]">
          Deep Scan Engine · v2.0
        </span>
      </motion.div>

      <h1 className="relative font-sans text-5xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
        {letters.map((ch, i) => (
          <motion.span
            key={i}
            className="inline-block title-gradient"
            initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{
              delay: 0.05 * i,
              duration: 0.5,
              ease: [0.22, 1, 0.36, 1],
            }}
            whileHover={{ scale: 1.12, rotate: i % 2 === 0 ? -3 : 3 }}
          >
            {ch === ' ' ? '\u00A0' : ch}
          </motion.span>
        ))}
      </h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.6 }}
        className="max-w-xl font-mono text-sm leading-relaxed text-[#8b90b0] sm:text-base"
      >
        <Cpu className="mb-1 mr-2 inline h-4 w-4 text-[#00e5ff]" />
        RoBERTa{' '}
        <span className="text-[#e8eaff]">linguistic forensics</span> ×{' '}
        <span className="text-[#e8eaff]">semantic fingerprinting</span> — drop two
        files below and let the machine judge.
      </motion.p>
    </div>
  );
}
