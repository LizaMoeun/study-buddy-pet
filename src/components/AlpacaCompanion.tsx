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
    <div className={`companion-message companion-message--${state}`} role="status">
      {messages[state]}
    </div>
  );
}
