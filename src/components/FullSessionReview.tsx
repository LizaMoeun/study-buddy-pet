import type { StudySession } from "../shared/types";

interface FullSessionReviewProps {
  session: StudySession;
  onBack: () => void;
}

export default function FullSessionReview({ session, onBack }: FullSessionReviewProps) {
  return (
    <main className="page page--setup">
      <header className="topbar">
        <button className="back-button" onClick={onBack}>← Back to completion</button>
        <div className="brand-mark">✦ Alpaca Study Buddy</div>
        <span className="guest-pill">{session.count} items reviewed</span>
      </header>
      <section className="full-review-card">
        <p className="eyebrow">Your full study set</p>
        <h1>Look how much you covered.</h1>
        {session.quiz.length > 0 && (
          <section>
            <h2>Quiz answers</h2>
            {session.quiz.map((question, index) => (
              <article className="full-review-item" key={question.question}>
                <strong>{index + 1}. {question.question}</strong>
                <p className="answer-label">Answer: {question.choices[question.correctIndex]}</p>
                <p>{question.explanation}</p>
              </article>
            ))}
          </section>
        )}
        {session.flashcards.length > 0 && (
          <section>
            <h2>Flashcards</h2>
            {session.flashcards.map((card, index) => (
              <article className="full-review-item" key={card.front}>
                <strong>{index + 1}. {card.front}</strong>
                <p>{card.back}</p>
              </article>
            ))}
          </section>
        )}
      </section>
    </main>
  );
}
