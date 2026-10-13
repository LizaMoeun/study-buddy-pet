import { z } from "zod";

export const authRequestSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters.")
});

export const generateRequestSchema = z.object({
  note: z.string().trim().min(20, "Please add a little more detail to your notes."),
  mode: z.enum(["quiz", "flashcards", "both"]),
  count: z.number().int().min(3).max(7)
});

const quizQuestionSchema = z.object({
  question: z.string().min(1),
  choices: z.array(z.string().min(1)).length(4),
  correctIndex: z.number().int().min(0).max(3),
  explanation: z.string().min(1)
});

const flashcardSchema = z.object({
  front: z.string().min(1),
  back: z.string().min(1)
});

export const studySessionSchema = z.object({
  mode: z.enum(["quiz", "flashcards", "both"]),
  count: z.number().int().min(3).max(7),
  quiz: z.array(quizQuestionSchema),
  flashcards: z.array(flashcardSchema)
});
