---
doc: prd
status: approved
---

# Alpaca Study Buddy - Product Requirements

One line: A cute, supportive web study companion that turns pasted notes into quizzes and/or flashcards for students and other learners.

## The Core Journey

Source: `scope.md > The Core Loop` and `scope.md > What "Working" Looks Like`.

1. The user opens a welcoming landing page that explains Alpaca Study Buddy.
2. The user chooses to continue as a guest or select login/sign-up. Account users authenticate with email and password; guest users can still enter without an account.
3. The user reaches the study screen, pastes notes, and selects quiz, flashcards, or both.
4. The user starts processing. The alpaca shows a dancing/loading motion while the AI creates material based on the note and selected mode.
5. The user reviews the generated material:
   - Flashcards show a prompt, reveal the answer on double-tap, move forward with a left swipe, move backward with a right swipe, and support keyboard arrow navigation.
   - Quizzes show multiple-choice questions. The user selects an answer and receives supportive feedback.
6. The alpaca reacts to quiz results: it celebrates a correct answer and gives an encouraging, non-judgmental response to an incorrect answer.
7. The user can continue reviewing until the generated flashcards or quiz is complete.
8. At completion, the user sees a friendly alpaca message and can review the full quiz and answers, retake the same material, or return to create a new study session.

## Screens and Layout

### Landing page

- A clear explanation of what the platform does.
- A visible animated alpaca welcome.
- Guest continuation and login/sign-up choices.
- The page should make the product feel friendly and low-pressure before studying begins.

### Study setup screen

- A note input area for pasted text.
- Mode selection for quiz, flashcards, or both.
- A process/generate action.
- Alpaca welcome or ready state.

### Study experience

- Generated flashcards and/or quiz content.
- Alpaca state and feedback area.
- Flashcard navigation and answer reveal interaction.
- Multiple-choice quiz interaction and answer feedback.
- A clear way to move through the generated content.
- A completion view with the alpaca, a friendly message, a review-full-session action, a retake action, and a create-new-session action.

## Look and Feel

Source: `scope.md > Inspiration & Identity`.

- Light, cheerful color direction using light pink, light blue, and light purple.
- Simple but cute typography.
- A cute animated alpaca as the main companion.
- Warm, encouraging, and comfortable rather than childish, embarrassing, dark, or classroom-like.
- Motion should communicate welcome, waiting, celebration, and encouragement.

## Features and Behavior

### Arrival and access choice

Source: `scope.md > The Core Loop` and `scope.md > The POC Boundary`.

- The landing page explains the note-to-study experience.
- The user can choose guest use or login/sign-up.
- Guest use allows the user to proceed without creating an account.
- Login/sign-up uses PostgreSQL-backed accounts and server-side sessions. Study history remains outside this POC.

### Note and mode setup

Source: `scope.md > The Core Loop`.

- The user can paste notes into the study setup screen.
- The user can choose quiz only, flashcards only, or both.
- The user can choose how many items to generate, from 3 to 7.
- When both modes are selected, the chosen quantity is the total number of items shared across quiz questions and flashcards.
- The AI processes the note only after the user has made the mode choice and started the action.
- The generated output must follow the selected mode rather than returning a generic response.

### AI generation

Source: `scope.md > The Unique Kernel` and `scope.md > The Learner's learning goal`.

- The AI creates study material grounded in the pasted note.
- Quiz output uses multiple-choice questions.
- Flashcard output contains a review prompt and a hidden answer.
- When both modes are selected, both usable output types are provided.
- The generation state is visible, with the alpaca dancing while the user waits.

### Flashcard review

Source: `scope.md > What "Working" Looks Like`.

- A flashcard initially shows the prompt or front.
- A double-tap reveals the answer on the back.
- A left swipe moves to the next card.
- A right swipe moves to the previous card.
- Keyboard arrow controls also move between cards.
- The alpaca remains in a waiting/supportive action during review.

### Quiz review and encouragement

Source: `scope.md > The Unique Kernel`.

