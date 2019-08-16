import os
import datetime
from flask import Flask, g, redirect, make_response
from flask import request, abort, jsonify
from flask_sqlalchemy import SQLAlchemy
from pathlib import Path
from flask_login import LoginManager, current_user
from flask_jwt_extended import (JWTManager, get_jwt_identity, get_raw_jwt, jwt_required, jwt_refresh_token_required,
                                create_access_token, verify_jwt_in_request, set_access_cookies, set_refresh_cookies, unset_jwt_cookies)
from functools import wraps
from dotenv import load_dotenv, find_dotenv
import logging


ip_ban_list = []

def fresh_admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_fresh_jwt_in_request()
        
        if(g.user.related_role_id != 1):  #NOT ADMIN UNLESS ROLE ID IS 1
            return {'message': 'Lacking the proper role', 'error': 'true'}, 400
        else:
            return fn(*args, **kwargs)
    return wrapper

def admin_required(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        
        if(g.user.related_role_id != 1):  #NOT ADMIN UNLESS ROLE ID IS 1
            return {'message': 'Lacking the proper role', 'error': 'true'}, 400
        else:
            return fn(*args, **kwargs)
    return wrapper

def create_app(config_filename):
    app = Flask(__name__,
        static_folder = './public',
        template_folder="./static")

    logging.basicConfig(filename='fiplanner.log',
    level=logging.DEBUG,
    format='%(asctime)s %(levelname)s %(name)s %(threadName)s : %(message)s')

    load_dotenv(find_dotenv())

    #@app.before_first_request
    #def init_configs():
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY')
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = datetime.timedelta(days=1)
    app.config['JWT_BLACKLIST_ENABLED'] = True
    app.config['JWT_BLACKLIST_TOKEN_CHECKS'] = ['access', 'refresh']
    app.config['JWT_TOKEN_LOCATION'] = ['cookies']
    # Only allow JWT cookies to be sent over https. In production, this should likely be True
    app.config['JWT_COOKIE_SECURE'] = False
    app.config['JWT_ACCESS_COOKIE_PATH'] = '/api/'
    app.config['JWT_REFRESH_COOKIE_PATH'] = '/api/Token'
    # Twilio verify key        
    app.config['VERIFICATION_SID'] = os.environ.get('VERIFICATION_SID')
    
    # Enable csrf double submit protection. See this for a thorough
    # explanation: http://www.redotheweb.com/2015/11/09/api-security.html
    app.config['JWT_COOKIE_CSRF_PROTECT'] = True

    app.config['SQLALCHEMY_ECHO'] = False
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = True
    project_dir = os.path.dirname(os.path.abspath(__file__))
    p = Path(project_dir).parents[0]
    database_file = "sqlite:///{}".format(os.path.join(p, "fiplanner.db"))
    app.config['SQLALCHEMY_DATABASE_URI'] = database_file


    from app import api_bp
    app.register_blueprint(api_bp, url_prefix='/api')

    from Model import db
    db.init_app(app)

    login_manager = LoginManager()
    login_manager.login_view = 'medium_blueprint.login'
    login_manager.init_app(app)

    jwt = JWTManager(app)

    # A storage engine to save revoked tokens. In production if
    # speed is the primary concern, redis is a good bet.
    blacklist = set()

    @jwt.token_in_blacklist_loader
    def check_if_token_in_blacklist(decrypted_token):
        jti = decrypted_token['jti']
        return jti in blacklist

    # Create a function that will be called whenever create_access_token
    # is used. It will take whatever object is passed into the
    # create_access_token method, and lets us define what custom claims
    # should be added to the access token.
    @jwt.user_claims_loader
    def add_claims_to_access_token(user):
        try: 
            user['user_name']
        except:
            return {'user_name': user}

        return {'user_name': user['user_name']}

    # Create a function that will be called whenever create_access_token
    # is used. It will take whatever object is passed into the
    # create_access_token method, and lets us define what the identity
    # of the access token should be.
    @jwt.user_identity_loader
    def user_identity_lookup(user):
        try: 
            user['user_name']
        except:
            return {'user_name': user}

        return user['user_name']

    # New function, verify the user claims in an access token
    @jwt.claims_verification_loader
    def verify_user_claims(user_claims):
        expected_keys = ['user_name']
        for key in expected_keys:
            if key not in user_claims:
                return False
            else:
                checkJWT = get_jwt_identity()
                if(checkJWT != None):
                    if(checkJWT['user_name'] != user_claims[key]):
                        return False
        return True

    # New function, change the return value if user claims verification failed
    @jwt.claims_verification_failed_loader
    def failed_user_claim_verification_error():
        return jsonify({'msg': 'Access token is incorrect'}), 404

    @app.route('/logout', methods=['POST'])
    @jwt_required
    def logout():
        jti = get_raw_jwt()['jti']
        blacklist.add(jti)
        resp = jsonify({'logout': True})
        unset_jwt_cookies(resp)
        return resp, 200

    from Model import User, Membership

    @login_manager.user_loader
    def load_user(user_id):
        loaded_user = User.query.get(int(user_id))
        if not loaded_user:
            return
        user_membership = Membership.query.filter_by(related_user_id=loaded_user.id).first()
        loaded_user.related_role_id = user_membership.related_role_id
        return loaded_user

    @app.before_request
    def before_request():
        g.user = current_user

    # used to instantiate comments.db
    with app.app_context():
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
        ip = request.environ.get('HTTP_X_REAL_IP', request.remote_addr) 
        dct = dict(ip_ban_list)
        val = dct.get(ip)
        if val is not None:
            present = datetime.datetime.utcnow()
            if val > present:
                app.logger.warning('Blocked request from blacklist')
                abort(403)

    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def catch_all(path):
        return redirect("/", code=302)

    return app
