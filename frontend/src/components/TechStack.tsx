import { motion } from 'framer-motion';

interface TechBadge {
  src: string;
  alt: string;
  href: string;
}

const FRONTEND: TechBadge[] = [
  {
    src: 'https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB',
    alt: 'React',
    href: 'https://react.dev',
  },
  {
    src: 'https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white',
    alt: 'TypeScript',
    href: 'https://www.typescriptlang.org',
  },
  {
    src: 'https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white',
    alt: 'Vite',
    href: 'https://vitejs.dev',
  },
  {
    src: 'https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white',
    alt: 'Tailwind CSS',
    href: 'https://tailwindcss.com',
  },
  {
    src: 'https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white',
    alt: 'Framer Motion',
    href: 'https://www.framer.com/motion/',
  },
  {
    src: 'https://img.shields.io/badge/Lucide-4A4A55?style=for-the-badge&logo=lucide&logoColor=white',
    alt: 'Lucide',
    href: 'https://lucide.dev',
  },
];

const BACKEND: TechBadge[] = [
  {
    src: 'https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white',
    alt: 'Python',
    href: 'https://www.python.org',
  },
  {
    src: 'https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white',
    alt: 'FastAPI',
    href: 'https://fastapi.tiangolo.com',
  },
  {
    src: 'https://img.shields.io/badge/Uvicorn-499848?style=for-the-badge',
    alt: 'Uvicorn',
    href: 'https://www.uvicorn.org',
  },
  {
    src: 'https://img.shields.io/badge/PyTorch-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white',
    alt: 'PyTorch',
    href: 'https://pytorch.org',
  },
  {
    src: 'https://img.shields.io/badge/Hugging_Face-FFD21E?style=for-the-badge&logo=huggingface&logoColor=black',
    alt: 'Hugging Face',
    href: 'https://huggingface.co',
  },
  {
    src: 'https://img.shields.io/badge/Sentence_Transformers-2F6FDF?style=for-the-badge',
    alt: 'Sentence Transformers',
    href: 'https://www.sbert.net',
  },
  {
    src: 'https://img.shields.io/badge/CUDA-76B900?style=for-the-badge&logo=nvidia&logoColor=white',
    alt: 'CUDA',
    href: 'https://developer.nvidia.com/cuda-toolkit',
  },
];

function MarqueeRow({ badges }: { badges: TechBadge[] }) {
  const doubled = [...badges, ...badges];
  return (
    <div className="marquee-mask relative w-full overflow-hidden">
      <div className="marquee-track gap-3 py-1">
        {doubled.map((badge, i) => (
          <a
            key={i}
            href={badge.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${badge.alt} official website`}
            className="transition-transform duration-200 hover:scale-105 hover:opacity-90"
          >
            <img
              src={badge.src}
              alt={badge.alt}
              className="h-9 select-none rounded-lg"
              draggable={false}
              loading="lazy"
            />
          </a>
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