- Each quiz question presents multiple answer choices.
- The user selects an answer.
- Correct answers trigger a happy or dancing alpaca reaction and encouraging feedback.
- Incorrect answers trigger a supportive alpaca reaction and a short friendly message that helps the learner continue rather than feel bad or give up.
- Feedback should be contextual to the result instead of using one identical response for every state.
- After the final item, the user sees a friendly completion message.
- From completion, the user can review the full quiz and answers or start a new session.
- From completion, the user can retake the same generated material if they are not satisfied with their attempt.

### Friendly guidance for unusable input or failures

Source: `scope.md > The POC Boundary`.

- Empty notes receive a short, friendly prompt explaining that the user should add some notes before generating material.
- Notes that are too short or unclear receive a helpful hint to add more useful context or detail.
- AI generation failures receive a friendly retry message and a clear action to try again.
- These messages should preserve the supportive tone and should not blame or discourage the user.
- The prompt/response behavior should distinguish these cases so each gets a suitable message or next action.

## States and Boundaries

- **First arrival** - The user sees the purpose of the app, alpaca welcome, and guest/account choice.
- **Guest mode** - The user can use the study flow, but their information and history are not saved.
- **Setup empty state** - No note has been entered; generation cannot begin and the user receives a friendly hint.
- **Setup incomplete/unclear input** - The note does not provide enough useful material; the user receives guidance to improve it.
- **Generating** - The selected mode is locked or visibly processing while the alpaca dances.
- **Generated flashcards** - The user can reveal and navigate cards.
- **Generated quiz** - The user can select a multiple-choice answer and receive a reaction.
- **Generation error** - The user sees a friendly explanation and can retry.
- **Completion** - The user sees a friendly alpaca completion message and can review the full quiz and answers, retake the same material, or create a new session. No saved history is required in the POC.

## Product Decisions

- Quiz and flashcards are both core modes; the user chooses one or both before AI processing.
- The user chooses a short generation length of 3–7 items so a session does not feel endless.
- For both mode, the chosen 3–7 quantity is shared across the two output types rather than multiplied.
- Quiz questions are multiple-choice.
- Flashcards use double-tap to reveal, swipe navigation, and keyboard arrow navigation.
- The alpaca reacts to loading, waiting, correct, and incorrect states.
- Guest versus account choice is supported; account study history remains deferred.
- The visual direction uses light pink, light blue, and light purple with simple, cute typography.
- Empty, unclear, and failed-generation cases get distinct, short, friendly guidance.
- Completion provides full-session review, retake, and create-new-session actions.
- Completion offers both full-session review and a new-session path.

## What We're Building

- Landing page with purpose, alpaca welcome, and guest/account choice.
- Study setup with note input, mode selection, and processing action.
- AI-generated quiz and/or flashcard output based on the selected mode.
- Multiple-choice quiz interaction with positive and supportive incorrect-answer feedback.
- Flashcard answer reveal and pointer/keyboard navigation.
- Alpaca motion and feedback states.
- Friendly handling for empty notes, unclear notes, and generation failures.
- Friendly completion with full-session review, retake, and create-new-session actions.

## Deferred From the POC

- Saved study history, password reset, email verification, and social login remain outside this POC.
- Saved notes, user profiles, and study history, because they require persistence beyond the core experience.
- Summary and plan-list generation, because they are useful extensions but not needed to prove the quiz/flashcard kernel.

## Possible Later Enhancements

- Add note summarization and conclusion generation.
- Turn notes into an organized plan list.
- Add motivational quotes or a richer motivation system.
- Add a bunny or additional companion characters.
- Add saved history and personalized study progress.

## Non-Goals

- The app will not behave as a generic open-ended chatbot; generated material must follow the selected study mode.
- The app will not act like a formal classroom grading system.
- The app will not require accounts to try the core experience.
- The app will not promise that generated material is perfect; the POC should keep output grounded in the supplied note and present it as study assistance.

## Open Questions

- **Can wait until build:** The exact wording of alpaca messages can be tuned while preserving the supportive states and intent.
