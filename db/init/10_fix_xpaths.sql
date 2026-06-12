-- Re-verified all source XPaths against the live sites on 2026-06-12; two needed
-- fixing. Idempotent UPDATEs keyed by jmeno so a fresh init and a running DB
-- both converge to the same state.

-- nature.com: the publication-date anchor was redesigned away
-- (//a[@data-track-action="publication date"]/time no longer exists), leaving
-- datum empty. The clean ISO date now lives on the first <time datetime>.
UPDATE public.stranka
SET xpath_datum = '(//time/@datetime)[1]'
WHERE jmeno = 'nature.com';

-- vtm: relaunched on the zive.cz template — the old ar-* classes are gone, so
-- both the link list and every article field broke. New selectors are
-- meta-based (article:published_time / meta author) and therefore stable.
UPDATE public.stranka SET
    xpath_links            = '//h2/a[contains(@href,"/clanky/")]/@href',
    xpath_nadpis           = 'normalize-space(//h1)',
    xpath_clanek           = '//div[contains(@class,"article__content-wrapper")]/node()',
    xpath_datum            = '//meta[@property="article:published_time"]/@content',
    xpath_uvodni_odstavec  = NULL,
    xpath_autor            = '//meta[@name="author"]/@content'
WHERE jmeno = 'vtm';
