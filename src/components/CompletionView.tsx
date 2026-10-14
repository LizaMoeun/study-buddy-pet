import type { StudySession } from "../shared/types";
import AlpacaCompanion from "./AlpacaCompanion";

interface CompletionViewProps {
  session: StudySession;
  onReview: () => void;
  onRetake: () => void;
  onNewSession: () => void;
}

export default function CompletionView({
  session,
  onReview,
  onRetake,
  onNewSession
}: CompletionViewProps) {
  return (
    <main className="page page--completion">
      <section className="completion-card">
        <AlpacaCompanion state="complete" />
        <p className="eyebrow">Study session complete</p>
        <h1>You did it, one gentle step at a time! ✨</h1>
        <p className="completion-copy">
          You finished all {session.count} {session.count === 1 ? "item" : "items"}.
          Take a moment to celebrate your progress.
        </p>
        <div className="completion-actions">
          <button className="button button--primary" onClick={onReview}>
            Review full session
          </button>
          <button className="button button--quiet" onClick={onRetake}>
            Retake this session
          </button>
          <button className="button button--quiet" onClick={onNewSession}>
            Create a new session
          </button>
        </div>
      </section>
    </main>
  );
}
