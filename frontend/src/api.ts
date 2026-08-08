import type { AnalysisReport } from './types';

const API_BASE = import.meta.env.VITE_API_URL || '';

export async function analyzeSubmissions(files: File[]): Promise<AnalysisReport> {
  const form = new FormData();
  files.forEach((f) => form.append('files', f));
  form.append('format', 'json');

  const response = await fetch(`${API_BASE}/api/analyze_submissions`, {
    method: 'POST',
    body: form,
  });

  if (!response.ok) {
    let detail = `Server responded with status ${response.status}`;
    try {
      const err = await response.json();
      detail = err.detail || detail;
    } catch {
      /* ignore parse error */
    }
    throw new Error(detail);
  }

  return (await response.json()) as AnalysisReport;
}

export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/ping`, { method: 'GET' });
    return response.ok;
  } catch {
    return false;
  }
}
