import { useState, type FormEvent } from "react";
import type { AuthUser } from "../shared/types";

interface AuthFormProps {
  onAuthenticated: (user: AuthUser) => void;
  onBack: () => void;
}

export default function AuthForm({ onAuthenticated, onBack }: AuthFormProps) {
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch(`/api/auth/${isSignUp ? "register" : "login"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const result = await response.json() as { user?: AuthUser; message?: string };
      if (!response.ok || !result.user) {
        throw new Error(result.message ?? "Please try again.");
      }
      onAuthenticated(result.user);
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page page--landing">
      <section className="auth-card">
        <button className="back-button" onClick={onBack}>← Back</button>
        <p className="eyebrow">{isSignUp ? "Create your study space" : "Welcome back"}</p>
        <h1>{isSignUp ? "Let's make studying feel lighter." : "Ready to keep learning?"}</h1>
        <p className="auth-copy">
          {isSignUp
            ? "Create an account to prepare for saved study sessions."
            : "Sign in to continue with your study companion."}
        </p>
        <form className="auth-form" onSubmit={submit}>
          <label className="field-label" htmlFor="auth-email">Email</label>
          <input
            id="auth-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <label className="field-label" htmlFor="auth-password">Password</label>
          <input
            id="auth-password"
            type="password"
            autoComplete={isSignUp ? "new-password" : "current-password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={8}
            required
          />
          <button className="button button--primary button--wide" type="submit" disabled={loading}>
            {loading ? "One moment..." : isSignUp ? "Create account" : "Sign in"}
          </button>
          {error && <p className="form-error">{error}</p>}
        </form>
        <button className="auth-switch" onClick={() => { setIsSignUp(!isSignUp); setError(""); }}>
          {isSignUp ? "Already have an account? Sign in" : "Need an account? Sign up"}
        </button>
      </section>
    </main>
  );
}
