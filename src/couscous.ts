import { ChatDeepSeek } from "@langchain/deepseek";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import {
  ApiKey,
  Conventions,
  CouscousLLMModel,
  CouscousResponseContent,
} from "./types";
import { SUPPORTED_MODEL_TYPES } from "./config";
import couscousResponseSchemaParser from "./schema";

class Couscous {
  private apiKey: ApiKey;
  private conventions: string[];
  private type: string;
  private modelSlug: string;
  private model: CouscousLLMModel;

  constructor() {
    this.apiKey = null;
    this.conventions = [];
    this.type = "";
    this.modelSlug = "";
    this.model = null;
  }

  setApiKey(key: ApiKey): void {
    if (!key) {
      throw new Error("API key cannot be null or undefined.");
    }
    this.apiKey = key;
  }

  setConventions(conventions: Conventions): void {
    if (!conventions || !Array.isArray(conventions)) {
      throw new Error("Conventions must be an array.");
    }
    this.conventions = conventions;
  }

  setType(type: string): void {
    this.type = type;
  }

  setModelSlug(modelSlug: string): void {
    if (!modelSlug) {
      throw new Error("Model slug cannot be empty.");
    }
    this.modelSlug = modelSlug;
  }

  setModel(model: CouscousLLMModel) {
    this.model = model;
  }

  getModel() {
    // set model once and return it in future calls.
    if (this.model !== null) {
      return this.model;
    }
    if (!this.apiKey) {
      throw new Error("API key is not set.");
    }
    let model: CouscousLLMModel;
    switch (this.type) {
      case SUPPORTED_MODEL_TYPES.openai:
        model = new ChatOpenAI({
          apiKey: this.apiKey as string,
          model: this.modelSlug,
          temperature: 0,
        });
        break;
      case SUPPORTED_MODEL_TYPES.deepseek:
        model = new ChatDeepSeek({
          openAIApiKey: this.apiKey as string,
          model: this.modelSlug,
          temperature: 0,
        });
        break;
      default:
        model = new ChatOpenAI({
          apiKey: this.apiKey as string,
          model: this.modelSlug,
        });
    }
    this.setModel(model);
    return model;
  }

  async analyze(code: string) {
    if (!code) {
      throw new Error("Code cannot be empty.");
    }

    if (!code) throw new Error("Code cannot be empty.");

    const model = this.getModel();

    const systemMessage = `Analyze this code for:
      1. General software best practices
      2. Team conventions and best practices: ${this.conventions.join(", ")}
      3. Return the following:

        a. Line where violation occurs.
        b. List of violations.
        c. List of confirmations.
        d. List of suggestions.
        e. Refactored code.
        k. score of adhering to best practices and conventions.
        i. detected langauge of code.
        ${couscousResponseSchemaParser.getFormatInstructions()}
  `;

    const messages = [new SystemMessage(systemMessage), new HumanMessage(code)];

    const raw = await model.invoke(messages);

    const res = couscousResponseSchemaParser.parse(raw.content as string);
    return res as unknown as CouscousResponseContent;
  }
}

const couscous = new Couscous();
export default couscous;
