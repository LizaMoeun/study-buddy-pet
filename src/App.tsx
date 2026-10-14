import { useEffect, useState, type FormEvent } from "react";
import type { AuthUser, GenerateRequest, StudyMode, StudySession } from "./shared/types";
import AlpacaCompanion from "./components/AlpacaCompanion";
import CompletionView from "./components/CompletionView";
import FullSessionReview from "./components/FullSessionReview";
import AuthForm from "./components/AuthForm";
import QuizReview from "./components/QuizReview";
import FlashcardReview from "./components/FlashcardReview";

type View = "landing" | "setup" | "review" | "auth";

function Landing({ onContinue, onAuth }: { onContinue: () => void; onAuth: () => void }) {
  return (
    <main className="page page--landing">
      <section className="hero-card">
        <div className="hero-copy">
          <p className="eyebrow">A softer way to study</p>
          <h1>Meet your <span>Alpaca Study Buddy</span></h1>
          <p className="hero-text">
            Turn your notes into friendly quizzes and flashcards, with a tiny
            alpaca cheering you on through every answer.
          </p>
          <div className="hero-actions">
            <button className="button button--primary" onClick={onContinue}>
              Continue as guest
            </button>
            <button className="button button--quiet" onClick={onAuth}>
              Log in or sign up
            </button>
          </div>
          <p className="guest-note">Guest sessions stay on this device and are not saved.</p>
        </div>
        <div className="hero-companion">
          <AlpacaCompanion />
        </div>
      </section>
    </main>
  );
}

