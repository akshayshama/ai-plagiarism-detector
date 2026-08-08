export interface FileResult {
  filename: string;
  ai_probability: number;
  is_ai_plagiarism: boolean;
  semantic_score: number;
  verdict: string;
}

export interface AnalysisReport {
  overall_verdict: string;
  file_results: FileResult[];
  semantic_similarity_score_A_B: number;
}

export type AnalysisStatus = 'idle' | 'analyzing' | 'done' | 'error';
