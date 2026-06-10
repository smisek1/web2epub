import { pool } from "../pool.js";

// Purge: keep only the newest article per source, drop everything else and all
// real books. Order matters because of the kniha_clanek FKs.
export async function purge(): Promise<{ deletedArticles: number; deletedBooks: number }> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("DELETE FROM kniha_clanek");
    const booksRes = await client.query("DELETE FROM kniha WHERE jmeno <> 'nechci cist'");
    const articlesRes = await client.query(
      `DELETE FROM clanky
       WHERE id_clanky NOT IN (SELECT max(id_clanky) FROM clanky GROUP BY id_stranka)`,
    );
    await client.query("COMMIT");
    return {
      deletedArticles: articlesRes.rowCount ?? 0,
      deletedBooks: booksRes.rowCount ?? 0,
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
