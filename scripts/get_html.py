#from bs4 import BeautifulSoup
import requests
import database
from scrapy.selector import Selector
import base64
import dateparser

class main_throuhgh_sites:
    '''
    Prochazi vsechny moje stranky a vola adekvatni procedury

    Keyword arguments:
        nothing

    Returns:
        nothing
    '''
    def __init__(self):
        links = database.select_sites()
        for site in links.sites:
            get_links(site)
            # if site[1] == "Sciencemag":
            #     get_links_sciencemag(site[0],site[2])
            # if site[1] == "osel":
            #     get_links_osel(site[0],site[2])


class get_soup:
    def __init__(self,link):
        USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:65.0) Gecko/20100101 Firefox/65.0"
        headers = {"user-agent": USER_AGENT}
        result = requests.get(link,headers=headers)
        c = result.content
        self.soup= Selector(text = c )
        # self.soup = BeautifulSoup(c,"html5lib")
        # print(str(self.soup))


def remove_duplicates(values):
    output = []
    seen = set()
    for value in values:
        if value not in seen:
            output.append(value)
            seen.add(value)
    return output

def replace_img_base64(html,site):
    sel=Selector(text = html )
    imgs = sel.css('img::attr(src)').extract()
    for img in imgs:
        puresite = (site[2].split('//', 1))[0]+'//'+(site[2].split('//', 1))[1].split('/', 1)[0]
        if img[:4] != 'http' and img[:4] !='//me':
            img = puresite + img
        html = html.replace(str(img),str('data:image/jpg;base64,'+ str(base64.b64encode(requests.get(img).content))[2:-1]))
    return html

#*********************************
#ALL
#*********************************
class get_html(get_soup):
    '''
    Z linku vysosa clanek, nadpis...

    Keyword arguments:
        link - odkaz na stranku

    Returns:
       nadpis
       clanek
       datum
    '''
    def __init__(self,link,site):
        super().__init__(link)
        print(str(link))
        self.nadpis =self.__get_nadpis(self.soup,site)
        self.clanek=self.__get_clanek(self.soup,site)
        self.datum=self.__get_datum(self.soup,site)
        print (self.datum)
        self.uvodni_odstavec=self.__uvodni_odstavec(self.soup,site)
        self.autor=self.__uvodni_autor(self.soup,site)
    def __get_nadpis(self,soup,site):
        clanky=self.soup.xpath(site[4])
        # print(str(clanky))
        joiner = ""
        return joiner.join(clanky.extract())
    def __get_clanek(self,soup,site):
        clanky=soup.xpath(site[5])
        a = clanky.extract()
        joiner = ""
        return replace_img_base64(joiner.join(clanky.extract()),site)
    def __get_datum(self,soup,site):
        clanky=soup.xpath(site[6])
        joiner = ""
        return dateparser.parse(joiner.join(clanky.extract()))
    def __uvodni_odstavec(self,soup,site):
        if site[7] is None:
            return ""
        else:
            clanky=soup.xpath(site[7])
            joiner = ""
            return joiner.join(clanky.extract())
    def __uvodni_autor(self,soup,site):
        if site[7] is None:
            return ""
        else:
            clanky=soup.xpath(site[8])
            joiner = ""
            return joiner.join(clanky.extract())
class get_links(get_soup):
    '''
    Vysosa ze stranky seznam linku a pak to ulozi do databaze

    Keyword arguments:
        link - odkaz na stranku
        id_stranka - Id stranky ze seznamu vsech webu ze kterych taham data

    Returns:
       Vklada do databaze
    '''
    def __init__(self,site):
        super().__init__(site[2])
        self.linky=self.__get_linky(self.soup,site)
        self.__get_vse(self.linky,site)
    def __get_linky(self,soup,site):
        odkaz=[]
        self.posledni =  database.select_posledni(site[0])
        samples=soup.xpath(site[3])
        for a in samples:
            # print (site[2])
            # print(a.extract())
            puresite = (site[2].split('//', 1))[0]+'//'+(site[2].split('//', 1))[1].split('/', 1)[0]
            # print (puresite)
            if puresite not in a.extract():
                onesite = puresite + a.extract()
            else:
                onesite = a.extract()
            # print (onesite)
            if self.posledni.sites == onesite:
                return remove_duplicates(odkaz)
            odkaz.append(onesite)
        return remove_duplicates(odkaz)
    def __get_vse(self,linky,site):
        if linky is not None:
            for link in reversed(linky):
                # if site[2] not in link:
                #     link = site[2] + link
                html =get_html(link,site)
                data=database.insert_clanek()
                data.insert(site[0],html.nadpis,html.clanek,html.datum,link,html.uvodni_odstavec,html.autor)
                del data
    def __del__(self):
        del self.posledni
