import { useState } from "react";
import type { StudyMode } from "./shared/types";

type View = "landing" | "setup";

function AlpacaCompanion({ state = "welcome" }: { state?: string }) {
  return (
    <div className={`alpaca alpaca--${state}`} aria-label={`Alpaca ${state}`}>
      <div className="alpaca__ear alpaca__ear--left" />
      <div className="alpaca__ear alpaca__ear--right" />
      <div className="alpaca__head">
        <span className="alpaca__eye alpaca__eye--left" />
        <span className="alpaca__eye alpaca__eye--right" />
        <span className="alpaca__nose" />
      </div>
      <div className="alpaca__neck" />
      <div className="alpaca__body" />
      <div className="alpaca__scarf" />
    </div>
  );
}

function Landing({ onContinue }: { onContinue: () => void }) {
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
            <button className="button button--quiet" onClick={onContinue}>
              Log in or sign up
            </button>
          </div>
          <p className="guest-note">Guest sessions stay on this device and are not saved.</p>
        </div>
        <div className="hero-companion">
          <AlpacaCompanion />
          <div className="speech-bubble">You can do this! ✨</div>
        </div>
      </section>
    </main>
  );
}

function Setup({ onBack }: { onBack: () => void }) {
  const [note, setNote] = useState("");
  const [mode, setMode] = useState<StudyMode>("quiz");
  const [count, setCount] = useState(3);

  return (
    <main className="page page--setup">
      <header className="topbar">
        <button className="back-button" onClick={onBack}>← Back</button>
        <div className="brand-mark">✦ Alpaca Study Buddy</div>
        <span className="guest-pill">Guest mode</span>
      </header>
      <section className="setup-layout">
        <div className="setup-intro">
          <p className="eyebrow">Your study corner</p>
          <h1>What are we learning today?</h1>
          <p>Paste a note, pick your cozy study mode, and let your buddy make it easier to review.</p>
          <AlpacaCompanion state="waiting" />
        </div>
        <form className="setup-card" onSubmit={(event) => event.preventDefault()}>
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
          <button className="button button--primary button--wide" type="submit" disabled={!note.trim()}>
            Make my study set ✨
          </button>
          {!note.trim() && <p className="form-hint">Add a few notes first, and we’ll take it from there.</p>}
        </form>
      </section>
    </main>
  );
}

export default function App() {
  const [view, setView] = useState<View>("landing");
  return view === "landing"
    ? <Landing onContinue={() => setView("setup")} />
    : <Setup onBack={() => setView("landing")} />;
}
