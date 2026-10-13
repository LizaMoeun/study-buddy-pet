---
doc: spec
status: approved
---

# Alpaca Study Buddy - Technical Spec

## How This Works, In Plain Language

The app has two parts:

1. A React website runs in the browser. It shows the landing page, note form, mode and quantity choices, quiz, flashcards, alpaca states, and completion actions.
2. A small TypeScript server receives the note, selected modes, and requested item count. It sends a carefully shaped request to Groq through its OpenAI-compatible API, checks that the response contains valid quiz and flashcard fields, and sends the checked result back to the browser.

The browser never receives the Groq key. The current note and generated study session stay in browser memory only, so the user can review or retake the current session, but refreshing or closing the page clears it. There is no database or real account system in this proof of concept.

Using Groq JSON mode and validation keeps the app from treating an AI provider like a generic chatbot. The server only returns data that matches the selected mode and the expected question, choice, answer, and flashcard shape. If that check fails, the browser shows a friendly retry message instead of broken study cards.

## The Core Journey Through the System

PRD ref: `prd.md > The Core Journey`.

1. The browser loads the landing view and renders the CSS alpaca in its welcome state.
2. The user chooses guest or the visible account option. Both enter the local study flow; account storage is not implemented.
3. The setup view stores the pasted note, selected mode, and quantity (3–7) in React state. In both mode, the quantity is the total item budget shared across quiz questions and flashcards.
4. On generate, the client sends those values to `POST /api/generate`. The alpaca changes to dancing/loading.
5. The server validates the request, builds the mode-specific Groq prompt, requests JSON mode output, validates the response with Zod, and returns the checked study session.
6. The client stores the session in memory and renders the selected quiz and/or flashcards.
7. Quiz answers update local progress and choose the alpaca's correct or supportive incorrect state. Flashcard gestures and keyboard arrows update the current card and reveal state.
8. When review is complete, the client renders completion actions: review, retake the same in-memory session, or create a new session.

## Stack

- **TypeScript** for the browser and server so the study-session contract is shared and checked.
- **React** for stateful screens and interactions. Docs: https://react.dev/
- **Vite** for the local development server and browser bundling. Docs: https://vite.dev/guide/
- **Express** for the small server endpoint. Docs: https://expressjs.com/
- **OpenAI Node SDK** pointed at Groq's compatible API for model requests and JSON output. Docs: https://github.com/openai/openai-node
- **Zod** for request and response validation. Docs: https://zod.dev/
- **CSS animations** for the replaceable alpaca placeholder; no animation asset or animation framework is required for the POC.

The learner accepted this small React/Vite plus server approach because it keeps the AI key private without adding accounts or a database. Groq's free API is used through the existing OpenAI-compatible SDK, with JSON mode plus Zod validation for reliable quiz and flashcard rendering.

## Where It Runs and How Someone Tries It

The app runs locally in a browser. Node.js 20 or newer and a Groq API key are required.

1. Copy `.env.example` to `.env`.
2. Put the key in `GROQ_API_KEY`. Never commit `.env`.
3. Install dependencies with `npm install`.
4. Start the client and API together with `npm run dev`.
5. Open `http://localhost:5173`.

The Vite development server proxies `/api` requests to the local TypeScript server. The required demo can be recorded from this local URL. Submission still requires a short demo video and a public GitHub repository; deployment is optional and is not part of this plan.

## Look and Feel

PRD ref: `prd.md > Look and Feel`.

- Use a light palette built around light pink, light blue, and light purple.
- Keep the layout spacious, calm, and easy to scan.
- Use a simple rounded typeface with a cute character without making the interface childish.
- Use a local CSS alpaca placeholder made from simple shapes or an illustrated treatment, with CSS motion states for welcome, loading/dancing, waiting, correct, incorrect, and completion.
- Keep copy short, warm, and non-judgmental. Avoid classroom grading language.

## Components

### App shell and route state

Owns the current view (landing, setup, study, completion), active session, and reset/new-session actions.
PRD ref: `prd.md > The Core Journey`.

### Landing and access choice

Explains the product and offers guest continuation plus a visible login/sign-up option. The account option is intentionally presentational in the POC.
PRD ref: `prd.md > Arrival and access choice`.

### Study setup

Collects note text, quiz/flashcard/both mode, and a quantity from 3–7. It blocks generation when the note is empty and provides the friendly input guidance state.
PRD ref: `prd.md > Note and mode setup` and `prd.md > Friendly guidance for unusable input or failures`.

### Generation client

Sends the selected note, modes, and quantity to the server, shows loading, and maps server errors to a retryable friendly message.
PRD ref: `prd.md > AI generation`.

### Generation API

Validates the request, calls Groq with a mode-aware prompt and JSON mode, validates the response with Zod, and returns only the selected output types.
PRD ref: `prd.md > AI generation` and `prd.md > Friendly guidance for unusable input or failures`.

### Quiz review

