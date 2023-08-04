
from flask import Flask, redirect, url_for, request, render_template, send_file, after_this_request
import os,sys,inspect
currentdir = os.path.dirname(os.path.abspath(inspect.getfile(inspect.currentframe())))
parentdir = os.path.dirname(currentdir)
sys.path.insert(0,parentdir) 
sys.path.insert(0,parentdir + "/scripts") 
import database
import create_book    
import get_html
clanky = database.select_stranky()
app = Flask(__name__)

@app.route('/xpath_testing/')
@app.route('/xpath_testing/<name>/')
def create(name=None):
    clanky = database.select_clanky()
    return render_template('xpath_testing.html', clanky=clanky.clanky)
