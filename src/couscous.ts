import { ChatDeepSeek } from "@langchain/deepseek";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ApiKey, Conventions } from "./types";

class Couscous {
  private apiKey: ApiKey;
  private conventions: string[];
  constructor() {
    this.apiKey = null;
    this.conventions = [];
  }

  setApiKey(key: ApiKey) {
    this.apiKey = key;
  }

  setConventions(conventions: Conventions) {
    this.conventions = conventions;
  }

  async analyze(code: string) {
    const model = new ChatDeepSeek({
      apiKey: this.apiKey as string,
      model: "deepseek-chat",
    });

    const systemMessage = `Analyze this code for:
      1. General software best practices
      2. Team conventions: ${this.conventions.join(", ")}
              
      Respond with JSON format: {
          "score": 0-100,
          "issues": [{
              "line": number,
              "violations": string[],
              "confirmations": string[]
              "suggestions": string[]
          }]
      }`;

    const messages = [new SystemMessage(systemMessage), new HumanMessage(code)];

    return model.invoke(messages);
  }
}

export default Couscous;
