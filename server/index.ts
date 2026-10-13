import "dotenv/config";
import express from "express";
import { generateStudySession } from "./openai.js";
import { generateRequestSchema } from "./validation.js";

const app = express();
app.use(express.json());
app.get("/api/health", (_request, response) => response.json({ ok: true }));

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
app.listen(3001, () => console.log("API ready on http://localhost:3001"));
