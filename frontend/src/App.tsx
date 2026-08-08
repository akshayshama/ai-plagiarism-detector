import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radar, RefreshCw, TriangleAlert } from 'lucide-react';
import AnimatedBackground from './components/AnimatedBackground';
import NeonTitle from './components/NeonTitle';
import FileDropzone from './components/FileDropzone';
import AnalyzingOverlay from './components/AnalyzingOverlay';
import ResultsDashboard from './components/ResultsDashboard';
import TechStack from './components/TechStack';
import { analyzeSubmissions } from './api';
import type { AnalysisReport, AnalysisStatus } from './types';

export default function App() {
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<AnalysisStatus>('idle');
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const ready = files.length === 2;

  const runAnalysis = async () => {
    if (!ready || status === 'analyzing') return;
    setStatus('analyzing');
    setError(null);
    setReport(null);
    try {
      const result = await analyzeSubmissions(files);
      setReport(result);
      setStatus('done');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Analysis failed unexpectedly.');
      setStatus('error');
    }
  };

  const reset = () => {
    setFiles([]);
    setReport(null);
    setStatus('idle');
    setError(null);
  };

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <AnimatePresence>{status === 'analyzing' && <AnalyzingOverlay />}</AnimatePresence>

      <main className="mx-auto max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
        <NeonTitle />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6, ease: 'easeOut' }}
          className="mx-auto mt-12 max-w-3xl"
        >
          <AnimatePresence mode="wait">
            {report ? (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="space-y-6"
              >
                <ResultsDashboard report={report} />
                <div className="flex justify-center">
                  <button
                    onClick={reset}
                    className="micro-btn glass-panel flex items-center gap-2 rounded-xl px-6 py-3 font-mono text-xs uppercase tracking-widest text-[#8b90b0] hover:text-[#00e5ff]"
                  >
                    <RefreshCw className="h-4 w-4" /> Analyze New Files
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="glass-panel rounded-3xl p-6 sm:p-10"
              >
                <FileDropzone files={files} onChange={setFiles} />

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-5 flex items-start gap-3 rounded-xl border border-[#ff4d6d]/40 bg-[#ff4d6d]/10 px-4 py-3">
                        <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-[#ff4d6d]" />
                        <div>
                          <p className="font-mono text-sm font-semibold text-[#ff4d6d]">
                            Analysis Failed
                          </p>
                          <p className="mt-0.5 text-sm text-[#e8eaff]/80">{error}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  onClick={runAnalysis}
                  disabled={!ready}
                  whileHover={ready ? { scale: 1.02 } : {}}
                  whileTap={ready ? { scale: 0.98 } : {}}
                  className={`micro-btn group relative mt-6 flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl px-6 py-4 font-mono text-sm font-bold uppercase tracking-[0.2em] ${
                    ready
                      ? 'bg-gradient-to-r from-[#7c5cff] to-[#00e5ff] text-[#05060f] glow-primary'
                      : 'cursor-not-allowed bg-white/5 text-[#8b90b0]/50'
                  }`}
                >
                  <span
                    className={`absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent ${
                      ready ? 'group-hover:animate-shimmer' : ''
                    }`}
                  />
                  <Radar className="relative h-5 w-5" />
                  <span className="relative">
                    {ready ? 'Launch Deep Scan' : 'Upload 2 Files to Begin'}
                  </span>
                </motion.button>

                <p className="mt-4 text-center font-mono text-[10px] uppercase tracking-widest text-[#8b90b0]/60">
                  Files stay local · models run on your machine · no cloud upload
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <TechStack />

        <footer className="mt-8 text-center font-mono text-[11px] uppercase tracking-[0.3em] text-[#8b90b0]/40">
          RoBERTa × BGE Semantic Engine — FastAPI Backend · React Frontend
        </footer>
      </main>
    </div>
  );
}
