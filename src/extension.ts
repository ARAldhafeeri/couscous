import * as vscode from "vscode";
import { analyzeCode } from "./anlayzer";
import { Issue } from "./types";
import Couscous from "./couscous";

let decorationTypeGood: vscode.TextEditorDecorationType;
let decorationTypeBad: vscode.TextEditorDecorationType;
let couscous: Couscous;

export async function activate(context: vscode.ExtensionContext) {
  couscous = new Couscous();

  // Get API key and conventions via popups
  const apiKey = await vscode.window.showInputBox({
    prompt: "Enter your Deepseek API key",
    ignoreFocusOut: true,
  });

  if (!apiKey) {
    vscode.window.showErrorMessage("Couscous requires an API key to function");
    return;
  }
  couscous.setApiKey(apiKey);

  const conventions = await vscode.window.showInputBox({
    prompt: "Enter team conventions (comma-separated)",
    ignoreFocusOut: true,
  });

  if (conventions) {
    couscous.setConventions(conventions.split(","));
  }

  // Create decorators
  decorationTypeGood = vscode.window.createTextEditorDecorationType({
    gutterIconPath: context.asAbsolutePath("./assets/yummy.png"),
    gutterIconSize: "contain",
  });

  decorationTypeBad = vscode.window.createTextEditorDecorationType({
    gutterIconPath: context.asAbsolutePath("./assets/yucky.png"),
    gutterIconSize: "contain",
    overviewRulerColor: "red",
    overviewRulerLane: vscode.OverviewRulerLane.Right,
  });

  // Register save handler
  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument(async (document) => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        await analyzeAndDecorate(editor);
      }
    })
  );
}

async function analyzeAndDecorate(editor: vscode.TextEditor) {
  const code = editor.document.getText();
  const analysis = await analyzeCode(code, couscous);

  const decorations: vscode.DecorationOptions[] = analysis.issues.map(
    (issue: Issue) => ({
      range: new vscode.Range(issue.line, 0, issue.line, 0),
      hoverMessage: new vscode.MarkdownString(
        `**Violation**: ${issue.violation}\n\n**Suggestion**: ${issue.suggestion}`
      ),
    })
  );

  editor.setDecorations(decorationTypeBad, decorations);

  if (analysis.score > 70) {
    const fullRange = new vscode.Range(0, 0, 0, 0);
    editor.setDecorations(decorationTypeGood, [
      {
        range: fullRange,
        hoverMessage: "Great job! This file follows best practices!",
      },
    ]);
  }
}

export function deactivate() {}
