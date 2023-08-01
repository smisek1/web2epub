from flask import Flask, redirect, url_for, request, render_template, send_file, after_this_request
import os,sys,inspect
import database
import create_book    
import get_html
app = Flask(__name__)

