import os
import datetime
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from pathlib import Path
from flask_login import LoginManager
from flask_jwt_extended import JWTManager

def create_app(config_filename):
    app = Flask(__name__,
     static_folder = './public',
     template_folder="./static")

    app.config['SECRET_KEY'] = '9OLWxND4o69j4K4iuopO'
    app.config['JWT_SECRET_KEY'] = '9OLWxND4o69j4K4iuopO' #fix later: os.environ.get('SECRET')
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

    return app
