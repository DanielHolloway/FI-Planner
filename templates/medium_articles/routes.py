import os

from flask import Flask
from flask import render_template
from flask import Blueprint
from flask import request

from flask_sqlalchemy import SQLAlchemy

from flask import redirect

from flask_login import login_required, current_user

medium_blueprint = Blueprint('medium_article',__name__)
@medium_blueprint.route('/login')
@medium_blueprint.route('/journal')
@login_required
def index():
    print("shmeeeat")
    print(current_user.name)
    return render_template("index.html", name=current_user.name)
    
