import sys
import os
from scrapy.selector import Selector
import base64
sys.path.insert(0, "/tmp/tmp")
from ebooklib import epub
os.chdir('/tmp/tmp')

class create_book():
    def __init__(self,jmeno_knihy):
        self.book = epub.EpubBook()
        self.book.set_identifier('id123456')
        self.book.set_title(jmeno_knihy)
        self.book.set_language('cs')
        self.book.add_author('Tomas Smisek')
        self.book.add_item(epub.EpubNcx())
        self.book.add_item(epub.EpubNav())
        style = 'BODY {color: white;}'
        nav_css = epub.EpubItem(uid="style_nav", file_name="style/nav.css", media_type="text/css", content=style)
        self.book.add_item(nav_css)
        self.citac = 0
        self.book.spine = ['nav']
    def add_kap(self,clanek,nadpis,datum,uvodni_odstavec,stranka,autor):
        self.citac = self.citac + 1
        c1 = epub.EpubHtml(title=nadpis, file_name='chap_'+self.__citac()+'.xhtml', lang='hr')
        clanek =  self.__replace_base64_img(clanek)
        c1.content=u'<h3>'+nadpis+ ' (' + stranka + ')</h3><p>'+str(autor)+'</p><p>'+str(datum)+'</p><p>'+str(uvodni_odstavec)+'</p><p>'+clanek+'</p>'
        self.book.add_item(c1)
        if len(self.book.toc) == 0:
            self.book.toc =  (c1,)
        else:
            self.book.toc=self.book.toc +(c1,)
        self.book.spine = self.book.spine +[c1]
    def write_knihu(self,jmeno_knihy):
        epub.write_epub(str(jmeno_knihy) +'.epub', self.book, {})
    def __citac(self):
        if len(str(self.citac)) == 1:
            return "0" + str(self.citac)
        else:
            return str(self.citac)
    def __replace_base64_img(self,html):
        sel=Selector(text = html )
        imgs = sel.css('img::attr(src)').extract()
        for idx,img in enumerate(imgs):
            base64_img = img.replace('data:image/jpg;base64,','').encode("ascii")
            image_bits = base64.decodebytes(base64_img)
            if len(str(idx)) == 1:
                sIdx= "0" + str(idx)
            else:
                sIdx= str(idx)
            soubor = str(self.citac) + str(sIdx) +'.jpg'
            epub_last_image = epub.EpubItem(file_name=soubor, content=image_bits)
            html = html.replace(img,soubor)
            self.book.add_item(epub_last_image)
        return html
