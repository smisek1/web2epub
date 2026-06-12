"""CLI entry point for the XPath tester (POST /api/xpath/test). Fetches a URL,
applies the supplied XPaths and prints the results as JSON. Stores nothing."""
import argparse
import json
import sys

import requests
from scrapy.selector import Selector

# Keep in sync with get_html.py — descriptive bot UA required by phys.org (#28).
USER_AGENT = "Mozilla/5.0 (compatible; web2epub/1.0; +https://github.com/smisek1/web2epub)"


def _extract(sel, xpath):
    if not xpath:
        return None
    return "".join(sel.xpath(xpath).extract())


def main():
    parser = argparse.ArgumentParser(description="Test XPath selectors against a URL.")
    parser.add_argument("--url", required=True)
    parser.add_argument("--xpath-links", default=None)
    parser.add_argument("--xpath-nadpis", default=None)
    parser.add_argument("--xpath-clanek", default=None)
    parser.add_argument("--xpath-datum", default=None)
    parser.add_argument("--xpath-uvodni-odstavec", default=None)
    parser.add_argument("--xpath-autor", default=None)
    parser.add_argument("--xpath-next-prehled", default=None)
    parser.add_argument("--xpath-next-clanek", default=None)
    args = parser.parse_args()

    try:
        resp = requests.get(args.url, headers={"user-agent": USER_AGENT}, timeout=30)
        sel = Selector(text=resp.content)
    except Exception as exc:
        print(json.dumps({"error": "fetch failed: %s" % exc}), file=sys.stderr)
        sys.exit(1)

    result = {"errors": {}}
    fields = {
        "links": args.xpath_links,
        "nadpis": args.xpath_nadpis,
        "clanek": args.xpath_clanek,
        "datum": args.xpath_datum,
        "uvodni_odstavec": args.xpath_uvodni_odstavec,
        "autor": args.xpath_autor,
        "next_prehled": args.xpath_next_prehled,
        "next_clanek": args.xpath_next_clanek,
    }
    for name, xpath in fields.items():
        if not xpath:
            continue
        try:
            if name == "links":
                result["links"] = sel.xpath(xpath).extract()
            elif name == "clanek":
                # Truncate body so the response stays small.
                body = _extract(sel, xpath)
                result["clanek"] = body[:2000] if body else body
            else:
                result[name] = _extract(sel, xpath)
        except Exception as exc:
            result["errors"][name] = str(exc)

    print(json.dumps(result, ensure_ascii=False))


if __name__ == "__main__":
    main()
