from lxml import html
import requests
from lxml import etree

page = requests.get('http://www.osel.cz/10252-detekce-gravitacnich-vln-od-nejtezsi-cerne-diry.html')
tree = html.fromstring(page.content)
#This will create a list of buyers:
buyers = tree.xpath('//div[@id="clanek_detail_obal"]')
print(str(buyers))
# print (etree.tostring(buyers[0], pretty_print=True))
#This will create a list of prices
# prices = tree.xpath('//span[@class="item-price"]/text()')


# result = requests.get("http://www.osel.cz/10252-detekce-gravitacnich-vln-od-nejtezsi-cerne-diry.html")
# c = result.content
# soup = BeautifulSoup(c,"html5lib")
# clanky=soup.find('div', {'class': 'nadpis_clanku'})
# clanky=soup.find_element_by_xpath('//div[@class="nadpis_clanku"]')
# # clanky=soup.find_element_by_xpath("//div[contains(@class, 'nadpis_clanku')]")
# print(clanky)