Renders multiple-choice questions, records the selected answer, shows result feedback, and drives the alpaca correct/incorrect state. It records enough local progress to support completion and full review.
PRD ref: `prd.md > Quiz review and encouragement`.

### Flashcard review

Renders the current prompt and answer state. It handles double-tap reveal, left/right swipe navigation, and keyboard arrow navigation.
PRD ref: `prd.md > Flashcard review`.

### Alpaca companion

Renders a replaceable local placeholder and selects a visual motion state from `welcome`, `loading`, `waiting`, `correct`, `incorrect`, and `complete`.
PRD ref: `prd.md > Look and Feel` and `prd.md > The Unique Kernel`.

### Completion and session actions

Shows the friendly completion message and exposes full review, retake, and new-session actions. Retake resets review progress but reuses the same generated session; new session clears it.
PRD ref: `prd.md > Completion`.

## Data Model

Shared types live in `src/shared/types.ts`.

```ts
type StudyMode = "quiz" | "flashcards" | "both";

type GenerateRequest = {
  note: string;
  mode: StudyMode;
  count: number; // total items; 3 through 7, shared across both mode outputs
};

type QuizQuestion = {
  question: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
};

type Flashcard = {
  front: string;
  back: string;
};

type StudySession = {
  mode: StudyMode;
  count: number;
  quiz?: QuizQuestion[];
  flashcards?: Flashcard[];
};
```

The client adds transient review state such as the current index, revealed card, selected quiz answers, and completion status. The server does not persist any data. Leaving or refreshing the page clears the active session.

## File Structure

```text
study-buddy-pet/
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── styles.css
│   ├── components/
│   │   ├── AlpacaCompanion.tsx
│   │   ├── Landing.tsx
│   │   ├── StudySetup.tsx
│   │   ├── QuizReview.tsx
│   │   ├── FlashcardReview.tsx
│   │   └── Completion.tsx
│   └── shared/
│       └── types.ts
├── server/
│   ├── index.ts
│   ├── openai.ts
│   └── validation.ts
├── .env.example
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.server.json
├── vite.config.ts
├── devpost/
└── .gitignore
```

## External Services and Dependencies

### Groq API

- **Call:** JSON-mode request from `server/openai.ts` using the OpenAI-compatible SDK.
- **Input:** System instructions plus the note, selected mode, and count.
- **Output:** JSON matching `StudySession`, validated by Zod before returning to the browser.
- **Key:** `GROQ_API_KEY` on the server only.
- **Base URL:** `https://api.groq.com/openai/v1`
- **Model:** `openai/gpt-oss-20b`
- **Docs:** https://console.groq.com/docs/models, https://console.groq.com/docs/json_mode, and https://github.com/openai/openai-node
- **Cost/rate limits:** Depend on Groq's free API limits; rate-limit failures are surfaced rather than replaced with fake content.

No database, authentication provider, hosted storage, or deployment service is used in the POC.

## Important Failure Modes

- **Empty note** -> Keep the user on setup and show a short alpaca-friendly hint.
- **Short or unclear note** -> Ask for more context instead of generating low-quality content.
- **Invalid mode/count/request** -> Return a clear client error and keep setup values available for correction.
- **Groq failure or invalid JSON/Zod output** -> Show a friendly retry action; never render unchecked material.
- **Keyboard or swipe at a boundary** -> Keep the current card and avoid moving outside the generated range.

## What Was Simplified and Why

- **CSS placeholder alpaca** instead of a final animated asset - the learner does not have an asset yet, and CSS states prove the emotional interaction while keeping replacement easy.
- **Browser memory** instead of accounts, persistence, and a database - the POC needs review, retake, and new-session behavior, not saved history.
- **One generation endpoint** instead of a general chatbot - a typed mode/count request directly proves accurate intent handling.
- **Local development** instead of deployment - the demo video and public repository are required, while hosting is optional.

## Decisions and Open Issues

### Decisions

- React + Vite frontend and TypeScript server endpoint.
- Groq JSON mode for quiz/flashcard generation through the OpenAI-compatible SDK.
- Local browser demo.
- TypeScript shared data types plus Zod runtime validation.
- CSS alpaca placeholder and motion states.
- Guest/account choice is visible, but authentication and persistence are deferred.
- Active session is browser-memory only.
- In both mode, the selected 3–7 count is a total shared across quiz questions and flashcards.

### Learner uncertainty clarified

The learner wanted the app to understand intent instead of acting like a generic chatbot. We clarified that the browser sends an explicit mode and count, the server builds the corresponding prompt, and Zod rejects responses that do not match the expected study shape. This will be checked during the build with quiz-only, flashcard-only, and both-mode requests plus an invalid-response failure path.

### Open issues

- The default Groq model is `openai/gpt-oss-20b`; it can be overridden with `GROQ_MODEL` after checking Groq's active model list and JSON-mode support.
- Final alpaca illustration and animation assets can replace the CSS placeholder later.
- Exact alpaca wording can be tuned during implementation without changing the product behavior.
