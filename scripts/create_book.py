"""Builds an EPUB from articles via EbookLib. Base64 data-URI images embedded in
the article HTML are decoded back to binary and added as separate EPUB items."""
import base64

from lxml import etree
from lxml import html as lxml_html
from scrapy.selector import Selector
from ebooklib import epub


def strip_links(html_text):
    """Unwrap <a> tags (keep text/images) — links are dead weight in an
    e-reader (#14). Also drops srcset/sizes left over in legacy articles."""
    if not html_text:
        return html_text
    try:
        root = lxml_html.fragment_fromstring(html_text, create_parent="div")
    except Exception:
        return html_text  # malformed HTML must not abort the book
    etree.strip_tags(root, "a")
    etree.strip_attributes(root, "srcset", "sizes")
    parts = [root.text or ""]
    parts += [etree.tostring(child, encoding="unicode") for child in root]
    return "".join(parts)


class create_book:
    def __init__(self, jmeno_knihy):
        self.book = epub.EpubBook()
        self.book.set_identifier("id123456")
        self.book.set_title(jmeno_knihy)
        self.book.set_language("cs")
        self.book.add_author("Tomas Smisek")
        self.book.add_item(epub.EpubNcx())
        self.book.add_item(epub.EpubNav())
        style = "BODY {color: white;}"
        nav_css = epub.EpubItem(uid="style_nav", file_name="style/nav.css", media_type="text/css", content=style)
        self.book.add_item(nav_css)
        self.citac = 0
        self.book.spine = ["nav"]

    def add_kap(self, clanek, nadpis, datum, uvodni_odstavec, stranka, autor):
        self.citac = self.citac + 1
        c1 = epub.EpubHtml(title=nadpis, file_name="chap_%03d.xhtml" % self.citac, lang="cs")
        clanek = self.__replace_base64_img(strip_links(clanek))
        c1.content = (
            u"<h3>" + nadpis + " (" + stranka + ")</h3><p>" + str(autor) + "</p><p>"
            + str(datum) + "</p><p>" + str(uvodni_odstavec) + "</p><p>" + clanek + "</p>"
        )
        self.book.add_item(c1)
        if len(self.book.toc) == 0:
            self.book.toc = (c1,)
        else:
            self.book.toc = self.book.toc + (c1,)
        self.book.spine = self.book.spine + [c1]

    def write_knihu(self, out_path):
        """Write the EPUB to the exact path given (caller supplies the full path)."""
        epub.write_epub(str(out_path), self.book, {})

    def __replace_base64_img(self, html):
        sel = Selector(text=html)
        imgs = sel.css("img::attr(src)").extract()
        for idx, img in enumerate(imgs):
            # Only embed real base64 data URIs (any image type). Plain URLs — e.g.
            # images whose inlining failed during scraping — are left untouched.
            if ";base64," not in img:
                continue
            header, base64_part = img.split(";base64,", 1)
            try:
                image_bits = base64.decodebytes(base64_part.encode("ascii"))
            except Exception:
                # Malformed/truncated base64 must not abort the whole book.
                continue
            # Real media type from the data URI (e.g. "data:image/png");
            # fall back to jpeg for legacy articles with the old fixed prefix.
            mime = header[5:] if header.startswith("data:image/") else "image/jpeg"
            if mime == "image/jpg":  # legacy articles used this invalid MIME
                mime = "image/jpeg"
            ext = {"image/jpeg": "jpg", "image/png": "png", "image/gif": "gif",
                   "image/webp": "webp", "image/svg+xml": "svg"}.get(mime, "jpg")
            # Zero-padded, chapter+index unique name — no 99-image ceiling (#15).
            soubor = "img_%03d_%03d.%s" % (self.citac, idx, ext)
            epub_last_image = epub.EpubItem(file_name=soubor, content=image_bits, media_type=mime)
            html = html.replace(img, soubor)
            self.book.add_item(epub_last_image)
        return html
