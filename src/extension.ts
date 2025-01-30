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
    prompt: "Enter your API key ( deepseek or openai platform )",
    ignoreFocusOut: true,
    password: true,
  });

  if (!apiKey) {
    vscode.window.showErrorMessage("Couscous requires an API key to function");
    return;
  }
  couscous.setApiKey(apiKey);

  const conventions = await vscode.window.showInputBox({
    prompt:
      "Enter team conventions (comma-separated) e.g. follow solid principles, code should be commented",
    ignoreFocusOut: true,
  });

  if (conventions) {
    couscous.setConventions(conventions.split(","));
  }

  // Get model type via quick pick
  const modelType = await vscode.window.showQuickPick(["openai", "deepseek"], {
    placeHolder: "Select the model provider",
    ignoreFocusOut: true,
  });

  if (!modelType) {
    vscode.window.showErrorMessage(
      "Couscous requires a model provider to function"
    );
    return;
  }
  couscous.setType(modelType);

  // Get model slug via input box
  const modelSlugExample = modelType === "openai" ? "gpt-4" : "deepseek-chat";
  const modelSlug = await vscode.window.showInputBox({
    prompt: `Enter the model slug for ${modelType} (e.g., ${modelSlugExample})`,
    ignoreFocusOut: true,
  });

  if (!modelSlug) {
    vscode.window.showErrorMessage(
      "Couscous requires a model slug to function"
    );
    return;
  }
  couscous.setModelSlug(modelSlug);
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
