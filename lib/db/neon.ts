import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL;

// Local fallback count if DATABASE_URL is not set yet in development
let memoryCount = 48;

export async function getParticipantCount(): Promise<number> {
  if (!databaseUrl) {
    return memoryCount;
  }
  try {
    const sql = neon(databaseUrl);
    // Ensure table exists
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
