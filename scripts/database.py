import psycopg2


class conn_string:
    '''
    Zajistuje pripojeni do Postrgre databaze

    Keyword arguments:
        Nothing

    Returns:
        Nothing
    '''
    def __init__(self):
        self.conn = psycopg2.connect("dbname='conversion' user='postgres' password='Pa$$w0rd' host='localhost'")
        print("start connection")
    def __del__(self):
        self.conn.close()
        print("end connection")

#*********************************************************
#Query na ziskavani dat ze stranek (pouzivano get_html.py)
#*********************************************************
class insert_clanek(conn_string):
    '''
    Vklada jeden clanek do databaze

    Keyword arguments:
        id_stranka - Id stranky ze seznamu vsech webu ze kterych taham data
        nadpis - nadpis clanku
        clanek - samotny clanek
        datum - datum clanku
        posledni - jedinecnou informaci o clanku (vetsinou byva odkaz stranky) - podle tohoto parametru se pak dohledava posledni ulozeny clanek v databazi

    Returns:
        Nothing
    TO DO: Insertova cele davky a ne jen po radkach'''
    def __init__(self):
        super().__init__()
    def insert(self,stranka,nadpis,clanek,datum,posledni,uvodni_odstavec,autor):
        cursor = self.conn.cursor()
        cursor.execute("INSERT INTO clanky (id_stranka,nadpis,clanek,datum,posledni,uvodni_odstavec,autor) Values (%s, %s, %s, %s, %s, %s, %s);",(str(stranka),nadpis,clanek,datum,posledni,uvodni_odstavec,autor))
        #cursor.fetchall()
        self.conn.commit()

class update_clanek(conn_string):
    '''
    Vklada jeden clanek do databaze

    Keyword arguments:

    Returns:
'''
    def __init__(self):
        super().__init__()
    def update(self,stranka,nadpis,clanek,datum,posledni,uvodni_odstavec,autor):
        cursor = self.conn.cursor()
        cursor.execute("update clanky set id_stranka = %s,nadpis = %s ,clanek = %s,datum = %s,uvodni_odstavec = %s ,autor = %s where posledni= %s;",(str(stranka),nadpis,clanek,datum,uvodni_odstavec,autor,posledni))
        #cursor.fetchall()
        self.conn.commit()

class insert_nechci_kniha(conn_string):
    '''
    Taha z databaze clanky ktere nejsou v zadne knize zobrazene v strance s clanky

    Keyword arguments:
        Nothing - TO DO!

    Returns:
        Data potrebna k vytvoreni epubu
    '''
    def __init__(self):
        super().__init__()
    def insert(self,id_clanky):
        cursor = self.conn.cursor()
        cursor.execute("INSERT INTO clanky (id_stranka,nadpis,clanek,datum,posledni) Values (%s, %s, %s, %s, %s);",(str(stranka),nadpis,clanek,datum,posledni))
        #cursor.fetchall()
        self.conn.commit()

class select_sites(conn_string):
    '''
    Taha data z databaze seznam stranek ze kterych se nasledne tahaji liky na vsechny stranky

    Keyword arguments:
        Nothing

    Returns:
        Seznam vsech webu ze kterych taham data
    '''
    def __init__(self):
        super().__init__()
        self.sites = self.select()
    def select(self):
        cursor = self.conn.cursor()
        cursor.execute("""select id_stranka,jmeno, link, xpath_links, xpath_nadpis,xpath_clanek, xpath_datum, xpath_uvodni_odstavec, xpath_autor from stranka where id_stranka !=5 and id_stranka !=6 and (id_stranka =7 or id_stranka =2 or id_stranka =8 or id_stranka =9 or id_stranka =10);""")
        #cursor.fetchall()
        self.conn.commit()
        return list(cursor.fetchall())


class select_posledni(conn_string):
    '''
    Ziska z databaze jedinoucnou informaci o clanku podle ktereho se zjistuje jestli je clanek uz ulozen v databazi

    Keyword arguments:
        id_stranka - Id stranky ze seznamu vsech webu ze kterych taham data

    Returns:
        Jedinecna informace o clanku
    '''
    def __init__(self,id_stranka):
        super().__init__()
        self.sites = self.select(id_stranka)
        print (self.sites)
    def select(self,id_stranka):
        cursor = self.conn.cursor()
        cursor.execute("SELECT posledni FROM public.clanky WHERE id_clanky=(SELECT max(id_clanky) FROM public.clanky where id_stranka = " +str(id_stranka)+" ) limit 1;")
        #cursor.fetchall()
        self.conn.commit()
        output = cursor.fetchone()
        if output is None:
            return "nic"
        else:
            return output[0]


