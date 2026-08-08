import { motion } from 'framer-motion';

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 cyber-grid animate-grid-pan opacity-60" />

      <motion.div
        className="absolute -top-40 -left-40 h-[480px] w-[480px] rounded-full bg-[#7c5cff]/25 blur-[140px]"
        animate={{ x: [0, 60, 0], y: [0, 30, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-1/3 -right-40 h-[420px] w-[420px] rounded-full bg-[#00e5ff]/15 blur-[140px]"
        animate={{ x: [0, -50, 0], y: [0, 40, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -bottom-40 left-1/3 h-[400px] w-[400px] rounded-full bg-[#22e584]/10 blur-[140px]"
        animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#05060f]/80" />
    </div>
  );
}
