export type StudyMode = "quiz" | "flashcards" | "both";

export type GenerateRequest = {
  note: string;
  mode: StudyMode;
  count: number;
};

export type QuizQuestion = {
  question: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
};

export type Flashcard = {
  front: string;
  back: string;
};

export type StudySession = {
  mode: StudyMode;
  count: number;
  quiz: QuizQuestion[];
  flashcards: Flashcard[];
};
