import { motion } from 'framer-motion';
import { AlertTriangle, ShieldCheck, FileCode2, ScanLine } from 'lucide-react';
import type { AnalysisReport } from '../types';
import ScoreGauge from './ScoreGauge';

function isPlagiarism(report: AnalysisReport) {
  return report.overall_verdict.toUpperCase().includes('PLAGIARISM');
}

function AiBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color = value >= 0.6 ? '#ff4d6d' : value >= 0.4 ? '#ffb020' : '#22e584';

  return (
    <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-white/5">
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}88` }}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}

function FileCard({ index, file }: { index: number; file: AnalysisReport['file_results'][number] }) {
  const flagged = file.is_ai_plagiarism;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 * index, duration: 0.5, ease: 'easeOut' }}
      className="glass-panel rounded-2xl p-6"
    >
      <div className="mb-5 flex items-center gap-3">
        <span
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${
            index === 0 ? 'bg-[#7c5cff]/20 text-[#c4b8ff]' : 'bg-[#00e5ff]/15 text-[#00e5ff]'
          }`}
        >
          <FileCode2 className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="truncate font-mono text-sm font-semibold text-[#e8eaff]">{file.filename}</p>
          <p className="font-mono text-[10px] uppercase tracking-widest text-[#8b90b0]">
            File {index + 1} · {file.verdict}
          </p>
        </div>
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 300, damping: 15 }}
          className={`ml-auto rounded-full px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider ${
            flagged
              ? 'bg-[#ff4d6d]/15 text-[#ff4d6d] ring-1 ring-[#ff4d6d]/40'
              : 'bg-[#22e584]/10 text-[#22e584] ring-1 ring-[#22e584]/40'
          }`}
        >
          {flagged ? 'Flagged' : 'Safe'}
        </motion.span>
      </div>

      <div className="space-y-5">
        <div>
          <div className="mb-2 flex items-center justify-between font-mono text-xs">
            <span className="uppercase tracking-wider text-[#8b90b0]">AI Generation Probability</span>
            <span style={{ color: file.ai_probability >= 0.6 ? '#ff4d6d' : '#22e584' }} className="font-semibold">
              {(file.ai_probability * 100).toFixed(2)}%
            </span>
          </div>
          <AiBar value={file.ai_probability} />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between font-mono text-xs">
            <span className="uppercase tracking-wider text-[#8b90b0]">Semantic Match vs Other File</span>
            <span className="font-semibold text-[#00e5ff]">{(file.semantic_score * 100).toFixed(2)}%</span>
          </div>
          <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-white/5">
            <motion.div
              className="h-full rounded-full bg-[#00e5ff]"
              style={{ boxShadow: '0 0 10px #00e5ff88' }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, file.semantic_score * 100)}%` }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between font-mono text-xs">
            <span className="uppercase tracking-wider text-[#8b90b0]">Structural Match vs Other File</span>
            {file.structural_score === null ? (
              <span className="font-semibold text-[#8b90b0]">N/A</span>
            ) : (
              <span className="font-semibold text-[#7c5cff]">
                {(file.structural_score * 100).toFixed(2)}%
              </span>
            )}
          </div>
          <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-white/5">
            <motion.div
              className="h-full rounded-full bg-[#7c5cff]"
              style={{ boxShadow: '0 0 10px #7c5cff88' }}
              initial={{ width: 0 }}
              animate={{
                width: `${file.structural_score === null ? 0 : Math.min(100, file.structural_score * 100)}%`,
              }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
          {file.structural_note && (
            <p className="mt-1.5 font-mono text-[10px] leading-relaxed text-[#8b90b0]">
              {file.structural_note}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function ResultsDashboard({ report }: { report: AnalysisReport }) {
  const plagiarized = isPlagiarism(report);
  const avgAi =
    (report.file_results[0]?.ai_probability + report.file_results[1]?.ai_probability) / 2;
  const originality = Math.max(0, Math.min(1, 1 - avgAi));

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <motion.div
        initial={{ opacity: 0, y: -16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`flex items-center gap-4 rounded-2xl border px-6 py-4 ${
          plagiarized
            ? 'border-[#ff4d6d]/40 bg-[#ff4d6d]/10'
            : 'border-[#22e584]/40 bg-[#22e584]/10'
        }`}
      >
        {plagiarized ? (
          <AlertTriangle className="h-7 w-7 shrink-0 animate-blink text-[#ff4d6d]" />
        ) : (
          <ShieldCheck className="h-7 w-7 shrink-0 text-[#22e584]" />
        )}
        <div className="min-w-0">
          <p
            className={`font-mono text-sm font-bold uppercase tracking-widest ${
              plagiarized ? 'text-[#ff4d6d]' : 'text-[#22e584]'
            }`}
          >
            {plagiarized ? 'Action Required — Plagiarism Detected' : 'Verdict Passed — All Checks Clear'}
          </p>
          <p className="mt-0.5 truncate text-sm text-[#e8eaff]/80">{report.overall_verdict}</p>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="glass-panel corner-lines relative flex flex-col items-center justify-center rounded-2xl p-6"
        >
          <ScoreGauge value={originality} label="Total Originality" accent="green" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="glass-panel corner-lines relative flex flex-col items-center justify-center rounded-2xl p-6"
        >
          <ScoreGauge
            value={report.semantic_similarity_score_A_B}
            label="Cross-File Match"
            accent="cyan"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="glass-panel corner-lines relative flex flex-col items-center justify-center rounded-2xl p-6"
        >
          <ScoreGauge
            value={report.file_results[0]?.structural_score ?? null}
            label="Structural Match"
            accent="primary"
          />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="glass-panel corner-lines relative rounded-2xl p-6"
      >
        <div className="mb-4 flex items-center justify-between">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-[#8b90b0]">
            Thresholds
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-sm text-[#e8eaff]">AI Risk</span>
            <span className="rounded-lg bg-[#ff4d6d]/15 px-2.5 py-1 font-mono text-sm font-bold text-[#ff4d6d] ring-1 ring-[#ff4d6d]/30">
              &gt; 60%
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-mono text-sm text-[#e8eaff]">Semantic Similarity</span>
            <span className="rounded-lg bg-[#00e5ff]/15 px-2.5 py-1 font-mono text-sm font-bold text-[#00e5ff] ring-1 ring-[#00e5ff]/30">
              &gt; 75%
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-mono text-sm text-[#e8eaff]">Structural Match</span>
            <span className="rounded-lg bg-[#7c5cff]/15 px-2.5 py-1 font-mono text-sm font-bold text-[#c4b8ff] ring-1 ring-[#7c5cff]/30">
              &gt; 80%
            </span>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-[#7c5cff]/25 bg-[#7c5cff]/10 px-4 py-3">
          <ScanLine className="h-4 w-4 shrink-0 text-[#7c5cff]" />
          <p className="font-mono text-xs leading-relaxed text-[#c4b8ff]">
            Hybrid verdict: RoBERTa AI-probability fused with semantic fingerprinting and
            AST-based structural matching. A file is flagged when any signal crosses its threshold.
          </p>
        </div>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2">
        {report.file_results.map((f, i) => (
          <FileCard key={f.filename + i} index={i} file={f} />
        ))}
      </div>
    </motion.section>
  );
}
