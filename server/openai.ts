import OpenAI from "openai";
import { studySessionSchema } from "./validation.js";
import type { GenerateRequest } from "../src/shared/types.js";

const outputSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    mode: { type: "string", enum: ["quiz", "flashcards", "both"] },
    count: { type: "integer", minimum: 3, maximum: 7 },
    quiz: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          question: { type: "string" },
          choices: { type: "array", items: { type: "string" }, minItems: 4, maxItems: 4 },
          correctIndex: { type: "integer", minimum: 0, maximum: 3 },
          explanation: { type: "string" }
        },
        required: ["question", "choices", "correctIndex", "explanation"]
      }
    },
    flashcards: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          front: { type: "string" },
          back: { type: "string" }
        },
        required: ["front", "back"]
      }
    }
  },
  required: ["mode", "count", "quiz", "flashcards"]
} as const;

function outputCounts(mode: GenerateRequest["mode"], count: number) {
  if (mode === "quiz") return { quiz: count, flashcards: 0 };
  if (mode === "flashcards") return { quiz: 0, flashcards: count };
  return { quiz: Math.ceil(count / 2), flashcards: Math.floor(count / 2) };
}

export async function generateStudySession(request: GenerateRequest) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const counts = outputCounts(request.mode, request.count);
  const completion = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `Create grounded study material from the user's notes. Return exactly ${counts.quiz} quiz questions and ${counts.flashcards} flashcards. Quiz questions must have four choices and one correctIndex. Do not add facts that are not supported by the notes.`
      },
      {
        role: "user",
        content: JSON.stringify({ note: request.note, mode: request.mode, count: request.count })
      }
    ],
    response_format: {
      type: "json_schema",
      json_schema: { name: "study_session", strict: true, schema: outputSchema }
    }
  });

  const content = completion.choices[0]?.message.content;
  if (!content) throw new Error("OpenAI returned no study material.");
  const result = studySessionSchema.parse(JSON.parse(content));
  if (result.mode !== request.mode || result.count !== request.count) {
    throw new Error("The generated study material did not match the selected mode.");
  }
  if (result.quiz.length + result.flashcards.length !== request.count) {
    throw new Error("The generated study material did not match the selected item count.");
  }
  return result;
}
