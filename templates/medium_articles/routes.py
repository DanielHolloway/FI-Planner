import os

from flask import Flask
from flask import render_template
from flask import Blueprint
from flask import request

from flask_sqlalchemy import SQLAlchemy

from flask import redirect

medium_blueprint = Blueprint('medium_article',__name__)
@medium_blueprint.route('/login')
@medium_blueprint.route('/journal')
def index():
    print("shmeeeat")
    return render_template("index.html")
    
