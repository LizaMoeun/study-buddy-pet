export type StudyMode = "quiz" | "flashcards" | "both";

export type GenerateRequest = {
  note: string;
  mode: StudyMode;
  count: number;
};
