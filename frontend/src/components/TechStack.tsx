import { motion } from 'framer-motion';

const FRONTEND = [
  'https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB',
  'https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white',
  'https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white',
  'https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white',
  'https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white',
  'https://img.shields.io/badge/Lucide-4A4A55?style=for-the-badge&logo=lucide&logoColor=white',
];

const BACKEND = [
  'https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white',
  'https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white',
  'https://img.shields.io/badge/Uvicorn-499848?style=for-the-badge',
  'https://img.shields.io/badge/PyTorch-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white',
  'https://img.shields.io/badge/Hugging_Face-FFD21E?style=for-the-badge&logo=huggingface&logoColor=black',
  'https://img.shields.io/badge/Sentence_Transformers-2F6FDF?style=for-the-badge',
  'https://img.shields.io/badge/CUDA-76B900?style=for-the-badge&logo=nvidia&logoColor=white',
];

function MarqueeRow({ badges }: { badges: string[] }) {
  const doubled = [...badges, ...badges];
  return (
    <div className="marquee-mask relative w-full overflow-hidden">
      <div className="marquee-track gap-3 py-1">
        {doubled.map((src, i) => (
          <img
            key={i}
            src={src}
            alt=""
            className="h-9 select-none rounded-lg"
            draggable={false}
            loading="lazy"
          />
        ))}
      </div>
    </div>
  );
}

export default function TechStack() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.4, duration: 0.6, ease: 'easeOut' }}
      className="mt-16 space-y-4"
    >
      <div className="flex items-center gap-4">
        <span className="h-px flex-1 bg-gradient-to-r from-transparent to-[#7c5cff]/40" />
        <p className="font-mono text-[11px] uppercase tracking-[0.4em] text-[#8b90b0]">
          Built With
        </p>
        <span className="h-px flex-1 bg-gradient-to-l from-transparent to-[#00e5ff]/40" />
      </div>

      <MarqueeRow badges={FRONTEND} />
      <MarqueeRow badges={BACKEND} />
    </motion.section>
  );
}
