import { z } from "zod";
import { StructuredOutputParser } from "@langchain/core/output_parsers";

const ResponseSchema = z.object({
  score: z.number().min(0).max(100),
  issues: z.array(
    z.object({
      line: z.number(),
      violations: z.array(z.string()),
      refactoredCode: z.string(),
      langauge: z.string(),
      suggestions: z.array(z.string()),
    })
  ),
  confirmations: z.array(
    z.object({
      line: z.number(),
      message: z.string(),
    })
  ),
});

const couscousResponseSchemaParser =
  StructuredOutputParser.fromZodSchema(ResponseSchema);

export default couscousResponseSchemaParser;
