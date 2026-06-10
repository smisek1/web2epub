"""CLI entry point for scraping. Run by cron and by the Node API (POST /api/scrape).

Scrapes all enabled sources. Optional --site-id scrapes a single source (debugging)."""
import argparse
import logging
import sys

import database
import get_html


def main():
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
    parser = argparse.ArgumentParser(description="Scrape articles into the database.")
    parser.add_argument("--site-id", type=int, default=None, help="scrape only this source id")
    args = parser.parse_args()

    if args.site_id is None:
        get_html.main_throuhgh_sites()
    else:
        sites = [s for s in database.select_sites().sites if s[0] == args.site_id]
        if not sites:
            logging.error("source id %s not found or not enabled", args.site_id)
            sys.exit(1)
        for site in sites:
            try:
                get_html.get_links(site)
            except Exception:
                logging.exception("scrape failed for source id=%s", args.site_id)
                sys.exit(1)


if __name__ == "__main__":
    main()
