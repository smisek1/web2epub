"""CLI entry point for on-demand EPUB generation. Called by the Node API as a
subprocess: builds the book from the DB and writes it to --out, then prints a
JSON line {"path", "filename"} on stdout."""
import argparse
import json
import sys

import database
import create_book


def main():
    parser = argparse.ArgumentParser(description="Generate an EPUB for a book id.")
    parser.add_argument("--book-id", type=int, required=True)
    parser.add_argument("--out", required=True, help="full output path for the .epub file")
    args = parser.parse_args()

    jmeno = database.select_kniha(args.book_id).jmeno
    if jmeno is None:
        print(json.dumps({"error": "book not found", "book_id": args.book_id}), file=sys.stderr)
        sys.exit(1)

    book = create_book.create_book(jmeno)
    rows = database.select_clanky_pro_epub(args.book_id).clanky
    for b in rows:
        # b = (id_stranka, nadpis, clanek, datum, uvodni_odstavec, jmeno_stranka, autor)
        book.add_kap(b[2], b[1], b[3], b[4], b[5], b[6])
    book.write_knihu(args.out)

    print(json.dumps({"path": args.out, "filename": jmeno + ".epub"}))


if __name__ == "__main__":
    main()
