-- Dedup hardening (review 2026-06-11).

-- An article URL may be stored only once per source. The scraper relies on
-- ON CONFLICT DO NOTHING against this index, so reordered overview pages or
-- two scrapes running at once can no longer create duplicate articles.
CREATE UNIQUE INDEX IF NOT EXISTS clanky_stranka_posledni_uniq
    ON public.clanky (id_stranka, posledni);

-- An article can be in a given book (or the trash) only once; repeated
-- "trash" clicks must not multiply rows.
CREATE UNIQUE INDEX IF NOT EXISTS kniha_clanek_clanek_kniha_uniq
    ON public.kniha_clanek (id_clanky, id_kniha);

-- The trash book is looked up by name, so there must be exactly one of it.
-- Regular books keep non-unique names (two books a day from the same sites).
CREATE UNIQUE INDEX IF NOT EXISTS kniha_trash_jmeno_uniq
    ON public.kniha (jmeno) WHERE jmeno = 'nechci cist';
