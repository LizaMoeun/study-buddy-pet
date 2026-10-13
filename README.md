# Alpaca Study Buddy

Turn notes into friendly quizzes and flashcards with a supportive alpaca companion.

## Run locally

1. Install Node.js 20 or newer.
2. Install dependencies:

   ```powershell
   npm install
   ```

3. Copy `.env.example` to `.env` and add your Groq API key:

   ```env
   GROQ_API_KEY=your_key_here
   GROQ_MODEL=openai/gpt-oss-20b
   ```

   Keep `.env` private. It is ignored by Git.

4. Start the client and server:

   ```powershell
   npm run dev
   ```

Open http://localhost:5173. The server uses the OpenAI-compatible SDK pointed at Groq's free API endpoint. Responses use Groq JSON mode and are validated with Zod before they reach the browser.

## Useful commands

```powershell
npm run check
npm run build
```

## Provider

The app uses Groq's OpenAI-compatible API at `https://api.groq.com/openai/v1`, with `openai/gpt-oss-20b` as the default active JSON-capable production model confirmed through Groq's live model list. See Groq's [model list](https://console.groq.com/docs/models) and [JSON mode documentation](https://console.groq.com/docs/json_mode).