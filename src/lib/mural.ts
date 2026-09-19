import { neon } from "@neondatabase/serverless";
import {
  publicMessage,
  type PublicMuralMessage,
  type StoredMuralMessage,
} from "./mural-message";
import { deleteMessageForActor } from "./mural-delete";

export type MuralMessage = PublicMuralMessage;
export type MuralMessageForViewer = MuralMessage & { canDelete: boolean };

const databaseUrl = process.env.DATABASE_URL;
const sql = databaseUrl ? neon(databaseUrl) : null;
let initialized = false;

export function validateMessage(value: unknown) {
  const body = typeof value === "string" ? value.trim() : "";
  if (!body) throw new Error("Mensagem obrigatória");
  if ([...body].length > 500)
    throw new Error("A mensagem pode ter no máximo 500 caracteres");
  return body;
}

async function database() {
  if (!sql) throw new Error("DATABASE_URL não configurada");
  if (!initialized) {
    await sql`CREATE TABLE IF NOT EXISTS mural_messages (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      body text NOT NULL,
      github_id text NOT NULL,
      login text NOT NULL,
      avatar_url text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    )`;
    await sql`CREATE INDEX IF NOT EXISTS mural_messages_created_at ON mural_messages (created_at DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS mural_messages_rate_limit ON mural_messages (github_id, created_at DESC)`;
    initialized = true;
  }
  return sql;
}

export async function listMessages(): Promise<MuralMessage[]> {
  const db = await database();
  const rows = await db`SELECT id, body, github_id, login, avatar_url, created_at FROM mural_messages ORDER BY created_at DESC LIMIT 100`;
  return rows.map((row) =>
    publicMessage({
      id: row.id,
      body: row.body,
      githubId: row.github_id,
      login: row.login,
      avatarUrl: row.avatar_url,
      createdAt: new Date(row.created_at).toISOString(),
    }),
  );
}

export async function listMessagesForViewer(
  githubId?: string,
): Promise<MuralMessageForViewer[]> {
  const messages = await listMessages();
  if (!githubId) return messages.map((message) => ({ ...message, canDelete: false }));

  const db = await database();
  const rows = await db`
    SELECT id FROM mural_messages
    WHERE github_id = ${githubId}
    ORDER BY created_at DESC
    LIMIT 100
  `;
  const ownMessageIds = new Set(rows.map((row) => String(row.id)));
  return messages.map((message) => ({
    ...message,
    canDelete: ownMessageIds.has(message.id),
  }));
}

export async function createMessage(
  input: Omit<StoredMuralMessage, "id" | "createdAt">,
) {
  const db = await database();
  const body = validateMessage(input.body);
  const recent = await db`SELECT count(*)::int AS count FROM mural_messages WHERE github_id = ${input.githubId} AND created_at > now() - interval '1 minute'`;
  if (recent[0].count >= 5) throw new Error("Aguarde um minuto antes de publicar novamente");
  const rows = await db`INSERT INTO mural_messages (body, github_id, login, avatar_url) VALUES (${body}, ${input.githubId}, ${input.login}, ${input.avatarUrl}) RETURNING id, body, github_id, login, avatar_url, created_at`;
  const row = rows[0];
  return publicMessage({
    id: row.id,
    body: row.body,
    githubId: row.github_id,
    login: row.login,
    avatarUrl: row.avatar_url,
    createdAt: new Date(row.created_at).toISOString(),
  });
}

export async function deleteMessage({ id, githubId }: { id: string; githubId: string }) {
  return deleteMessageForActor(await database(), { id, githubId });
}
