import OpenAI from "openai";
import { studySessionSchema } from "./validation.js";
import type { GenerateRequest } from "../src/shared/types.js";

function outputCounts(mode: GenerateRequest["mode"], count: number) {
  if (mode === "quiz") return { quiz: count, flashcards: 0 };
  if (mode === "flashcards") return { quiz: 0, flashcards: count };
  return { quiz: Math.ceil(count / 2), flashcards: Math.floor(count / 2) };
}

export async function generateStudySession(request: GenerateRequest) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured.");
  }
  const openai = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1"
  });

  const counts = outputCounts(request.mode, request.count);
  const completion = await openai.chat.completions.create({
    model: process.env.GROQ_MODEL ?? "openai/gpt-oss-20b",
    messages: [
      {
        role: "system",
        content: `Create grounded study material from the user's notes. Return only one valid JSON object with these fields:
- "mode": exactly "quiz", "flashcards", or "both"
- "count": the requested item count
- "quiz": an array of objects with "question", exactly four string "choices", integer "correctIndex" from 0 to 3, and "explanation"
- "flashcards": an array of objects with string "front" and "back"
Return exactly ${counts.quiz} quiz questions and ${counts.flashcards} flashcards. Use empty arrays for types not requested. Do not include a schema, markdown, commentary, or any extra text. Do not add facts that are not supported by the notes.`
      },
      {
        role: "user",
        content: JSON.stringify({ note: request.note, mode: request.mode, count: request.count })
      }
    ],
    response_format: { type: "json_object" }
  });

  const content = completion.choices[0]?.message.content;
  if (!content) throw new Error("Groq returned no study material.");
  const parsedContent: unknown = JSON.parse(content);
  const material = typeof parsedContent === "string" ? JSON.parse(parsedContent) : parsedContent;
  const result = studySessionSchema.parse(material);
  if (result.mode !== request.mode || result.count !== request.count) {
    throw new Error("The generated study material did not match the selected mode.");
  }
  if (result.quiz.length + result.flashcards.length !== request.count) {
    throw new Error("The generated study material did not match the selected item count.");
  }
  return result;
}
