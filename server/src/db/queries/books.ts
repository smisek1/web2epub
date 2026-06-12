import { pool } from "../pool.js";

// List real books (the "nechci cist" trash bucket is excluded) with article stats.
export async function listBooks() {
  const res = await pool.query(
    `SELECT k.id_kniha           AS "idKniha",
            k.jmeno,
            count(kc.id_clanky)::int AS "pocetClanku",
            max(c.datum)          AS "nejnovejsiDatum"
     FROM kniha k
     LEFT JOIN kniha_clanek kc ON kc.id_kniha = k.id_kniha
     LEFT JOIN clanky c ON c.id_clanky = kc.id_clanky
     WHERE k.jmeno <> 'nechci cist'
     GROUP BY k.id_kniha, k.jmeno
     ORDER BY k.id_kniha DESC`,
  );
  return res.rows;
}

export async function bookExists(id: number): Promise<boolean> {
  const res = await pool.query("SELECT 1 FROM kniha WHERE id_kniha = $1", [id]);
  return (res.rowCount ?? 0) > 0;
}

// Create a book from selected article ids, in one transaction.
// Default name: YYYY-MM-DD_<distinct source names, '.'→'_'>; a caller-supplied
// name wins (single-article EPUB from an ad-hoc URL is named by its title, #33).
export async function createBook(
  ids: number[],
  jmenoOverride?: string,
): Promise<{ id_kniha: number; jmeno: string }> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const nameRes = await client.query<{ jmeno: string }>(
      `SELECT TO_CHAR(NOW(), 'YYYY-MM-DD_') ||
              REPLACE(STRING_AGG(DISTINCT s.jmeno, '-' ORDER BY s.jmeno), '.', '_') AS jmeno
       FROM stranka s
       JOIN clanky c ON c.id_stranka = s.id_stranka
       WHERE c.id_clanky = ANY($1::int[])`,
      [ids],
    );
    const jmeno = jmenoOverride ?? nameRes.rows[0]?.jmeno;
    if (!nameRes.rows[0]?.jmeno) {
      throw new Error("no matching articles for given ids");
    }

    const bookRes = await client.query<{ id_kniha: number }>(
      `INSERT INTO kniha (jmeno) VALUES ($1) RETURNING id_kniha`,
      [jmeno],
    );
    const id_kniha = bookRes.rows[0]!.id_kniha;

    await client.query(
      `INSERT INTO kniha_clanek (id_clanky, id_kniha)
       SELECT unnest($1::int[]), $2`,
      [ids, id_kniha],
    );

    await client.query("COMMIT");
    return { id_kniha, jmeno };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
