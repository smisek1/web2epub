-- quantumtech.blog: the overview URL returns 404 (checked 2026-06-12), so the
-- scraper must skip it. Previously disabled only in the running DB; keep the
-- fresh-init state in sync (see docs/issues-triage.md).
UPDATE public.stranka SET enabled = false WHERE jmeno = 'quantumtech.blog';
