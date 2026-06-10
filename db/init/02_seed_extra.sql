-- Extra seed data, cleaned up from the original DB/notread.sql (which had a
-- missing semicolon and a redundant duplicate xpath_links assignment).

-- nature.com source (was added manually via notread.sql).
INSERT INTO public.stranka
    (id_stranka, jmeno, link, xpath_nadpis, xpath_clanek, xpath_links, xpath_datum, xpath_uvodni_odstavec, xpath_autor)
VALUES (
    10,
    'nature.com',
    'https://www.nature.com/npjqi/articles',
    '//h1[@class="c-article-title"]/text()',
    '//div[@class="c-article-body"]/node()',
    '//h3[@itemprop="name headline"]/a/@href',
    '//a[@data-track-action="publication date"]/time/text()',
    NULL,
    '(//a[@data-test="author-name"]/text())[1]'
);

-- Special "trash" book: articles moved here are treated as handled but unwanted.
INSERT INTO public.kniha (id_kniha, jmeno) VALUES (21, 'nechci cist');

-- The dumped stranka sequence was left at 6, which is below the highest seeded
-- id; realign it so new sources get unused ids.
SELECT pg_catalog.setval('public.stranka_id_stranka_seq', (SELECT MAX(id_stranka) FROM public.stranka), true);
