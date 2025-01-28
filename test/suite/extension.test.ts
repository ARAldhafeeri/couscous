import * as assert from "assert";
import * as vscode from "vscode";
import * as sinon from "sinon";
import Couscous from "../../src/couscous";
import { analyzeCode } from "../../src/anlayzer";
import { AnalysisResult } from "../../src/types";

class MockCouscous extends Couscous {
  async analyze(code: string): Promise<any> {
    return {
      content: JSON.stringify({
        score: 80,
        issues: [
          {
            line: 1,
            violation: "Missing documentation",
            suggestion: "Add JSDoc comments",
          },
        ],
      }),
    };
  }
}

suite("Couscous Extension Tests", () => {
  let mockCouscous: Couscous;
  let sandbox: sinon.SinonSandbox;

  setup(() => {
    sandbox = sinon.createSandbox();
    mockCouscous = new MockCouscous();
    mockCouscous.setApiKey("test-key");
    mockCouscous.setConventions(["jsdoc"]);
  });

  teardown(() => {
    sandbox.restore();
  });

  test("Analyzes code correctly", async () => {
    const result = await analyzeCode("function test() {}", mockCouscous);

    assert.strictEqual(result.score, 80);
    assert.strictEqual(result.issues.length, 1);
    assert.match(result.issues[0].suggestion, /JSDoc/);
  });
});
