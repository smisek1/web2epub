from flask import Flask, redirect, url_for, request, render_template, send_file, after_this_request
import os,sys,inspect
currentdir = os.path.dirname(os.path.abspath(inspect.getfile(inspect.currentframe())))
parentdir = os.path.dirname(currentdir)
sys.path.insert(0,parentdir) 
sys.path.insert(0,parentdir + "/scripts") 
import database
import create_book    
import get_html
clanky = database.select_clanky()
app = Flask(__name__)

@app.route('/create/')
def create():
    clanky = database.select_clanky()
    return render_template('create.html', clanky=clanky.clanky)


@app.route('/create',methods = ['POST', 'GET'])
def login():
    id_clanku = request.form.getlist('id')
    if request.method == 'POST':
#        kniha = request.form['nazev']
        id_clanku = request.form.getlist('id')
        if request.form['submit_button'] == 'Move to trash':
            database.insert_book_nechci_cist(id_clanku)
            return redirect(url_for('create',ide = id_clanku))
        elif request.form['submit_button'] == 'Create book':
            kniha = database.insert_book(id_clanku).concatenated_jmena
            os.chdir('/tmp')
            with open('outputweb.txt', 'w') as f:
                f.write(str(kniha))
            tvorbakniha = create_book.create_book(kniha)
            a = database.select_clanky_pro_epub(kniha)
            for b in a.clanky:
                tvorbakniha.add_kap(b[2],b[1],b[3],b[4],b[5],b[6])
            tvorbakniha.write_knihu(kniha)
            file = kniha + ".epub"
            @after_this_request
            def redirect_after_download(response):
                return send_file('/tmp/'+ file, as_attachment=True)
            return redirect(url_for('create',ide = id_clanku))
        elif request.form['submit_button'] == 'Nacti':
            get_html.main_throuhgh_sites()
            return redirect(url_for('create',ide = id_clanku))
    else:
        ids = request.form['id']
        return redirect(url_for('success',ide = ids))

@app.route('/xpath_testing/')
def xpath_testing(name=None):
    stranky = database.select_stranky()
    return render_template('xpath_testing.html', stranky=stranky.stranky)
