import { useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileCode2, X, CheckCircle2, FolderOpen } from 'lucide-react';

interface Props {
  files: File[];
  onChange: (files: File[]) => void;
}

const ACCEPTED = ['.txt', '.py', '.js', '.md', '.ts', '.jsx', '.tsx', '.java', '.cpp', '.c'];

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function FileDropzone({ files, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [shake, setShake] = useState(false);

  const reject = useCallback(() => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  }, []);

  const acceptFiles = useCallback(
    (list: FileList | File[]) => {
      const incoming = Array.from(list);
      const next = files.length >= 2 ? [] : [...files];

      for (const f of incoming) {
        if (next.length >= 2) {
          reject();
          break;
        }
        const ext = '.' + (f.name.split('.').pop() || '').toLowerCase();
        if (!ACCEPTED.includes(ext)) {
          reject();
          continue;
        }
        next.push(f);
      }
      onChange(next);
    },
    [files, onChange, reject]
  );

  const removeFile = useCallback(
    (index: number) => onChange(files.filter((_, i) => i !== index)),
    [files, onChange]
  );

  return (
    <div>
      <div className="relative flex flex-col items-center justify-center">
        <AnimatePresence>
          {dragging && (
            <motion.div
              className="pointer-events-none absolute inset-0 z-10 rounded-2xl border-2 border-dashed border-[#00e5ff]/70 bg-[#00e5ff]/5"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <div className="flex h-full w-full items-center justify-center gap-3 font-mono text-sm uppercase tracking-widest text-[#00e5ff]">
                <UploadCloud className="h-5 w-5" /> Release to drop
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          animate={shake ? { x: [0, -10, 10, -8, 8, -4, 4, 0] } : { x: 0 }}
          transition={{ duration: 0.45 }}
          className={`corner-lines relative w-full cursor-pointer rounded-2xl border border-dashed p-10 text-center sm:p-14 ${
            dragging
              ? 'border-[#00e5ff]/80 bg-[#00e5ff]/5 scale-[1.01]'
              : 'border-[#7c5cff]/30 bg-[#0b0d1a]/60 hover:border-[#7c5cff]/70'
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            acceptFiles(e.dataTransfer.files);
          }}
          onClick={() => inputRef.current?.click()}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            accept={ACCEPTED.join(',')}
            className="hidden"
            onChange={(e) => {
              if (e.target.files) acceptFiles(e.target.files);
              e.target.value = '';
            }}
          />

          <motion.div
            className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7c5cff]/30 to-[#00e5ff]/20 glow-primary"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <UploadCloud className="h-8 w-8 text-[#00e5ff]" />
          </motion.div>

          <p className="text-lg font-semibold text-[#e8eaff]">
            {files.length >= 2 ? (
              <span className="text-[#22e584]">Both files locked in ✓</span>
            ) : (
              <>Drop <span className="text-[#7c5cff]">File A</span> &amp; <span className="text-[#00e5ff]">File B</span> here</>
            )}
          </p>
          <p className="mt-2 font-mono text-xs text-[#8b90b0]">
            or <span className="text-[#00e5ff] underline underline-offset-2">browse</span> your machine ·{' '}
            <span className="text-[#7c5cff]">exactly 2 files required</span>
          </p>
          <p className="mt-4 font-mono text-[10px] uppercase tracking-widest text-[#8b90b0]/60">
            {ACCEPTED.join('  ')}
          </p>
        </motion.div>
      </div>

      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-5 space-y-3 overflow-hidden"
          >
            {files.map((f, i) => (
              <motion.div
                key={f.name + i}
                layout
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 24 }}
                className="glass-panel micro-btn group flex items-center gap-4 rounded-xl px-4 py-3"
              >
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                    i === 0
                      ? 'bg-[#7c5cff]/20 text-[#c4b8ff]'
                      : 'bg-[#00e5ff]/15 text-[#00e5ff]'
                  }`}
                >
                  <FileCode2 className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-mono text-sm text-[#e8eaff]">{f.name}</p>
                  <p className="font-mono text-xs text-[#8b90b0]">
                    {formatSize(f.size)} · {i === 0 ? 'File A' : 'File B'}
                  </p>
                </div>
                {i === 0 ? (
                  <span className="rounded-md bg-[#7c5cff]/20 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-[#c4b8ff]">
                    A
                  </span>
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-[#22e584]" />
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(i);
                  }}
                  className="rounded-md p-1 text-[#8b90b0] transition-colors hover:bg-[#ff4d6d]/15 hover:text-[#ff4d6d]"
                  aria-label={`Remove ${f.name}`}
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            ))}

            <motion.button
              onClick={() => inputRef.current?.click()}
              className="micro-btn flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[#7c5cff]/30 px-4 py-2.5 font-mono text-xs uppercase tracking-widest text-[#8b90b0] hover:border-[#7c5cff]/70 hover:text-[#c4b8ff]"
            >
              <FolderOpen className="h-4 w-4" /> Replace / add more
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
