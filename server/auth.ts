import { randomBytes, randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { Pool } from "pg";

const SESSION_COOKIE = "alpaca_session";
const SESSION_DAYS = 30;

export type AuthUser = {
  id: string;
  email: string;
};

export class AuthUnavailableError extends Error {
  constructor() {
    super("Authentication is not configured. Add DATABASE_URL to the server environment.");
  }
}

export class InvalidCredentialsError extends Error {}
export class EmailAlreadyUsedError extends Error {}

const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : null;

export async function initializeAuthDatabase() {
  if (!pool) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at TIMESTAMPTZ NOT NULL
    );
    CREATE INDEX IF NOT EXISTS sessions_expires_at_idx ON sessions (expires_at);
  `);
}

function requirePool() {
  if (!pool) throw new AuthUnavailableError();
  return pool;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function makeSessionCookie(sessionId: string) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${SESSION_COOKIE}=${sessionId}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${SESSION_DAYS * 24 * 60 * 60}${secure}`;
}

function readSessionId(cookieHeader: string | undefined) {
  const session = cookieHeader
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${SESSION_COOKIE}=`));
  return session?.slice(`${SESSION_COOKIE}=`.length);
}

async function createSession(user: AuthUser) {
  const sessionId = randomBytes(32).toString("hex");
  await requirePool().query(
    "INSERT INTO sessions (id, user_id, expires_at) VALUES ($1, $2, NOW() + INTERVAL '30 days')",
    [sessionId, user.id]
  );
  return sessionId;
}

export function setSessionCookie(response: { setHeader: (name: string, value: string) => void }, sessionId: string) {
  response.setHeader("Set-Cookie", makeSessionCookie(sessionId));
}

export function clearSessionCookie(response: { setHeader: (name: string, value: string) => void }) {
  response.setHeader("Set-Cookie", `${SESSION_COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`);
}

export async function registerUser(email: string, password: string) {
  const normalizedEmail = normalizeEmail(email);
  const passwordHash = await bcrypt.hash(password, 12);
  try {
    const result = await requirePool().query<AuthUser>(
      "INSERT INTO users (id, email, password_hash) VALUES ($1, $2, $3) RETURNING id, email",
      [randomUUID(), normalizedEmail, passwordHash]
    );
    const user = result.rows[0];
    if (!user) throw new Error("The account could not be created.");
    return { user, sessionId: await createSession(user) };
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "23505") {
      throw new EmailAlreadyUsedError();
    }
    throw error;
  }
}

export async function loginUser(email: string, password: string) {
  const result = await requirePool().query<{ id: string; email: string; password_hash: string }>(
    "SELECT id, email, password_hash FROM users WHERE email = $1",
    [normalizeEmail(email)]
  );
  const record = result.rows[0];
  if (!record || !(await bcrypt.compare(password, record.password_hash))) {
    throw new InvalidCredentialsError("Email or password is incorrect.");
  }
  const user = { id: record.id, email: record.email };
  return { user, sessionId: await createSession(user) };
}

export async function getUserFromRequest(cookieHeader: string | undefined) {
  const sessionId = readSessionId(cookieHeader);
  if (!sessionId) return null;
  const result = await requirePool().query<AuthUser>(
    `SELECT users.id, users.email
     FROM sessions JOIN users ON users.id = sessions.user_id
     WHERE sessions.id = $1 AND sessions.expires_at > NOW()`,
    [sessionId]
  );
  return result.rows[0] ?? null;
}

export async function deleteSession(cookieHeader: string | undefined) {
  const sessionId = readSessionId(cookieHeader);
  if (sessionId) await requirePool().query("DELETE FROM sessions WHERE id = $1", [sessionId]);
}
