import { pool } from "../pool.js";

export interface ArticleFilters {
  web: number[] | null;
  dateFrom: string | null;
  dateTo: string | null;
  autor: string | null;
  q: string | null;
  page: number;
  pageSize: number;
  sortBy: "datum" | "nadpis";
  sortDir: "asc" | "desc";
}

// Whitelist sort columns — they cannot be parametrised, so never interpolate user input.
const SORT_COLUMNS: Record<"datum" | "nadpis", string> = {
  datum: "c.datum",
  nadpis: "c.nadpis",
};

// Shared filter clause. $1..$5 are the filters; a NULL filter is neutralised.
const WHERE = `
  WHERE kc.id_clanky IS NULL                                    -- only articles not in any book
    AND ($1::int[] IS NULL OR s.id_stranka = ANY($1))           -- web
    AND ($2::date  IS NULL OR c.datum >= $2)                    -- dateFrom
    AND ($3::date  IS NULL OR c.datum <= $3)                    -- dateTo
    AND ($4::text  IS NULL OR c.autor ILIKE '%'||$4||'%')       -- autor
    AND ($5::text  IS NULL OR c.nadpis ILIKE '%'||$5||'%' OR c.clanek ILIKE '%'||$5||'%')`;

const FROM = `
  FROM clanky c
  JOIN stranka s ON s.id_stranka = c.id_stranka
  LEFT JOIN kniha_clanek kc ON kc.id_clanky = c.id_clanky`;

export async function listArticles(f: ArticleFilters) {
  const filterParams = [f.web, f.dateFrom, f.dateTo, f.autor, f.q];

  const totalRes = await pool.query<{ total: number }>(
    `SELECT count(*)::int AS total ${FROM} ${WHERE}`,
    filterParams,
  );
  const total = totalRes.rows[0]?.total ?? 0;

  const orderCol = SORT_COLUMNS[f.sortBy];
  const dir = f.sortDir === "asc" ? "ASC" : "DESC";
  const offset = (f.page - 1) * f.pageSize;

  const itemsRes = await pool.query(
    `SELECT c.id_clanky        AS id,
            c.nadpis,
            s.jmeno             AS web,
            s.id_stranka        AS "webId",
            c.datum,
            c.autor,
            c.uvodni_odstavec   AS "uvodniOdstavec",
            c.posledni          AS url,
            c.datum_importu     AS "datumImportu"
     ${FROM} ${WHERE}
     ORDER BY ${orderCol} ${dir}, c.nadpis
     LIMIT $6 OFFSET $7`,
    [...filterParams, f.pageSize, offset],
  );

  return { items: itemsRes.rows, total, page: f.page, pageSize: f.pageSize };
}

export async function getArticle(id: number) {
  const res = await pool.query(
    `SELECT c.id_clanky      AS id,
            c.nadpis,
            s.jmeno           AS web,
            c.datum,
            c.autor,
            c.uvodni_odstavec AS "uvodniOdstavec",
            c.clanek,
            c.posledni        AS url,
            c.datum_importu   AS "datumImportu"
     FROM clanky c
     JOIN stranka s ON s.id_stranka = c.id_stranka
     WHERE c.id_clanky = $1`,
    [id],
  );
  return res.rows[0] ?? null;
}

// Strip <a> tags from an article's HTML, keeping their inner text (#14).
export async function removeLinks(id: number): Promise<string | null> {
  const cur = await pool.query<{ clanek: string }>("SELECT clanek FROM clanky WHERE id_clanky = $1", [id]);
  if (cur.rowCount === 0) return null;
  const cleaned = cur.rows[0]!.clanek.replace(/<a\b[^>]*>/gi, "").replace(/<\/a>/gi, "");
  await pool.query("UPDATE clanky SET clanek = $2 WHERE id_clanky = $1", [id, cleaned]);
  return cleaned;
}

// Move articles to the special "nechci cist" (trash) book.
export async function trashArticles(ids: number[]) {
  const res = await pool.query(
    `INSERT INTO kniha_clanek (id_clanky, id_kniha)
     SELECT unnest($1::int[]), (SELECT id_kniha FROM kniha WHERE jmeno = 'nechci cist')
     ON CONFLICT (id_clanky, id_kniha) DO NOTHING`,
    [ids],
  );
  return res.rowCount ?? 0;
}
