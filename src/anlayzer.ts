import { MessageContentComplex } from "@langchain/core/messages";
import { Code, Issue, Couscous, CouscousResponseContent } from "./types";
import * as vscode from "vscode";
import couscous from "./couscous";
export async function analyzeCode(
  code: Code
): Promise<CouscousResponseContent> {
  try {
    return couscous.analyze(code);
  } catch (error: any) {
    vscode.window.showErrorMessage(`Analysis failed: ${error.message}`);
    return {
      score: 0,
      issues: [],
      confirmations: [],
    };
  }
}
