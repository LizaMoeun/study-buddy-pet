import "dotenv/config";
import express from "express";
import {
  AuthUnavailableError,
  EmailAlreadyUsedError,
  InvalidCredentialsError,
  clearSessionCookie,
  deleteSession,
  getUserFromRequest,
  initializeAuthDatabase,
  loginUser,
  registerUser,
  setSessionCookie
} from "./auth.js";
import { generateStudySession } from "./openai.js";
import { authRequestSchema, generateRequestSchema } from "./validation.js";

const app = express();
app.use(express.json());
app.get("/api/health", (_request, response) => response.json({ ok: true }));
app.get("/api/auth/me", async (request, response) => {
  try {
    response.json({ user: await getUserFromRequest(request.headers.cookie) });
  } catch (error) {
    if (error instanceof AuthUnavailableError) {
      response.status(503).json({ message: error.message });
      return;
    }
    throw error;
  }
});

app.post("/api/auth/register", async (request, response) => {
  const parsed = authRequestSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({ message: parsed.error.issues[0]?.message ?? "Please check your account details." });
    return;
  }
  try {
    const result = await registerUser(parsed.data.email, parsed.data.password);
    setSessionCookie(response, result.sessionId);
    response.status(201).json({ user: result.user });
  } catch (error) {
    if (error instanceof EmailAlreadyUsedError) {
      response.status(409).json({ message: "An account with that email already exists." });
      return;
    }
    if (error instanceof AuthUnavailableError) {
      response.status(503).json({ message: error.message });
      return;
    }
    console.error("Account registration failed:", error);
    response.status(500).json({ message: "We couldn't create your account just yet. Please try again." });
  }
});

app.post("/api/auth/login", async (request, response) => {
  const parsed = authRequestSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({ message: parsed.error.issues[0]?.message ?? "Please check your account details." });
    return;
  }
  try {
    const result = await loginUser(parsed.data.email, parsed.data.password);
    setSessionCookie(response, result.sessionId);
    response.json({ user: result.user });
  } catch (error) {
    if (error instanceof InvalidCredentialsError) {
      response.status(401).json({ message: error.message });
      return;
    }
    if (error instanceof AuthUnavailableError) {
      response.status(503).json({ message: error.message });
      return;
    }
    console.error("Account login failed:", error);
    response.status(500).json({ message: "We couldn't sign you in just yet. Please try again." });
  }
});

app.post("/api/auth/logout", async (request, response) => {
  try {
    await deleteSession(request.headers.cookie);
    clearSessionCookie(response);
    response.status(204).send();
  } catch (error) {
    if (error instanceof AuthUnavailableError) {
      response.status(503).json({ message: error.message });
      return;
    }
    console.error("Account logout failed:", error);
    response.status(500).json({ message: "We couldn't sign you out just yet. Please try again." });
  }
});

function isQuotaError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const details = error as { code?: unknown; status?: unknown };
  return details.code === "rate_limit_exceeded" || details.code === "insufficient_quota" || details.status === 429;
}

function isMissingKeyError(error: unknown): boolean {
  return error instanceof Error && error.message === "GROQ_API_KEY is not configured.";
}

app.post("/api/generate", async (request, response) => {
  const parsed = generateRequestSchema.safeParse(request.body);
  if (!parsed.success) {
    response.status(400).json({ message: parsed.error.issues[0]?.message ?? "Please check your study setup." });
    return;
  }

  try {
    const session = await generateStudySession(parsed.data);
    response.json(session);
  } catch (error) {
    console.error("Study generation failed:", error);
    if (isMissingKeyError(error)) {
      response.status(502).json({
        message: "Groq is not configured yet. Add GROQ_API_KEY to your local .env file, then restart the server."
      });
      return;
    }
    if (isQuotaError(error)) {
      response.status(502).json({
        message: "Groq rate limit reached. Wait a moment and try again, or check your Groq account limits."
      });
      return;
    }
    response.status(502).json({ message: "I couldn't make that study set just yet. Please try again." });
  }
});
initializeAuthDatabase()
  .then(() => {
    if (!process.env.DATABASE_URL) {
      console.warn("Authentication is disabled until DATABASE_URL is configured.");
    }
    app.listen(3001, () => console.log("API ready on http://localhost:3001"));
  })
  .catch((error) => {
    console.error("Authentication database setup failed:", error);
    process.exitCode = 1;
  });