#*********************************************************
#Query na Flask (pouzivano flaskem)
#*********************************************************

#clanky
class select_clanky(conn_string):
    '''
    Taha z databaze clanky ktere nejsou v zadne knize zobrazene v strance s clanky

    Keyword arguments:
        Nothing - TO DO!

    Returns:
        Data potrebna k vytvoreni epubu
    '''
    def __init__(self):
        conn_string.__init__(self)
        self.clanky = self.select()
    def select(self):
        cursor = self.conn.cursor()
        cursor.execute("""select clanky.id_clanky, concat(xx , nadpis) as nadpis,stranka.jmeno, clanek,datum, clanky.posledni
        from clanky
        left join stranka on stranka.id_stranka = clanky.id_stranka
    	left join kniha_clanek on kniha_clanek.id_clanky = clanky.id_clanky
left join (select   posledni,count(*),'XXXXXXXXXXX' as xx
        from clanky
        left join stranka on stranka.id_stranka = clanky.id_stranka
    	left join kniha_clanek on kniha_clanek.id_clanky = clanky.id_clanky
	    where kniha_clanek.id_clanky is null
	    group by posledni
	     HAVING COUNT(*) > 1) dt on dt.posledni = clanky.posledni
where kniha_clanek.id_clanky is null and (stranka.id_stranka = 7 or stranka.id_stranka = 2 or stranka.id_stranka = 8 or stranka.id_stranka = 9)
and clanky.autor not like '%Zdeněk Kratochvíl%'
        order by datum,nadpis""")
#         and clanky.autor not like '%r Socha'
# and clanky.autor not like '%iernik'
        #cursor.fetchall() #and clanky.autor like '%r Socha'
        # and clanky.autor like '%iernik'
        self.conn.commit()
        return cursor.fetchall()

class select_stranky(conn_string):
    '''
    Taha z databaze clanky ktere nejsou v zadne knize zobrazene v strance s clanky

    Keyword arguments:
        Nothing - TO DO!

    Returns:
        Data potrebna k vytvoreni epubu
    '''
    def __init__(self):
        conn_string.__init__(self)
        self.stranky = self.select()
    def select(self):
        cursor = self.conn.cursor()
        cursor.execute("""SELECT id_stranka, jmeno, link, xpath_nadpis, xpath_clanek, xpath_links,
       xpath_datum, xpath_uvodni_odstavec
  FROM public.stranka;""")
        #cursor.fetchall()
        self.conn.commit()
        return cursor.fetchall()

class insert_book(conn_string):
    '''
    Vytvori knihu v databazi

    Keyword arguments:
        id_clanku

    Returns:
        concatenated_jmena
    '''
    def __init__(self,id_clanku):
        conn_string.__init__(self)
        self.insert(id_clanku)
    def insert(self,id_clanku):
        cursor = self.conn.cursor()
        execution_text = """
        CREATE OR REPLACE FUNCTION my_function()
        RETURNS text AS $$
        DECLARE myid integer;
        concatenated_jmena text;
        BEGIN
        SELECT CONCAT(TO_CHAR(NOW(), 'YYYY-MM-DD_'), REPLACE(STRING_AGG(DISTINCT stranka.jmeno, '-' ORDER BY stranka.jmeno), '.', '_'))
        INTO concatenated_jmena
        FROM stranka
        INNER JOIN clanky ON clanky.id_stranka = stranka.id_stranka
        WHERE """

        for id_clanek in id_clanku:
            execution_text = execution_text + """clanky.id_clanky = """ +str(id_clanek)+""" or """
        execution_text = execution_text[:-3]
        execution_text = execution_text  + """;
        INSERT INTO kniha (jmeno)
        VALUES (concatenated_jmena)
        RETURNING id_kniha INTO myid;
        """
        for id_clanek in id_clanku:
            execution_text = execution_text + """insert into kniha_clanek (id_clanky, id_kniha) values (""" +str(id_clanek)+""", myid);
            """
        execution_text = execution_text  + """
        RETURN concatenated_jmena;
        END $$ LANGUAGE plpgsql;
        SELECT my_function();
        """
        print (execution_text)
        cursor.execute(execution_text)
        #cursor.fetchall()
        self.concatenated_jmena = cursor.fetchone()[0] # Get the value returned by the SQL function
        self.conn.commit()
        #with open('output.txt', 'w') as f:
        #    f.write(str(concatenated_jmena))
        return self.concatenated_jmena

