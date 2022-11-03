from flask import Flask, redirect, url_for, request
from flask import Flask
from flask import url_for
import os,sys,inspect
import sys
from importlib import reload
#reload(sys)
#sys.setdefaultencoding("utf-8")
import importlib
currentdir = os.path.dirname(os.path.abspath(inspect.getfile(inspect.currentframe())))
parentdir = os.path.dirname(currentdir)
sys.path.insert(0,parentdir) 
sys.path.insert(0,parentdir + "/scripts") 
import database
import create_book    
import get_html
clanky = database.select_clanky()
from flask import render_template
app = Flask(__name__)
##################
#Hello
##################
@app.route('/hello/')
@app.route('/hello/<name>/')
def hello(name=None):
    clanky = database.select_clanky()
    return render_template('hello.html', clanky=clanky.clanky)

@app.route('/success/<ide>')
def success(ide):
   return 'welcome %s' % ide

@app.route('/login',methods = ['POST', 'GET'])
def login():
   print ("aaaaaaaaaaaaaaaaaaaa")
   print ("aaaaaaaaaaaaaaaaaaaa")
   print ("aaaaaaaaaaaaaaaaaaaa")
   id_clanku = request.form.getlist('id')
   print (str(id_clanku))
   if request.method == 'POST':
      kniha = request.form['nazev']
      id_clanku = request.form.getlist('id')
      if request.form['submit_button'] == 'Nechci cist':
        database.insert_book_nechci_cist(id_clanku)
        # for id in states:
        #   print(str(id))
        return redirect(url_for('hello',ide = id_clanku))
      elif request.form['submit_button'] == 'Vytvorit knihu':
        database.insert_book(kniha,id_clanku)
        os.chdir('/tmp/tmp')
        tvorbakniha = create_book.create_book(kniha)
        a = database.select_clanky_pro_epub(kniha)
        for b in a.clanky:
            tvorbakniha.add_kap(b[2],b[1],b[3],b[4],b[5],b[6])
        tvorbakniha.write_knihu(kniha)
        return redirect(url_for('hello',ide = id_clanku))
      elif request.form['submit_button'] == 'Nacti':
        get_html.main_throuhgh_sites()
        return redirect(url_for('hello',ide = id_clanku))
   else:
      ids = request.form['id']
      return redirect(url_for('success',ide = ids))
##################


##################
#stranky
##################
@app.route('/stranky')
def stranky():
   stranky_selectbox = database.select_stranky()
   id_stranky =1
   stranka = database.select_stranky_dleid(id_stranky)
   return render_template('stranky.html', stranky_selectbox=stranky_selectbox.stranky, stranky=stranka.stranky)

@app.route('/refresh',methods = ['POST', 'GET'])
def refresh(id_stranky = None):
   stranky_selectbox = database.select_stranky()

   id_stranky= request.form.get('comp_select')

   stranka = database.select_stranky_dleid(id_stranky)
   return render_template('stranky.html', stranky_selectbox=stranky_selectbox.stranky, stranky=stranka.stranky)


@app.route('/update',methods = ['POST', 'GET'])
def update_stranky():
   if request.method == 'POST':
      id_stranka = request.form.getlist('id_stranka')
      jmeno = request.form.getlist('Jmeno')
      link = request.form.getlist('Link')
      xpath_nadpis = request.form.getlist('xpath_nadpis')
      xpath_clanek = request.form.getlist('xpath_clanek')
      xpath_links = request.form.getlist('xpath_links')
      xpath_datum = request.form.getlist('xpath_datum')
      xpath_uvodni_odstavec = request.form.getlist('xpath_uvodni_odstavec')
      print (str(id_stranka ))
      print (str(jmeno ))
      print (str(link ))
      print (str(xpath_nadpis ))
      print (str(xpath_clanek ))
      print (str(xpath_links ))
      print (str(xpath_datum ))
      print (str(xpath_uvodni_odstavec))
      if request.form['submit_button'] == 'Update':
        database.update_stranka(jmeno, link, xpath_nadpis, xpath_clanek,xpath_links, xpath_datum, xpath_uvodni_odstavec,id_stranka)
        return redirect(url_for('stranky'))
      elif request.form['submit_button'] == 'Vytvorit knihu':
         pass

   # else:
   #    ids = request.form['id']
   #    return redirect(url_for('success',ide = ids))
