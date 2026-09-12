import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL;

// Local fallback count if DATABASE_URL is not set yet in development
let memoryCount = 48;

// Local fallback memory presence map: sessionId -> lastSeenTimestamp
const memoryPresence = new Map<string, number>();

export async function getParticipantCount(): Promise<number> {
  if (!databaseUrl) {
    return memoryCount;
  }
  try {
    const sql = neon(databaseUrl);
    await sql`
      CREATE TABLE IF NOT EXISTS participant_stats (
        id VARCHAR(32) PRIMARY KEY,
        completed_tests BIGINT NOT NULL DEFAULT 0,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    const rows = await sql`
      SELECT completed_tests FROM participant_stats WHERE id = 'global';
    `;
    if (rows.length === 0) {
      await sql`
        INSERT INTO participant_stats (id, completed_tests) VALUES ('global', 1)
        ON CONFLICT (id) DO NOTHING;
      `;
      return 1;
    }
    return Number(rows[0]!.completed_tests);
  } catch (error) {
    console.error("NeonDB getParticipantCount error:", error);
    return memoryCount;
  }
}

export async function incrementParticipantCount(): Promise<number> {
  if (!databaseUrl) {
    memoryCount += 1;
    return memoryCount;
  }
  try {
    const sql = neon(databaseUrl);
    await sql`
      CREATE TABLE IF NOT EXISTS participant_stats (
        id VARCHAR(32) PRIMARY KEY,
        completed_tests BIGINT NOT NULL DEFAULT 0,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    const rows = await sql`
      INSERT INTO participant_stats (id, completed_tests, updated_at)
      VALUES ('global', 1, NOW())
      ON CONFLICT (id) DO UPDATE
      SET completed_tests = participant_stats.completed_tests + 1,
          updated_at = NOW()
      RETURNING completed_tests;
    `;
    if (rows.length > 0) {
      return Number(rows[0]!.completed_tests);
    }
    return memoryCount;
  } catch (error) {
    console.error("NeonDB incrementParticipantCount error:", error);
    memoryCount += 1;
    return memoryCount;
  }
}

export async function heartbeatVisitor(
  sessionId: string
): Promise<{ online: number; completed: number }> {
  const now = Date.now();
  memoryPresence.set(sessionId, now);

  // Clean stale in-memory sessions (> 30s)
  for (const [id, time] of memoryPresence.entries()) {
    if (now - time > 30_000) {
      memoryPresence.delete(id);
    }
  }

  const completed = await getParticipantCount();

  if (!databaseUrl) {
    return {
      online: Math.max(1, memoryPresence.size),
      completed,
    };
  }

  try {
    const sql = neon(databaseUrl);
    await sql`
      CREATE TABLE IF NOT EXISTS active_presence (
        session_id VARCHAR(64) PRIMARY KEY,
        last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // Upsert current session ping
    await sql`
      INSERT INTO active_presence (session_id, last_seen)
      VALUES (${sessionId}, NOW())
      ON CONFLICT (session_id) DO UPDATE SET last_seen = NOW();
    `;

    // Query online in the last 25 seconds
    const onlineRows = await sql`
      SELECT COUNT(*)::int AS count FROM active_presence
      WHERE last_seen > NOW() - INTERVAL '25 seconds';
    `;

    // Periodically clean up stale sessions (> 5 minutes)
    if (Math.random() < 0.1) {
      void sql`DELETE FROM active_presence WHERE last_seen < NOW() - INTERVAL '5 minutes'`.catch(() => {});
    }

    const online = Math.max(1, Number(onlineRows[0]?.count || 1));
    return { online, completed };
  } catch (error) {
    console.error("NeonDB presence error:", error);
    return {
      online: Math.max(1, memoryPresence.size),
      completed,
    };
  }
}

export async function removeVisitor(sessionId: string): Promise<void> {
  memoryPresence.delete(sessionId);
  if (!databaseUrl) return;
  try {
    const sql = neon(databaseUrl);
    await sql`DELETE FROM active_presence WHERE session_id = ${sessionId};`;
  } catch {
    // Ignore teardown errors
  }
}
