-- #33: special source for articles fetched from an arbitrary URL (generic
-- extraction, no XPath config). Disabled so the cron scraper skips it;
-- articles are inserted by scripts/fetch_url_cli.py.
INSERT INTO public.stranka (jmeno, link, enabled)
SELECT 'ad-hoc', '', false
WHERE NOT EXISTS (SELECT 1 FROM public.stranka WHERE jmeno = 'ad-hoc');
