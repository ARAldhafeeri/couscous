import { ChatDeepSeek } from "@langchain/deepseek";
import { ChatOpenAI } from "@langchain/openai";

import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ApiKey, Conventions } from "./types";
import { SUPPORTED_MODEL_TYPES } from "./config";

class Couscous {
  private apiKey: ApiKey;
  private conventions: string[];
  private type: string;
  private modelSlug: string;
  constructor() {
    this.apiKey = null;
    this.conventions = [];
    this.type = "";
    this.modelSlug = "";
  }

  setApiKey(key: ApiKey) {
    this.apiKey = key;
  }

  setConventions(conventions: Conventions) {
    this.conventions = conventions;
  }

  setType(type: string) {
    this.type = type;
  }

  setModelSlug(modelSlug: string) {
    this.modelSlug = modelSlug;
  }

  getModel() {
    let model;
    switch (this.type) {
      case SUPPORTED_MODEL_TYPES.openai:
        model = new ChatOpenAI({
          apiKey: this.apiKey as string,
          model: this.modelSlug,
        });
      case SUPPORTED_MODEL_TYPES.deepseek:
        model = new ChatDeepSeek({
          apiKey: this.apiKey as string,
          model: this.modelSlug,
        });
      default:
        model = new ChatDeepSeek({
          apiKey: this.apiKey as string,
          model: this.modelSlug,
        });
    }
    return model;
  }

  async analyze(code: string) {
    const model = this.getModel();

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
