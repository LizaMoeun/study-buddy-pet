import { useState } from "react";
import type { QuizQuestion } from "../shared/types";
import AlpacaCompanion from "./AlpacaCompanion";

interface QuizReviewProps {
  questions: QuizQuestion[];
  onComplete: () => void;
}

export default function QuizReview({ questions, onComplete }: QuizReviewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(questions.map(() => null));

  const question = questions[currentIndex];
  const answer = answers[currentIndex];
  const isAnswered = answer !== null;
  const isCorrect = answer === question.correctIndex;
  const isComplete = currentIndex === questions.length - 1 && isAnswered;

  function handleAnswer(index: number) {
    if (answers[currentIndex] === null) {
      const newAnswers = [...answers];
      newAnswers[currentIndex] = index;
      setAnswers(newAnswers);
    }
  }

  function handleNext() {
    if (isComplete) {
      onComplete();
    } else if (isAnswered && currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  }

  function handleBack() {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  }

  return (
    <div className="review-view">
      <header className="review-topbar">
        <div>
          <strong>{currentIndex + 1}</strong> of {questions.length}
        </div>
        <div className="alpaca-inline">
          <AlpacaCompanion
            state={
              isAnswered
                ? isCorrect
                  ? "correct"
                  : "incorrect"
                : "waiting"
            }
          />
        </div>
      </header>
      <section className="quiz-card">
        <h3>{question.question}</h3>
        <div className="choices">
          {question.choices.map((choice, index) => (
            <button
              key={index}
              className={`choice-button ${answer === index ? "choice-button--selected" : ""} ${
                isAnswered && index === question.correctIndex
                  ? "choice-button--correct"
                  : ""
              } ${isAnswered && answer === index && !isCorrect ? "choice-button--incorrect" : ""}`}
              onClick={() => handleAnswer(index)}
              disabled={isAnswered}
            >
              {choice}
            </button>
          ))}
        </div>
        {isAnswered && (
          <div className={`feedback ${isCorrect ? "feedback--positive" : "feedback--supportive"}`}>
            <p>
              {isCorrect
                ? "You got it! The alpaca is proud of you. ✨"
                : "No worries! Here's the right answer:"}
            </p>
            {!isCorrect && <p className="explanation">{question.explanation}</p>}
          </div>
        )}
      </section>
      <footer className="review-nav">
        <button
          className="button button--quiet"
          onClick={handleBack}
          disabled={currentIndex === 0}
        >
          ← Previous
        </button>
        <button
          className="button button--primary"
          onClick={handleNext}
          disabled={!isAnswered}
        >
          {isComplete ? "See completion →" : "Next →"}
        </button>
      </footer>
    </div>
  );
}
