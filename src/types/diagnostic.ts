export type Level = 'avanzado' | 'intermedio' | 'basico' | 'inicial';

export interface BrainstormingConfig {
  max_selections: number;
  options: Array<{ id: string; text: string }>;
  correct_option_ids: string[];
}

export interface AffinityConfig {
  categories: string[];
  items: Array<{ id: string; text: string; correct: string }>;
}

export interface IshikawaConfig {
  categories: string[];
  causes: Array<{ id: string; text: string; correct: string }>;
}

export interface DOFAConfig {
  quadrants: string[];
  statements: Array<{ id: string; text: string; correct: string }>;
}

export interface ParetoConfig {
  ranks: string[];
  causes: Array<{ id: string; text: string; impact_score: number; correct_rank: string }>;
}

export interface DiagnosticConfig {
  brainstorming: BrainstormingConfig;
  affinity: AffinityConfig;
  ishikawa: IshikawaConfig;
  dofa: DOFAConfig;
  pareto: ParetoConfig;
}

export interface StudentResults {
  brainstorming: string[];
  affinity: Record<string, string>;
  ishikawa: Record<string, string>;
  dofa: Record<string, string>;
  pareto: Record<string, string>;
}

export interface EvaluationResult {
  name: string;
  score: number;
  level: Level;
}
