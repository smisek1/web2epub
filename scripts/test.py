import database
import create_book
import sys
import os
import get_html
from scrapy.selector import Selector

#from bs4 import BeautifulSoup
import requests
import dateparser

# # # # # # # # # # # # # # # # 
# testing ziskavani linku
# stranka = "https://quantumtech.blog/blog/"
# result = requests.get(stranka)
# c = result.content 
# soup= Selector(text = c )
# samples=soup.xpath('//h2[@class="entry-title"]/a/@href')
# for a in samples:
#     # print (site[2])
#     # print(a.extract())
#     puresite = (stranka.split('//', 1))[0]+'//'+(stranka.split('//', 1))[1].split('/', 1)[0]
#     # print (puresite)
#     if puresite not in a.extract():
#         onesite = puresite + a.extract()
#     else:
#         onesite = a.extract()
#     print (onesite)
# # # # # # # # # # # # # # # # 
# testing ziskavani dat
# def replace_img_base64(html,site):
#     sel=Selector(text = html )
#     imgs = sel.css('img::attr(src)').extract()
#     for img in imgs:
#         puresite = (site[2].split('//', 1))[0]+'//'+(site[2].split('//', 1))[1].split('/', 1)[0]
#         if img[:4] != 'http':
#             img = puresite + img
#         html = html.replace(str(img),str('data:image/jpg;base64,'+ str(base64.b64encode(requests.get(img).content))[2:-1]))
#     return html

# class get_soup:
#     def __init__(self,link):
#         result = requests.get(link)
#         c = result.content 
#         self.soup= Selector(text = c )
# class get_html(get_soup):
#     '''
#     Z linku vysosa clanek, nadpis...

#     Keyword arguments:
#         link - odkaz na stranku
    
#     Returns:   
#        nadpis
#        clanek
#        datum
#     '''
#     def __init__(self,link,site):
#         super().__init__(link)
#         print(str(link))
#         self.nadpis =self.__get_nadpis(self.soup,site)
#         self.clanek=self.__get_clanek(self.soup,site)
#         self.datum=self.__get_datum(self.soup,site)
#         print (self.datum)
#         self.uvodni_odstavec=self.__uvodni_odstavec(self.soup,site)
#         self.autor=self.__uvodni_autor(self.soup,site)
#     def __get_nadpis(self,soup,site):
#         clanky=self.soup.xpath(site[4]) 
#         # print(str(clanky))
#         joiner = ""
#         return joiner.join(clanky.extract())
#     def __get_clanek(self,soup,site):
#         clanky=soup.xpath(site[5]) 
#         a = clanky.extract()
#         joiner = ""
#         return joiner.join(clanky.extract())
#     def __get_datum(self,soup,site):
#         clanky=soup.xpath(site[6]) 
#         joiner = ""
#         dd = clanky.extract()
#         return dateparser.parse(joiner.join(clanky.extract()))
#     def __uvodni_odstavec(self,soup,site):
#         if site[7] is None:
#             return ""
#         else:
#             clanky=soup.xpath(site[7]) 
#             joiner = ""
#             return joiner.join(clanky.extract())
#     def __uvodni_autor(self,soup,site):
#         if site[7] is None:
#             return ""
#         else:
#             clanky=soup.xpath(site[8]) 
#             joiner = ""
#             return joiner.join(clanky.extract())
# a = get_html('https://quantumtech.blog/2022/01/24/a-quantum-computing-glossary/',
#     (8, 
#     'vtm',
#     'https://quantumtech.blog', 
#     '//div[@class="ar-img"]/a[not(contains(@class,"ga-event-tracker idvert-perex-link"))]/@href', 
#     '//h1[@class="entry-title"]/text()', #nadpis
#     '//div[@class="entry-content"]/node()', #clanek
#     '(//time[contains(@class, "entry-date published")]/text())[1]', # datum
#     '//div[@class="ar-annotation"]/node()', 
#     '(//span[@class="author vcard"]/a/text())[1]')) # autor

# print ('napis: ' + a.nadpis)
# print ('clanek: ' + a.clanek)
# print ( a.datum)
# print ('autor: ' + a.autor)

# # # # # # # # # # # # # # # # 

# result = requests.get("http://www.osel.cz/10204-tatinkovy-vzpominky-zapsane-do-spermii_1.html")
# c = result.content
# a = BeautifulSoup(c,"html5lib")
# print (str(a))
# clanky=a.find('div', {'class': 'nadpis_clanku'})
# print (str(clanky))
############################
a = get_html.main_throuhgh_sites()
################################
#a=database.select_clanky()
# print(a.clanky)

# for b in a.clanky:
#     print(b[1])


# create book
# jmeno_knihy = "pata kniha"
# os.chdir('/home/smich/Documents/temp')
# kniha = create_book.create_book(jmeno_knihy)
# a = database.select_clanky_pro_epub(jmeno_knihy)
# for b in a.clanky:
#     kniha.add_kap(b[2],b[1],b[3],b[4],b[5],b[6])
# kniha.write_knihu(jmeno_knihy)


#update
########55

# linky = database.select_linky_pro_testing()
# links = database.select_sites()
# for site in links.sites:   
#     for b in linky.clanky:
#         html = get_html.get_html (b[0],site)
#         data=database.update_clanek()
#         data.update(site[0],html.nadpis,html.clanek,html.datum,b[0],html.uvodni_odstavec,html.autor)
#         del data
###########
#vloz data
# c = get_html.get_links("https://sciencemag.cz/category/clanky/")

#select stranky
# c= database.select_sites()
# print (c.sites)
# for b in c.sites:
#     print (b[0])



# Select posledni
# a = database.select_posledni(1)
# print (a.sites)
# del a

#*****************************
#TESTOVANI tahacich trid
# *******************************
# a = get_html.get_links_osel (2,"http://www.osel.cz")
# a = get_html.get_html_osel ("http://www.osel.cz/10211-cinske-umele-slunce-prorazilo-hranici-100-milionu-c.html")

# print(a.datum)
# print(a.nadpis)
# a = get_html.get_html_osel ("http://www.osel.cz/10204-tatinkovy-vzpominky-zapsane-do-spermii_1.html")
# print(a.nadpis)

# print(a.clanek)
