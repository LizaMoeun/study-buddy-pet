interface AlpacaCompanionProps {
  state?: "welcome" | "loading" | "waiting" | "correct" | "incorrect" | "complete";
}

export default function AlpacaCompanion({ state = "welcome" }: AlpacaCompanionProps) {
  const messages: Record<string, string> = {
    welcome: "You can do this! ✨",
    loading: "Making your study set...",
    waiting: "Ready when you are!",
    correct: "You got it! Great job! 🎉",
    incorrect: "That's okay, keep going! You're learning! 💫",
    complete: "You finished! That was wonderful! 🌟"
  };

  return (
    <div>
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
      <div className="alpaca-message">{messages[state]}</div>
    </div>
  );
}
