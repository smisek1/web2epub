-- #31: pagination support.
-- xpath_next_prehled — XPath of the "next page" link on the overview page; the
--   scraper keeps turning pages until it reaches the newest stored article.
-- xpath_next_clanek — XPath of the "next page" link inside a multi-page
--   article; the pages are fetched and concatenated into one body.
-- max_stranek — max overview pages to process (0 = no limit; stop at the
--   dedup anchor or the end of the listing).
ALTER TABLE public.stranka ADD COLUMN IF NOT EXISTS xpath_next_prehled text;
ALTER TABLE public.stranka ADD COLUMN IF NOT EXISTS xpath_next_clanek text;
ALTER TABLE public.stranka ADD COLUMN IF NOT EXISTS max_stranek integer NOT NULL DEFAULT 0;

-- phys.org paginates its tag overview (»-link); cap at 3 pages per run.
UPDATE public.stranka
SET xpath_next_prehled = '//a[contains(@class,"page-link")][contains(.,"»")]/@href',
    max_stranek = 3
WHERE jmeno = 'phys.org';
