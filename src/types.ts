export interface AnalysisResult {
  score: number;
  issues: Issue[];
}

export type Conventions = string[];
export type Code = string;
export type ApiKey = string | null;

export interface Issue {
  line: number;
  violation: string;
  suggestion: string;
}

export interface Couscous {
  score: number;
  issues: Array<{
    line: number;
    violation: string;
    suggestion: string;
  }>;
}

export interface Couscous {
  setApiKey(key: ApiKey): void;
  setConventions(conventions: Conventions): void;
  analyze(code: string): Couscous;
}
