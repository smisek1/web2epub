insert into kniha (id_kniha,jmeno) values (21,'nechci cist');
	insert into stranka (id_stranka,jmeno) values (10,'nature.com')

		update stranka set xpath_links = '//h3[@itemprop="name headline"]/a/@href' ,
		xpath_links = '//h3[@itemprop="name headline"]/a/@href',
	xpath_nadpis = '//h1[@class="c-article-title"]/text()',
	xpath_clanek = '//div[@class="c-article-body"]/node()',
	xpath_datum = '//a[@data-track-action="publication date"]/time/text()',
	xpath_autor = '(//a[@data-test="author-name"]/text())[1]',
	link = 'https://www.nature.com/npjqi/articles'
	where id_stranka = 10;
