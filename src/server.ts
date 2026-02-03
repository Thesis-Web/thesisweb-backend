import Fastify from "fastify";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

type SignupBody = {
  email: string;
  name?: string;
  source?: string;
  hp?: string; // honeypot (must be empty)
};

const HOST = process.env.HOST ?? "127.0.0.1";
const PORT = Number(process.env.PORT ?? "8787");

const DATA_DIR = process.env.DATA_DIR ?? path.resolve("data");
const DB_PATH = process.env.DB_PATH ?? path.join(DATA_DIR, "signups.sqlite3");

fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");

const insertStmt = db.prepare(`
  INSERT INTO signups (email, name, source, ip, user_agent)
  VALUES (@email, @name, @source, @ip, @user_agent)
`);

const app = Fastify({
  logger: true,
  bodyLimit: 10 * 1024,
  trustProxy: true
});

await app.register(helmet, { global: true });
await app.register(rateLimit, { global: true, max: 30, timeWindow: "1 minute" });

app.get("/healthz", async () => ({ ok: true }));

app.post<{ Body: SignupBody }>("/v1/signup", {
  schema: {
    body: {
      type: "object",
      additionalProperties: false,
      required: ["email"],
      properties: {
        email: { type: "string", minLength: 3, maxLength: 320 },
        name: { type: "string", minLength: 1, maxLength: 80 },
        source: { type: "string", minLength: 1, maxLength: 80 },
        hp: { type: "string", maxLength: 200 }
      }
    }
  }
}, async (req, reply) => {
  const { email, name, source, hp } = req.body;

  if (hp && hp.trim().length > 0) return reply.code(204).send();

  const normalizedEmail = String(email).trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return reply.code(400).send({ error: "invalid_email" });
  }

  const ip = req.ip;
  const userAgent = req.headers["user-agent"] ?? null;

  try {
    insertStmt.run({
      email: normalizedEmail,
      name: name?.trim() || null,
      source: source?.trim() || null,
      ip,
      user_agent: userAgent
    });
    return reply.code(201).send({ ok: true });
  } catch (err: any) {
    if (String(err?.message || "").includes("UNIQUE")) {
      return reply.code(200).send({ ok: true, already: true });
    }
    req.log.error({ err }, "signup_insert_failed");
    return reply.code(500).send({ error: "server_error" });
  }
});

await app.listen({ host: HOST, port: PORT });
app.log.info({ host: HOST, port: PORT, db: DB_PATH }, "server_listening");
