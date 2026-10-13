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
  return details.code === "insufficient_quota" || details.status === 429;
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
    if (isQuotaError(error)) {
      response.status(502).json({
        message: "This OpenAI account has no API credits remaining. Add credits, then try again."
      });
      return;
    }
    response.status(502).json({ message: "I couldn't make that study set just yet. Please try again." });
  }
});
app.listen(3001, () => console.log("API ready on http://localhost:3001"));