class insert_book_nechci_cist(conn_string):
    '''
    propoji tabulku clanky s knihou "nechci cist"

    Keyword arguments:
        id_clanku

    Returns:
        Nothing
    '''
    def __init__(self,id_clanku):
        conn_string.__init__(self)
        self.insert(id_clanku)
    def insert(self,id_clanku):
        cursor = self.conn.cursor()
        execution_text = """DO $$
        DECLARE myid integer;
        BEGIN
        select id_kniha from kniha where jmeno='nechci cist' into myid;
        """
        for id_clanek in id_clanku:
            execution_text = execution_text + """insert into kniha_clanek (id_clanky, id_kniha) values (""" +str(id_clanek)+""", myid);
            """
        execution_text = execution_text + """END $$;"""
        print (execution_text)
        cursor.execute(execution_text)
        #cursor.fetchall()
        self.conn.commit()
        #return cursor.fetchall()

#Stranky
class update_stranka(conn_string):
    '''


    Keyword arguments:

    Returns:
'''
    def __init__(self):
        super().__init__()
    def update(self,jmeno, link, xpath_nadpis, xpath_clanek,xpath_links, xpath_datum, xpath_uvodni_odstavec,id_stranka):
        cursor = self.conn.cursor()
        cursor.execute("update stranka set jmeno = %s,link = %s ,xpath_nadpis = %s,xpath_clanek = %s,xpath_links = %s,xpath_datum = %s,xpath_uvodni_odstavec = %s where id_stranka= %s;",(jmeno, link, xpath_nadpis, xpath_clanek,xpath_links, xpath_datum, xpath_uvodni_odstavec,id_stranka))
        #cursor.fetchall()
        self.conn.commit()


class select_stranky_dleid(conn_string):
    '''


    Keyword arguments:
        Nothing - TO DO!

    Returns:
        D
    '''
    def __init__(self,id_stranky):
        conn_string.__init__(self)
        self.stranky = self.select(id_stranky)
    def select(self,id_stranky):
        cursor = self.conn.cursor()
        cursor.execute("SELECT id_stranka, jmeno, link, xpath_nadpis, xpath_clanek, xpath_links, xpath_datum, xpath_uvodni_odstavec FROM public.stranka where id_stranka = " + str(id_stranky) + "; ")
        #cursor.fetchall()
        self.conn.commit()
        return cursor.fetchall()

#*********************************************************
#Query na ziskavani pro tvorbu epub (pouzivano create_book.py)
#*********************************************************

class select_clanky_pro_epub(conn_string):
    '''
    Taha z databaze clanky pro nasledny zapis do epub

    Keyword arguments:
        Nothing - TO DO!

    Returns:
        Data potrebna k vytvoreni epubu
    '''
    def __init__(self,jmeno_knihy):
        conn_string.__init__(self)
        self.clanky = self.select(jmeno_knihy)
    def select(self,jmeno_knihy):
        cursor = self.conn.cursor()
        query = """select clanky.id_stranka, nadpis, clanek,datum,uvodni_odstavec,stranka.jmeno,autor from clanky
        left join kniha_clanek on kniha_clanek.id_clanky = clanky.id_clanky
        left join kniha on kniha_clanek.id_kniha = kniha.id_kniha
        left join stranka on stranka.id_stranka = clanky.id_stranka
        where kniha.jmeno = '{jmeno_knihy}'
        order by datum""".format(jmeno_knihy=str(jmeno_knihy))
        cursor.execute(query)
        self.conn.commit()
        return cursor.fetchall()

#*********************************************************
#Query na ziskavani dat pro pytest
#*********************************************************

class select_linky_pro_testing(conn_string):
    '''
    Taha z databaze clanky pro nasledny zapis do epub

    Keyword arguments:
        Nothing - TO DO!

    Returns:
        Data potrebna k vytvoreni epubu
    '''
    def __init__(self):
        conn_string.__init__(self)
        self.clanky = self.select()
    def select(self):
        cursor = self.conn.cursor()
        cursor.execute("""select posledni from clanky""")
        #cursor.fetchall()
        self.conn.commit()
        return cursor.fetchall()
