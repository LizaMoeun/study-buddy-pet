import { useState, useRef } from "react";
import type { Flashcard } from "../shared/types";
import AlpacaCompanion from "./AlpacaCompanion";

interface FlashcardReviewProps {
  flashcards: Flashcard[];
  onComplete: () => void;
}

export default function FlashcardReview({ flashcards, onComplete }: FlashcardReviewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const touchStartRef = useRef(0);

  const card = flashcards[currentIndex];
  const isComplete = currentIndex === flashcards.length - 1;

  function handleReveal() {
    setRevealed(!revealed);
  }

  function handleNext() {
    if (isComplete) {
      onComplete();
    } else if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setRevealed(false);
    }
  }

  function handleBack() {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setRevealed(false);
    }
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === "ArrowRight") handleNext();
    if (event.key === "ArrowLeft") handleBack();
  }

  function handleTouchStart(event: React.TouchEvent) {
    touchStartRef.current = event.touches[0].clientX;
  }

  function handleTouchEnd(event: React.TouchEvent) {
    const touchEnd = event.changedTouches[0].clientX;
    const diff = touchStartRef.current - touchEnd;
    if (Math.abs(diff) > 40) {
      if (diff > 0) handleNext();
      else handleBack();
    }
  }

  return (
    <div className="review-view" onKeyDown={handleKeyDown} tabIndex={0}>
      <header className="review-topbar">
        <div>
          <strong>{currentIndex + 1}</strong> of {flashcards.length}
        </div>
        <div className="alpaca-inline">
          <AlpacaCompanion state="waiting" />
        </div>
      </header>
      <section
        className="flashcard-container"
        onDoubleClick={handleReveal}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className={`flashcard ${revealed ? "flashcard--flipped" : ""}`}>
          <div className="flashcard-side flashcard-side--front">
            <p>{card.front}</p>
          </div>
          <div className="flashcard-side flashcard-side--back">
            <p>{card.back}</p>
          </div>
        </div>
        <p className="card-hint">
          {revealed ? "← → to navigate, double-tap to hide" : "Double-tap or → to reveal"}
        </p>
      </section>
      <footer className="review-nav">
        <button
          className="button button--quiet"
          onClick={handleBack}
          disabled={currentIndex === 0}
        >
          ← Previous
        </button>
        <button className="button button--primary" onClick={handleNext}>
          {isComplete ? "See completion →" : "Next →"}
        </button>
      </footer>
    </div>
  );
}
