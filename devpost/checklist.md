---
doc: checklist
status: approved
---

# Build Checklist

Build mode: fast

## Slices

- [x] **1. A welcoming local study setup is usable**
  Becomes usable: A local React/Vite app opens to the Alpaca Study Buddy landing page, lets the user continue as guest, and reaches a note-and-mode setup screen with the approved light visual direction.
  Why now: Bootstrapping belongs inside the first usable slice, and this gives every later behavior a real journey to extend without adding accounts or persistence.
  PRD ref: `prd.md > The Core Journey` (steps 1-3), `prd.md > Arrival and access choice`, `prd.md > Note and mode setup`, `prd.md > Look and Feel`
  Spec ref: `spec.md > Stack`, `spec.md > Where It Runs and How Someone Tries It`, `spec.md > Components`, `spec.md > File Structure`, `spec.md > Look and Feel`
  Build: Scaffold the React/Vite TypeScript client and local server shape, install dependencies, create the app shell, landing/access choice, study setup form, mode selection, 3–7 quantity selection, shared types, and CSS alpaca placeholder states. Keep active setup state in memory.
  Verify (mechanical): Run the TypeScript check and production build; start the local app and confirm the landing page and guest-to-setup flow load without console or server errors.
  Learner check: Open the local app, choose guest use, paste a short note, select a mode and quantity, and say whether the first screen feels like the friendly study companion you pictured.
  Commit: `Create Alpaca Study Buddy setup flow`

- [x] **2. Notes become validated AI study material**
  Becomes usable: The selected note, mode, and quantity travel through the local server to Groq, and the app renders validated quiz and/or flashcard data instead of generic chatbot text.
  Why now: This is the core technical risk and the unique product kernel; proving structured generation early prevents building polished review UI around an unreliable response shape.
  PRD ref: `prd.md > Note and mode setup`, `prd.md > AI generation`, `prd.md > Friendly guidance for unusable input or failures`
  Spec ref: `spec.md > The Core Journey Through the System`, `spec.md > Generation API`, `spec.md > Data Model`, `spec.md > External Services and Dependencies`, `spec.md > Important Failure Modes`
  Build: Add the Express `POST /api/generate` endpoint, Groq JSON-mode request through the OpenAI-compatible SDK, Zod request/response schemas, mode-aware prompt, environment template, Vite API proxy, loading state, and generated output rendering for quiz, flashcards, and shared-count both mode. Keep the API key server-side.
  Verify (mechanical): Run type-check/build; with a configured key, call the endpoint for quiz-only, flashcard-only, and both mode and verify the returned shape and selected output types; send invalid count or empty note and verify a clear error response.
  Learner check: Start the app with your local key, paste a real note, try each mode, and check that the generated questions/cards use the note and respect your selected quantity.
  Commit: `Generate validated AI study material`

- [x] **3. Quiz, flashcards, and alpaca reactions are interactive**
  Becomes usable: The learner can answer multiple-choice questions, reveal and navigate flashcards with touch or keyboard, and see the alpaca react to loading, waiting, correct, and incorrect states.
  Why now: Once real material exists, this slice turns it into the supportive experience that distinguishes the project from a generic generator.
  PRD ref: `prd.md > Flashcard review`, `prd.md > Quiz review and encouragement`, `prd.md > Look and Feel`
  Spec ref: `spec.md > Quiz review`, `spec.md > Flashcard review`, `spec.md > Alpaca companion`, `spec.md > Data Model`
  Build: Implement quiz progress and answer feedback, flashcard double-tap reveal, left/right swipe navigation, keyboard arrows, in-memory review state, and CSS alpaca motion states with supportive messages.
  Verify (mechanical): Run type-check/build and exercise each interaction in the browser; confirm answer selection changes feedback, flashcard boundaries do not move out of range, double-tap reveals the answer, swipes and arrow keys navigate, and mode-specific output renders.
  Learner check: Try one correct and one incorrect quiz answer, then review cards with double-tap, swipes, and arrow keys. Report whether the alpaca feels encouraging rather than like a classroom grader.
  Commit: `Add interactive study review`

- [x] **4. Completion, retry, and new-session paths finish the POC**
  Becomes usable: The user gets friendly guidance for empty/unclear notes and generation failures, reaches completion, reviews or retakes the same session, or starts a new one.
  Why now: These boundary states complete the promised journey without adding deferred authentication, history, summaries, or plans.
  PRD ref: `prd.md > Quiz review and encouragement`, `prd.md > Friendly guidance for unusable input or failures`, `prd.md > States and Boundaries`, `prd.md > Completion`
  Spec ref: `spec.md > Completion and session actions`, `spec.md > Important Failure Modes`, `spec.md > What Was Simplified and Why`
  Build: Add completion view and full-session review, retake reset, new-session reset, friendly empty/unclear/error messages, retry behavior, robust Groq JSON parsing, and final visual polish.
  Verify (mechanical): Run type-check/build; test empty input, short/unclear input handling, simulated API failure, final-item completion, review, retake, new session, and refresh-clears-memory behavior. Browser verification covered Groq generation, completion, full review, retake, refresh reset, empty input, and short-note validation; the provider failure path was also observed during the malformed JSON-mode response and returned a friendly retry message.
  Learner check: Run one short session to the end, try review, retake, and new session, then try an empty note and a failed generation. Note anything confusing, discouraging, or unlike the approved PRD.
  Commit: `Finish study session flows`

## Hands-on Checkpoints

- [ ] Early usable behavior explored — after slice 1, before AI and review details are finalized
- [x] Final kick-the-tires exploration and feedback completed — learner ran the guest journey through completion, full review, retake, new session, and invalid-note guidance; reported that everything worked and felt ready.

## Final Review

- [x] Final review complete — feedback resolved and learner confirms ready to ship.

## Code Tour and App Map

- [x] Learning activity complete — brief evidence-based recap of the typed AI request through Groq JSON mode, Zod validation, and review rendering.
- [x] Optional edit and transfer reflection addressed — optional live code route was offered; learner chose the brief recap.
- [x] `devpost/app-map.html` generated from finished code and checked for public-safe offline content, including a project-grounded practice to reuse.

Activity and evidence: The build traced the real generation path from `Setup.generate` in `src/App.tsx`, through `POST /api/generate` in `server/index.ts`, to Groq JSON decoding and Zod validation in `server/openai.ts`; the resulting session renders through the quiz/flashcard review components.
Route and stops: Reference route recorded in `devpost/app-map.html`; no live tour was requested.
Edit outcome: Not applicable; learner chose the brief recap instead of the optional safe edit.
Reflection: Optional transfer reflection offered; learner chose the brief recap.
Activity mode: Evidence-based recap.

## Revisions

- The first CSS placeholder was too dog-like in the early hands-on check, so its proportions were revised to use a longer alpaca face, taller ears, longer neck, and visible body while keeping the replaceable CSS-only approach.
- Groq JSON mode rejected the original prompt because it embedded a JSON Schema that the model copied before its answer. The prompt now describes the required object fields in plain language, and the server safely unwraps one encoded JSON layer before applying the existing Zod validation.
