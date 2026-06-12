import { pool } from "../pool.js";

// Purge: keep only the newest article per source (the scraper's dedup anchor,
// same max(id_clanky) rule as select_posledni), drop everything else and all
// real books, then park the survivors in the trash book so they don't reappear
// as unprocessed (#29). Order matters because of the kniha_clanek FKs.
export async function purge(): Promise<{
  deletedArticles: number;
  deletedBooks: number;
  keptArticles: number;
}> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("DELETE FROM kniha_clanek");
    const booksRes = await client.query("DELETE FROM kniha WHERE jmeno <> 'nechci cist'");
    const articlesRes = await client.query(
      `DELETE FROM clanky
       WHERE id_clanky NOT IN (SELECT max(id_clanky) FROM clanky GROUP BY id_stranka)`,
    );
    // The trash book normally exists (seed), but recreate it if it was lost.
    await client.query(
      `INSERT INTO kniha (jmeno)
       SELECT 'nechci cist' WHERE NOT EXISTS (SELECT 1 FROM kniha WHERE jmeno = 'nechci cist')`,
    );
    const keptRes = await client.query(
      `INSERT INTO kniha_clanek (id_clanky, id_kniha)
       SELECT id_clanky, (SELECT id_kniha FROM kniha WHERE jmeno = 'nechci cist')
       FROM clanky`,
    );
    await client.query("COMMIT");
    return {
      deletedArticles: articlesRes.rowCount ?? 0,
      deletedBooks: booksRes.rowCount ?? 0,
      keptArticles: keptRes.rowCount ?? 0,
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
