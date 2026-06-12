"""Database access for the Python workers (scraper + EPUB generator).

Connection comes from config.get_connection() (env-based). All queries are
parametrised. The former Flask/book-management queries were removed: those are
now owned by the Node.js API, which talks to the same tables directly.

Style kept from the original: one class per query, connection per operation
(opened in __init__, closed in __del__)."""
import logging

import config

log = logging.getLogger(__name__)


class conn_string:
    """Opens a connection on init, closes it on delete."""

    def __init__(self):
        self.conn = config.get_connection()
        log.debug("db connection opened")

    def __del__(self):
        try:
            self.conn.close()
            log.debug("db connection closed")
        except Exception:
            pass


# *********************************************************
# Scraper queries (used by get_html.py / scrape_cli.py)
# *********************************************************
class insert_clanek(conn_string):
    """Insert one scraped article."""

    def __init__(self):
        super().__init__()

    def insert(self, stranka, nadpis, clanek, datum, posledni, uvodni_odstavec, autor):
        cursor = self.conn.cursor()
        cursor.execute(
            "INSERT INTO clanky (id_stranka, nadpis, clanek, datum, posledni, uvodni_odstavec, autor) "
            "VALUES (%s, %s, %s, %s, %s, %s, %s) "
            # Dedup safety net: the same URL stored twice for one source is a no-op
            # (overview pages get reordered; two scrapes may run concurrently).
            "ON CONFLICT (id_stranka, posledni) DO NOTHING;",
            (str(stranka), nadpis, clanek, datum, posledni, uvodni_odstavec, autor),
        )
        self.conn.commit()


class select_sites(conn_string):
    """All enabled sources to scrape. No hardcoded ids — driven by stranka.enabled."""

    def __init__(self):
        super().__init__()
        self.sites = self.select()

    def select(self):
        cursor = self.conn.cursor()
        cursor.execute(
            "SELECT id_stranka, jmeno, link, xpath_links, xpath_nadpis, xpath_clanek, "
            "xpath_datum, xpath_uvodni_odstavec, xpath_autor, "
            "xpath_next_prehled, xpath_next_clanek, max_stranek "
            "FROM stranka WHERE enabled = true ORDER BY id_stranka;"
        )
        return list(cursor.fetchall())


class select_posledni(conn_string):
    """URL (posledni) of the newest stored article for a source — the dedup marker."""

    def __init__(self, id_stranka):
        super().__init__()
        self.sites = self.select(id_stranka)

    def select(self, id_stranka):
        cursor = self.conn.cursor()
        cursor.execute(
            "SELECT posledni FROM clanky "
            "WHERE id_clanky = (SELECT max(id_clanky) FROM clanky WHERE id_stranka = %s) "
            "LIMIT 1;",
            (id_stranka,),
        )
        output = cursor.fetchone()
        return "nic" if output is None else output[0]


class select_stranka_id(conn_string):
    """id_stranka for a source name (fetch_url_cli looks up the 'ad-hoc' source)."""

    def __init__(self, jmeno):
        super().__init__()
        cursor = self.conn.cursor()
        cursor.execute("SELECT id_stranka FROM stranka WHERE jmeno = %s;", (jmeno,))
        row = cursor.fetchone()
        self.id = row[0] if row else None


class select_clanek_id(conn_string):
    """id of the article with the given source + URL (the dedup key)."""

    def __init__(self, id_stranka, posledni):
        super().__init__()
        cursor = self.conn.cursor()
        cursor.execute(
            "SELECT id_clanky FROM clanky WHERE id_stranka = %s AND posledni = %s;",
            (id_stranka, posledni),
        )
        row = cursor.fetchone()
        self.id = row[0] if row else None


# *********************************************************
# EPUB queries (used by epub_cli.py / create_book.py)
# *********************************************************
class select_kniha(conn_string):
    """Book name for a given id (used for the EPUB title / filename)."""

    def __init__(self, id_kniha):
        super().__init__()
        self.jmeno = self.select(id_kniha)

    def select(self, id_kniha):
        cursor = self.conn.cursor()
        cursor.execute("SELECT jmeno FROM kniha WHERE id_kniha = %s;", (id_kniha,))
        row = cursor.fetchone()
        return row[0] if row else None


class select_clanky_pro_epub(conn_string):
    """Articles of a book, ordered by date, for EPUB generation.

    Selected by id_kniha (parametrised) instead of the old string-formatted name."""

    def __init__(self, id_kniha):
        super().__init__()
        self.clanky = self.select(id_kniha)

    def select(self, id_kniha):
        cursor = self.conn.cursor()
        cursor.execute(
            "SELECT clanky.id_stranka, nadpis, clanek, datum, uvodni_odstavec, stranka.jmeno, autor "
            "FROM clanky "
            "JOIN kniha_clanek ON kniha_clanek.id_clanky = clanky.id_clanky "
            "JOIN stranka ON stranka.id_stranka = clanky.id_stranka "
            "WHERE kniha_clanek.id_kniha = %s "
            "ORDER BY datum;",
            (id_kniha,),
        )
        return cursor.fetchall()
