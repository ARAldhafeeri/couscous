export type Conventions = string[];
export type Code = string;
export type ApiKey = string | null;

import { MessageContentComplex } from "@langchain/core/messages";
import { ChatDeepSeek } from "@langchain/deepseek";
import { ChatOpenAI, ChatOpenAICallOptions } from "@langchain/openai";

export interface AnalysisResult {
  score: number;
  issues: Issue[];
  confirmations: string[];
  refactoredCode: string;
}

export interface Issue {
  line: number;
  violations: string[];
  suggestions: string[];
}

export interface CouscousResponse {
  content: string | MessageContentComplex[];
}

interface Confirmation {
  line: number;
  message: string;
}
export interface CouscousResponseContent {
  score: number;
  issues: Array<{
    line: number;
    violations: string[];
    suggestions: string[];
    refactoredCode: string;
    langauge: string;
  }>;
  confirmations: Confirmation[];
}
export interface Couscous {
  setApiKey(key: ApiKey): void;
  setConventions(conventions: Conventions): void;
  analyze(code: string): Promise<CouscousResponseContent>;
}

export type CouscousLLMModel = ChatOpenAI | ChatDeepSeek | null;
