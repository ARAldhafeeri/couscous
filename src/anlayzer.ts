import { MessageContentComplex } from "@langchain/core/messages";
import Couscous from "./couscous";
import { Code, Issue } from "./types";
import * as vscode from "vscode";

// Type guard to check for text content
const isTextContent = (
  item: MessageContentComplex
): item is { text: string } => {
  return "text" in item;
};

export async function analyzeCode(code: Code, couscous: Couscous) {
  try {
    const response = await couscous.analyze(code);
    const content = response.content;

    // Handle both string and complex array content types
    const contentText = Array.isArray(content)
      ? content
          .filter(isTextContent) // Filter out non-text content
          .map((c) => c.text) // Now safely access text property
          .join("\n")
      : content;

    const jsonMatch = contentText?.match(/\{.*\}/s);
    if (!jsonMatch) throw new Error("Invalid response format");

    const analysis = JSON.parse(jsonMatch[0]);

    return {
      score: analysis.score,
      issues: analysis.issues.map((issue: Issue) => ({
        line: issue.line - 1, // Convert to 0-based index
        message: issue.violation,
        suggestion: issue.suggestion,
      })),
    };
  } catch (error: any) {
    vscode.window.showErrorMessage(`Analysis failed: ${error.message}`);
    return { score: 0, issues: [] };
  }
}
