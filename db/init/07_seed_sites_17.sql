-- #17: new sources added 2026-06-12 (configs verified against the live sites).
-- Idempotent: skips rows that already exist (e.g. DB restored from a backup).

INSERT INTO public.stranka (jmeno, link, xpath_links, xpath_nadpis, xpath_clanek, xpath_datum, xpath_autor, enabled)
SELECT 'thequantuminsider',
       'https://thequantuminsider.com/category/daily/business/',
       '//div[contains(@class,"elementor-post__text")]//a/@href',
       '//h1/text()',
       '//div[contains(@class,"elementor-widget-theme-post-content")]//div[contains(@class,"elementor-widget-container")]/node()',
       '//meta[@property="article:published_time"]/@content',
       'normalize-space((//a[contains(@href,"/author/")])[1])',
       true
WHERE NOT EXISTS (SELECT 1 FROM public.stranka WHERE jmeno = 'thequantuminsider');

INSERT INTO public.stranka (jmeno, link, xpath_links, xpath_nadpis, xpath_clanek, xpath_datum, enabled)
SELECT 'physicsworld',
       'https://physicsworld.com/c/quantum/',
       '//article//h3/a/@href',
       '//h1//text()',
       '//div[contains(@class,"entry-content")]/node()',
       '//meta[@property="article:published_time"]/@content',
       true
WHERE NOT EXISTS (SELECT 1 FROM public.stranka WHERE jmeno = 'physicsworld');

INSERT INTO public.stranka (jmeno, link, xpath_links, xpath_nadpis, xpath_clanek, xpath_datum, xpath_autor, enabled)
SELECT 'quantumzeitgeist',
       'https://quantumzeitgeist.com/',
       '//h3[contains(@class,"entry-title")]/a/@href',
       '//h1/text()',
       '//div[contains(@class,"entry-content")]/node()',
       '//meta[@property="article:published_time"]/@content',
       'normalize-space((//span[contains(@class,"author")])[1])',
       true
WHERE NOT EXISTS (SELECT 1 FROM public.stranka WHERE jmeno = 'quantumzeitgeist');

-- Sciencemag: seeded disabled, but its XPaths still work (verified) — turn it on.
UPDATE public.stranka SET enabled = true WHERE jmeno = 'Sciencemag';
