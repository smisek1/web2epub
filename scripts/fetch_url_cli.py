"""CLI for POST /api/articles/from-url (#33): fetch an arbitrary URL, extract
the article generically via trafilatura (no XPath config), inline images and
store it under the special 'ad-hoc' source. Prints JSON to stdout — either
{"id", "nadpis", "autor", "datum"} or {"error"} (always exit 0 so the caller
gets the JSON; only unexpected crashes exit non-zero)."""
import argparse
import json
import logging
import re
import sys

import dateparser
import requests
import trafilatura

import database
from get_html import USER_AGENT, replace_img_base64


def main():
    # Logs go to stderr; stdout must stay pure JSON for the Node API.
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s: %(message)s",
        stream=sys.stderr,
    )
    parser = argparse.ArgumentParser(description="Store one article from an arbitrary URL.")
    parser.add_argument("--url", required=True)
    args = parser.parse_args()

    try:
        resp = requests.get(args.url, headers={"user-agent": USER_AGENT}, timeout=30)
        resp.raise_for_status()
    except Exception as exc:
        print(json.dumps({"error": "stažení selhalo: %s" % exc}, ensure_ascii=False))
        return

    body = trafilatura.extract(resp.text, output_format="html", include_images=True, url=args.url)
    if not body:
        print(json.dumps({"error": "na stránce se nepodařilo najít článek"}, ensure_ascii=False))
        return
    # The body is embedded into an EPUB chapter later — strip the outer
    # <html><body> wrapper trafilatura produces.
    body = re.sub(r"^\s*<html>\s*<body>\s*|\s*</body>\s*</html>\s*$", "", body)

    meta = trafilatura.extract_metadata(resp.text)
    nadpis = (meta.title or args.url).strip()
    autor = (meta.author or "").strip()
    datum = dateparser.parse(meta.date) if meta.date else None

    site_id = database.select_stranka_id("ad-hoc").id
    if site_id is None:
        print(json.dumps({"error": "zdroj 'ad-hoc' v tabulce stranka chybí"}, ensure_ascii=False))
        return

    # Site-tuple stand-in: replace_img_base64 only uses index 2 (base URL).
    body = replace_img_base64(body, (site_id, "ad-hoc", args.url))

    data = database.insert_clanek()
    data.insert(site_id, nadpis, body, datum, args.url, "", autor)
    del data
    # Re-submitting the same URL is a no-op (ON CONFLICT) — return the existing id.
    clanek_id = database.select_clanek_id(site_id, args.url).id

    print(json.dumps(
        {"id": clanek_id, "nadpis": nadpis, "autor": autor,
         "datum": datum.strftime("%Y-%m-%d") if datum else None},
        ensure_ascii=False,
    ))


if __name__ == "__main__":
    main()
