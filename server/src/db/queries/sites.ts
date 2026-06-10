import { pool } from "../pool.js";

export interface SiteInput {
  jmeno: string;
  link: string;
  xpath_links: string | null;
  xpath_nadpis: string | null;
  xpath_clanek: string | null;
  xpath_datum: string | null;
  xpath_uvodni_odstavec: string | null;
  xpath_autor: string | null;
  enabled: boolean;
}

const COLUMNS = `id_stranka AS "idStranka", jmeno, link, enabled,
  xpath_links, xpath_nadpis, xpath_clanek, xpath_datum, xpath_uvodni_odstavec, xpath_autor`;

export async function listSites() {
  const res = await pool.query(`SELECT ${COLUMNS} FROM stranka ORDER BY id_stranka`);
  return res.rows;
}

export async function getSite(id: number) {
  const res = await pool.query(`SELECT ${COLUMNS} FROM stranka WHERE id_stranka = $1`, [id]);
  return res.rows[0] ?? null;
}

export async function createSite(s: SiteInput) {
  const res = await pool.query(
    `INSERT INTO stranka
       (jmeno, link, xpath_links, xpath_nadpis, xpath_clanek, xpath_datum, xpath_uvodni_odstavec, xpath_autor, enabled)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     RETURNING ${COLUMNS}`,
    [s.jmeno, s.link, s.xpath_links, s.xpath_nadpis, s.xpath_clanek, s.xpath_datum, s.xpath_uvodni_odstavec, s.xpath_autor, s.enabled],
  );
  return res.rows[0];
}

export async function updateSite(id: number, s: SiteInput) {
  const res = await pool.query(
    `UPDATE stranka SET
       jmeno=$2, link=$3, xpath_links=$4, xpath_nadpis=$5, xpath_clanek=$6,
       xpath_datum=$7, xpath_uvodni_odstavec=$8, xpath_autor=$9, enabled=$10
     WHERE id_stranka=$1
     RETURNING ${COLUMNS}`,
    [id, s.jmeno, s.link, s.xpath_links, s.xpath_nadpis, s.xpath_clanek, s.xpath_datum, s.xpath_uvodni_odstavec, s.xpath_autor, s.enabled],
  );
  return res.rows[0] ?? null;
}

export async function setSiteEnabled(id: number, enabled: boolean) {
  const res = await pool.query(
    `UPDATE stranka SET enabled=$2 WHERE id_stranka=$1 RETURNING ${COLUMNS}`,
    [id, enabled],
  );
  return res.rows[0] ?? null;
}

export async function deleteSite(id: number): Promise<boolean> {
  const res = await pool.query("DELETE FROM stranka WHERE id_stranka = $1", [id]);
  return (res.rowCount ?? 0) > 0;
}
