"""Scraper: reads source configs from the DB, fetches overview pages, extracts
article links via XPath, and stores new articles (images inlined as base64)."""
import base64
import logging
import re
from urllib.parse import urljoin

import requests
from scrapy.selector import Selector

import database

log = logging.getLogger(__name__)

# Descriptive bot UA: phys.org (and others) return 403 unless the bot identifies itself (#28).
USER_AGENT = "Mozilla/5.0 (compatible; web2epub/1.0; +https://github.com/smisek1/web2epub)"

# Safety caps for pagination (#31) — a broken next-page XPath or a circular
# link must never keep the scraper running forever.
HARD_MAX_LIST_PAGES = 200
MAX_ARTICLE_PAGES = 30


def fetch_selector(link):
    """Fetch a URL and wrap it in a Selector (same fetch as get_soup)."""
    result = requests.get(link, headers={"user-agent": USER_AGENT}, timeout=30)
    return Selector(text=result.content)


def absolute_url(url, base):
    """Resolve any relative URL (absolute, root- or dir-relative, scheme-
    relative) against the page it was found on."""
    return urljoin(base, url)


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
    # Drop srcset/sizes: the src URL repeats inside srcset, so the plain
    # string replace below would duplicate the base64 payload (#18).
    html = re.sub(r'\s(?:srcset|sizes)="[^"]*"', "", html)
    sel = Selector(text=html)
    imgs = sel.css("img::attr(src)").extract()
    scheme = site[2].split("//", 1)[0]  # e.g. "https:"
    puresite = scheme + "//" + site[2].split("//", 1)[1].split("/", 1)[0]
    for img in imgs:
        src = img
        if src.startswith("data:"):
            continue  # already inlined
        if src.startswith("//"):
            src = scheme + src  # protocol-relative URL
        elif not src.startswith("http"):
            src = puresite + src  # site-relative path
        try:
            resp = requests.get(src, headers={"user-agent": USER_AGENT}, timeout=30)
            resp.raise_for_status()
            mime = resp.headers.get("content-type", "").split(";")[0].strip()
            if not mime.startswith("image/"):
                mime = "image/jpeg"
            encoded = base64.b64encode(resp.content).decode("ascii")
            data_uri = "data:%s;base64,%s" % (mime, encoded)
            # Replace only src attributes — the same URL may also appear in
            # an <a href> (WordPress links thumbnails to full-size images).
            anchored = 'src="%s"' % img
            if anchored in html:
                html = html.replace(anchored, 'src="%s"' % data_uri)
            else:
                html = html.replace(str(img), data_uri)
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
        self.link = link
        self.nadpis = self.__get_nadpis(self.soup, site)
        self.clanek = self.__get_clanek(self.soup, site)
        self.datum = self.__get_datum(self.soup, site)
        self.uvodni_odstavec = self.__uvodni_odstavec(self.soup, site)
        self.autor = self.__uvodni_autor(self.soup, site)

    def __get_nadpis(self, soup, site):
        clanky = self.soup.xpath(site[4])
        return "".join(clanky.extract())

    def __get_clanek(self, soup, site):
        parts = ["".join(soup.xpath(site[5]).extract())]
        # Multi-page article (#31): follow xpath_next_clanek and concatenate
        # the body of every page.
        xpath_next = site[10]
        if xpath_next:
            aktualni = self.link  # URL of the article page being processed
            visited = {aktualni}
            cur = soup
            while len(parts) < MAX_ARTICLE_PAGES:
                dalsi = cur.xpath(xpath_next).extract_first()
                if not dalsi:
                    break  # last page of the article
                dalsi = absolute_url(dalsi, aktualni)
                if dalsi in visited:
                    break  # cycle protection
                visited.add(dalsi)
                log.info("article page %d: %s", len(parts) + 1, dalsi)
                cur = fetch_selector(dalsi)
                aktualni = dalsi
                parts.append("".join(cur.xpath(site[5]).extract()))
        return replace_img_base64("".join(parts), site)

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
    """Extract article links from a source's overview page(s) and store new
    ones. With xpath_next_prehled set, the scraper keeps turning overview
    pages until it reaches the newest stored article, the end of the listing,
    or max_stranek pages (0 = no limit) (#31)."""

    def __init__(self, site):
        super().__init__(site[2])
        self.linky = self.__get_linky(self.soup, site)
        self.__get_vse(self.linky, site)

    def __get_linky(self, soup, site):
        odkaz = []
        self.posledni = database.select_posledni(site[0])
        xpath_next = site[9]
        max_stranek = site[11] or 0  # total overview pages, 0 = unlimited
        aktualni = site[2]  # URL of the overview page being processed
        visited = {aktualni}
        stranka = 1
        while True:
            for a in soup.xpath(site[3]):
                onesite = absolute_url(a.extract(), aktualni)
                # Stop once we reach the last already-stored article.
                if self.posledni.sites == onesite:
                    return remove_duplicates(odkaz)
                odkaz.append(onesite)
            if not xpath_next:
                break
            if max_stranek and stranka >= max_stranek:
                break
            if stranka >= HARD_MAX_LIST_PAGES:
                log.warning("pagination hit the hard cap (%d pages): %s", stranka, site[2])
                break
            dalsi = soup.xpath(xpath_next).extract_first()
            if not dalsi:
                break  # no next link — end of the listing
            dalsi = absolute_url(dalsi, aktualni)
            if dalsi in visited:
                break  # cycle protection
            visited.add(dalsi)
            log.info("overview page %d: %s", stranka + 1, dalsi)
            soup = fetch_selector(dalsi)
            aktualni = dalsi
            stranka += 1
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
