"""Scraper: reads source configs from the DB, fetches overview pages, extracts
article links via XPath, and stores new articles (images inlined as base64)."""
import base64
import logging

import requests
from scrapy.selector import Selector

import database

log = logging.getLogger(__name__)

USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:65.0) Gecko/20100101 Firefox/65.0"


class main_throuhgh_sites:
    """Walk every enabled source and scrape it. One failing source does not
    abort the whole run."""

    def __init__(self):
        links = database.select_sites()
        for site in links.sites:
            try:
                get_links(site)
            except Exception:
                log.exception("scrape of source failed: id=%s jmeno=%s", site[0], site[1])


class get_soup:
    def __init__(self, link):
        headers = {"user-agent": USER_AGENT}
        result = requests.get(link, headers=headers, timeout=30)
        self.soup = Selector(text=result.content)


def remove_duplicates(values):
    output = []
    seen = set()
    for value in values:
        if value not in seen:
            output.append(value)
            seen.add(value)
    return output


def replace_img_base64(html, site):
    sel = Selector(text=html)
    imgs = sel.css("img::attr(src)").extract()
    for img in imgs:
        puresite = (site[2].split("//", 1))[0] + "//" + (site[2].split("//", 1))[1].split("/", 1)[0]
        src = img
        if src[:4] != "http" and src[:4] != "//me":
            src = puresite + src
        try:
            data = requests.get(src, timeout=30).content
            encoded = str(base64.b64encode(data))[2:-1]
            html = html.replace(str(img), "data:image/jpg;base64," + encoded)
        except Exception:
            # A missing/broken image must not kill the whole article.
            log.warning("image download failed, leaving as-is: %s", src)
    return html


# *********************************
# ALL
# *********************************
class get_html(get_soup):
    """Extract title/body/date/intro/author of a single article via XPath."""

    def __init__(self, link, site):
        super().__init__(link)
        log.info("article: %s", link)
        self.nadpis = self.__get_nadpis(self.soup, site)
        self.clanek = self.__get_clanek(self.soup, site)
        self.datum = self.__get_datum(self.soup, site)
        self.uvodni_odstavec = self.__uvodni_odstavec(self.soup, site)
        self.autor = self.__uvodni_autor(self.soup, site)

    def __get_nadpis(self, soup, site):
        clanky = self.soup.xpath(site[4])
        return "".join(clanky.extract())

    def __get_clanek(self, soup, site):
        clanky = soup.xpath(site[5])
        return replace_img_base64("".join(clanky.extract()), site)

    def __get_datum(self, soup, site):
        import dateparser

        clanky = soup.xpath(site[6])
        return dateparser.parse("".join(clanky.extract()))

    def __uvodni_odstavec(self, soup, site):
        if site[7] is None:
            return ""
        clanky = soup.xpath(site[7])
        return "".join(clanky.extract())

    def __uvodni_autor(self, soup, site):
        # Bugfix: was checking site[7] (intro) instead of site[8] (author).
        if site[8] is None:
            return ""
        clanky = soup.xpath(site[8])
        return "".join(clanky.extract())


class get_links(get_soup):
    """Extract article links from a source's overview page and store new ones."""

    def __init__(self, site):
        super().__init__(site[2])
        self.linky = self.__get_linky(self.soup, site)
        self.__get_vse(self.linky, site)

    def __get_linky(self, soup, site):
        odkaz = []
        self.posledni = database.select_posledni(site[0])
        samples = soup.xpath(site[3])
        for a in samples:
            puresite = (site[2].split("//", 1))[0] + "//" + (site[2].split("//", 1))[1].split("/", 1)[0]
            if puresite not in a.extract():
                onesite = puresite + a.extract()
            else:
                onesite = a.extract()
            # Stop once we reach the last already-stored article.
            if self.posledni.sites == onesite:
                return remove_duplicates(odkaz)
            odkaz.append(onesite)
        return remove_duplicates(odkaz)

    def __get_vse(self, linky, site):
        if linky is None:
            return
        for link in reversed(linky):
            try:
                html = get_html(link, site)
                data = database.insert_clanek()
                data.insert(site[0], html.nadpis, html.clanek, html.datum, link, html.uvodni_odstavec, html.autor)
                del data
            except Exception:
                # One bad article (timeout, broken XPath…) must not abort the source.
                log.exception("failed to scrape/store article: %s", link)

    def __del__(self):
        try:
            del self.posledni
        except Exception:
            pass