function Setup({ user, onBack, onLogout, onGenerated }: { user: AuthUser | null; onBack: () => void; onLogout: () => void; onGenerated: (session: StudySession) => void }) {
  const [note, setNote] = useState("");
  const [mode, setMode] = useState<StudyMode>("quiz");
  const [count, setCount] = useState(3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const payload: GenerateRequest = { note, mode, count };
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = await response.json() as StudySession | { message: string };
      if (!response.ok || !("quiz" in result)) {
        throw new Error("message" in result ? result.message : "Please try again.");
      }
      onGenerated(result);
    } catch (generationError) {
      setError(generationError instanceof Error ? generationError.message : "Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page page--setup">
      <header className="topbar">
        <button className="back-button" onClick={onBack}>← Back</button>
        <div className="brand-mark">✦ Alpaca Study Buddy</div>
        {user
          ? <button className="guest-pill guest-pill--button" onClick={onLogout}>{user.email} · Sign out</button>
          : <span className="guest-pill">Guest mode</span>}
      </header>
      <section className="setup-layout">
        <div className="setup-intro">
          <p className="eyebrow">Your study corner</p>
          <h1>What are we learning today?</h1>
          <p>Paste a note, pick your cozy study mode, and let your buddy make it easier to review.</p>
          <AlpacaCompanion state="waiting" />
        </div>
        <form className="setup-card" onSubmit={generate}>
          <label className="field-label" htmlFor="notes">Paste your notes</label>
          <textarea
            id="notes"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Paste a lesson, meeting notes, or anything you want to remember..."
            rows={9}
          />
          <div className="setup-row">
            <fieldset>
              <legend className="field-label">Study mode</legend>
              <div className="mode-options">
                {(["quiz", "flashcards", "both"] as StudyMode[]).map((option) => (
                  <button
                    type="button"
                    key={option}
                    className={`mode-option ${mode === option ? "mode-option--selected" : ""}`}
                    onClick={() => setMode(option)}
                  >
                    {option === "quiz" ? "Quiz" : option === "flashcards" ? "Flashcards" : "Both"}
                  </button>
                ))}
              </div>
            </fieldset>
            <label className="count-control">
              <span className="field-label">Items</span>
              <select value={count} onChange={(event) => setCount(Number(event.target.value))}>
                {[3, 4, 5, 6, 7].map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
            </label>
          </div>
          <button className="button button--primary button--wide" type="submit" disabled={!note.trim() || loading}>
            {loading ? "Alpaca is creating..." : "Make my study set ✨"}
          </button>
          {!note.trim() && <p className="form-hint">Add a few notes first, and we’ll take it from there.</p>}
          {error && <p className="form-error">{error}</p>}
        </form>
      </section>
    </main>
  );
}

function GeneratedPreview({ session, onStartReview, onBack }: { session: StudySession; onStartReview: () => void; onBack: () => void }) {
  return (
    <main className="page page--setup">
      <header className="topbar">
        <button className="back-button" onClick={onBack}>← New study set</button>
        <div className="brand-mark">✦ Alpaca Study Buddy</div>
        <span className="guest-pill">{session.count} items ready</span>
      </header>
      <section className="generated-layout">
        <div>
          <p className="eyebrow">Your study set is ready</p>
          <h1>Let’s take it one gentle step at a time.</h1>
          <AlpacaCompanion state="waiting" />
          <button className="button button--primary" onClick={onStartReview}>
            Start study →
          </button>
        </div>
        <div className="results-card">
          {session.quiz.length > 0 && (
            <section>
              <h2>Quiz preview</h2>
              {session.quiz.map((question, index) => (
                <article className="result-item" key={question.question}>
                  <strong>{index + 1}. {question.question}</strong>
                  <p>{question.choices.join(" · ")}</p>
                </article>
              ))}
            </section>
          )}
          {session.flashcards.length > 0 && (
            <section>
              <h2>Flashcard preview</h2>
              {session.flashcards.map((card, index) => (
                <article className="result-item" key={card.front}>
                  <strong>{index + 1}. {card.front}</strong>
                  <p>{card.back}</p>
                </article>
              ))}
            </section>
          )}
        </div>
      </section>
    </main>
  );
}

function ReviewView({ session, onBack }: { session: StudySession; onBack: () => void }) {
  const [isReviewing, setIsReviewing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [showFullReview, setShowFullReview] = useState(false);
  const [reviewPhase, setReviewPhase] = useState<"quiz" | "flashcards">(
    session.quiz.length > 0 ? "quiz" : "flashcards"
  );

  function handleComplete() {
    setIsReviewing(false);
    setIsComplete(true);
  }

  function handleQuizComplete() {
    // In both mode, move to flashcards; otherwise complete
    if (session.flashcards.length > 0) {
      setReviewPhase("flashcards");
    } else {
      handleComplete();
    }
  }

  if (showFullReview) {
    return <FullSessionReview session={session} onBack={() => setShowFullReview(false)} />;
  }

  if (isComplete) {
    return (
      <CompletionView
        session={session}
        onReview={() => setShowFullReview(true)}
        onRetake={() => {
          setReviewPhase(session.quiz.length > 0 ? "quiz" : "flashcards");
          setIsComplete(false);
          setIsReviewing(true);
        }}
        onNewSession={onBack}
      />
    );
  }

  if (!isReviewing) {
    return (
      <GeneratedPreview
        session={session}
        onStartReview={() => {
          setReviewPhase(session.quiz.length > 0 ? "quiz" : "flashcards");
          setIsReviewing(true);
        }}
        onBack={onBack}
      />
    );
  }

  // Render interactive review based on current phase
  if (reviewPhase === "quiz" && session.quiz.length > 0) {
    return <QuizReview questions={session.quiz} onComplete={handleQuizComplete} />;
  } else if (reviewPhase === "flashcards" && session.flashcards.length > 0) {
    return <FlashcardReview flashcards={session.flashcards} onComplete={handleComplete} />;
  } else {
    // Fallback: show preview
    return <GeneratedPreview session={session} onStartReview={() => setIsReviewing(true)} onBack={onBack} />;
  }
}

export default function App() {
  const [view, setView] = useState<View>("landing");
  const [session, setSession] = useState<StudySession | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then(async (response) => {
        if (!response.ok) return;
        const result = await response.json() as { user: AuthUser | null };
        if (result.user) setUser(result.user);
      })
      .catch(() => {});
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setView("landing");
  }

  return view === "landing"
    ? <Landing onContinue={() => setView("setup")} onAuth={() => setView("auth")} />
    : view === "auth"
      ? <AuthForm onBack={() => setView("landing")} onAuthenticated={(authenticatedUser) => { setUser(authenticatedUser); setView("setup"); }} />
    : session
      ? <ReviewView session={session} onBack={() => { setSession(null); setView("setup"); }} />
      : <Setup user={user} onBack={() => setView("landing")} onLogout={logout} onGenerated={(session) => { setSession(session); setView("review"); }} />;
}
