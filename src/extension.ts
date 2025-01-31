import * as vscode from "vscode";
import { analyzeCode } from "./anlayzer";
import { CouscousResponseContent } from "./types";
import couscous from "./couscous";

let decorationTypeGood: vscode.TextEditorDecorationType;
let decorationTypeBad: vscode.TextEditorDecorationType;
let statusBarItem: vscode.StatusBarItem;

export async function activate(context: vscode.ExtensionContext) {
  // Retrieve API key from Secret Storage
  let apiKey = await context.secrets.get("couscous.apiKey");
  if (!apiKey) {
    apiKey = await vscode.window.showInputBox({
      prompt: "Enter your API key (deepseek or OpenAI platform)",
      ignoreFocusOut: true,
      password: true,
    });
    if (apiKey) {
      await context.secrets.store("couscous.apiKey", apiKey);
    } else {
      vscode.window.showErrorMessage(
        "Couscous requires an API key to function"
      );
      return;
    }
  }
  couscous.setApiKey(apiKey);

  // Retrieve configurations from settings
  const config = vscode.workspace.getConfiguration("couscous");

  const conventions = config.get<string[]>("conventions", []);
  couscous.setConventions(conventions);

  const modelType = config.get<"openai" | "deepseek">("modelType");
  if (!modelType) {
    vscode.window.showErrorMessage(
      "Configure modelType in settings (openai/deepseek)"
    );
    return;
  }
  couscous.setType(modelType);

  const modelSlug = config.get<string>("modelSlug");
  if (!modelSlug) {
    vscode.window.showErrorMessage("Configure modelSlug in settings");
    return;
  }
  couscous.setModelSlug(modelSlug);

  // Initialize decorations and commands
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

  statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );
  context.subscriptions.push(statusBarItem);
  statusBarItem.command = "couscous.analyze";

  context.subscriptions.push(
    vscode.commands.registerCommand("couscous.analyze", async () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        await analyzeAndDecorate(editor);
      }
    })
  );
}

async function analyzeAndDecorate(editor: vscode.TextEditor) {
  const code = editor.document.getText();
  const analysis = await analyzeCode(code);

  // vscode.window.showInformationMessage(`analysis ${JSON.stringify(analysis)}`);

  editor.setDecorations(decorationTypeGood, []);
  editor.setDecorations(decorationTypeBad, []);

  const badDecorations: vscode.DecorationOptions[] = [];
  const goodDecorations: vscode.DecorationOptions[] = [];

  analysis.issues.forEach((issue) => {
    const lineRange = editor.document.lineAt(issue.line).range;
    const hoverMessage = new vscode.MarkdownString();
    hoverMessage.appendMarkdown(`**Line ${issue.line + 1} Analysis**\n\n`);
    hoverMessage.appendMarkdown("**Violations:**\n");
    hoverMessage.appendMarkdown(
      issue.violations.map((v) => `- ${v}`).join("\n")
    );
    hoverMessage.appendMarkdown("\n\n**Suggestions:**\n");
    hoverMessage.appendMarkdown(
      issue.suggestions.map((s) => `- ${s}`).join("\n")
    );

    hoverMessage.appendMarkdown("\n\n**Refactored Code:**\n");
    hoverMessage.appendMarkdown(
      "```" + issue.langauge + "\n" + issue.refactoredCode + "\n```"
    );

    badDecorations.push({
      range: lineRange,
      hoverMessage: hoverMessage,
    });
  });

  analysis.confirmations.forEach((confirmation) => {
    const lineRange = editor.document.lineAt(confirmation.line).range;
    const hoverMessage = new vscode.MarkdownString();
    hoverMessage.appendMarkdown(
      `**Line ${confirmation.line + 1} Confirmation**\n\n`
    );
    hoverMessage.appendMarkdown(`- ${confirmation.message}`);

    goodDecorations.push({
      range: lineRange,
      hoverMessage: hoverMessage,
    });
  });

  let statusIcon: string;
  let statusText: string;

  if (analysis.score > 60) {
    statusIcon = "$(check)";
    statusText = `Great job! Confirmations: ${analysis.confirmations.length}`;
    editor.setDecorations(decorationTypeGood, goodDecorations);
  } else {
    statusIcon = "$(warning)";
    editor.setDecorations(decorationTypeBad, badDecorations);
    const violations = analysis.issues.reduce(
      (acc, issue) => acc + issue.violations.length,
      0
    );
    const suggestions = analysis.issues.reduce(
      (acc, issue) => acc + issue.suggestions.length,
      0
    );
    statusText = `Needs improvement! Violations: ${violations}, Suggestions: ${suggestions}`;
  }

  statusBarItem.text = `${statusIcon} ${statusText}`;
  statusBarItem.tooltip = createReportMarkdown(analysis) as unknown as string;
  statusBarItem.show();
}

function createReportMarkdown(analysis: CouscousResponseContent) {
  let report = new vscode.MarkdownString();
  report.appendMarkdown(`## 📊 Code Analysis Report\n---\n`);
  report.appendMarkdown(`**Overall Score**: ${analysis.score}/100  \n`);
  report.appendMarkdown(
    analysis.score > 60 ? "✅ Great job!" : "⚠️ Needs improvement"
  );
  report.appendMarkdown("\n\n");
  report.appendMarkdown(`**Issues Found**: ${analysis.issues.length}  \n`);
  report.appendMarkdown(
    `**Confirmations**: ${analysis.confirmations.length}  \n`
  );
  report.appendMarkdown("\n### Detailed Report:\n");
  analysis.issues.forEach((issue, index) => {
    report.appendMarkdown(`#### Issue ${index + 1} (Line ${issue.line + 1})\n`);
    report.appendMarkdown("**Violations:**\n");
    report.appendMarkdown(issue.violations.map((v) => `- ${v}`).join("\n"));
    report.appendMarkdown("\n\n**Suggestions:**\n");
    report.appendMarkdown(issue.suggestions.map((s) => `- ${s}`).join("\n"));
  });
  return report;
}

export function deactivate() {}
