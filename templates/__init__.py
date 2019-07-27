import os
import datetime
from flask import Flask
from flask import request, abort
from flask_sqlalchemy import SQLAlchemy
from pathlib import Path
from flask_login import LoginManager
from flask_jwt_extended import JWTManager

ip_ban_list = [('127.0.0.0',datetime.datetime.utcnow())]

def create_app(config_filename):
    app = Flask(__name__,
     static_folder = './public',
     template_folder="./static")

    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY')
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = datetime.timedelta(days=1)

    app.config['SQLALCHEMY_ECHO'] = False
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = True
    project_dir = os.path.dirname(os.path.abspath(__file__))
    p = Path(project_dir).parents[0]
    database_file = "sqlite:///{}".format(os.path.join(p, "comments.db"))
    app.config['SQLALCHEMY_DATABASE_URI'] = database_file


    from app import api_bp
    app.register_blueprint(api_bp, url_prefix='/api')

    from Model import db
    db.init_app(app)
    
    login_manager = LoginManager()
    login_manager.login_view = 'medium_blueprint.login'
    login_manager.init_app(app)

    jwt = JWTManager(app)

    from Model import Login

    @login_manager.user_loader
    def load_user(user_id):
        return Login.query.get(int(user_id))

    # used to instantiate comments.db
    with app.app_context():
        print("trying to create db")
        from Model import Comment
        from Model import Category
        db.create_all()
        db.session.commit()


    from templates.hello.routes import hello_blueprint
    from templates.medium_articles.routes import medium_blueprint
    # register the blueprints
    app.register_blueprint(hello_blueprint)
    app.register_blueprint(medium_blueprint)



    @app.before_request
    def block_method():
        ip = request.environ.get('REMOTE_ADDR')
        dct = dict(ip_ban_list)
        val = dct.get(ip)
        if val is not None:
            print(val)
            abort(403)

    return app
