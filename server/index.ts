import express from "express";

const app = express();
app.use(express.json());
app.get("/api/health", (_request, response) => response.json({ ok: true }));
app.listen(3001, () => console.log("API ready on http://localhost:3001"));
