import os
import datetime
from flask import Flask
from flask import request, abort, jsonify
from flask_sqlalchemy import SQLAlchemy
from pathlib import Path
from flask_login import LoginManager
from flask_jwt_extended import JWTManager, get_jwt_identity, get_raw_jwt, jwt_required

ip_ban_list = []

def create_app(config_filename):
    app = Flask(__name__,
     static_folder = './public',
     template_folder="./static")

    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY')
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = datetime.timedelta(days=1)
    app.config['JWT_BLACKLIST_ENABLED'] = True
    app.config['JWT_BLACKLIST_TOKEN_CHECKS'] = ['access', 'refresh']

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
        return {'user_name': user['user_name']}

    # Create a function that will be called whenever create_access_token
    # is used. It will take whatever object is passed into the
    # create_access_token method, and lets us define what the identity
    # of the access token should be.
    @jwt.user_identity_loader
    def user_identity_lookup(user):
        return user['user_name']

    # New function, verify the user claims in an access token
    @jwt.claims_verification_loader
    def verify_user_claims(user_claims):
        expected_keys = ['user_name']
        for key in expected_keys:
            if key not in user_claims:
                print("key not in user_claims",key,user_claims)
                return False
            else:
                if(get_jwt_identity() != user_claims[key]):
                    print("identity doesn't match",get_jwt_identity(),user_claims[key])
                    return False
        return True

    # New function, change the return value if user claims verification failed
    @jwt.claims_verification_failed_loader
    def failed_user_claim_verification_error():
        return jsonify({'msg': 'Access token is incorrect'}), 404


    @app.route('/logout', methods=['POST'])
    @jwt_required
    def logout():
        print("logging out in init.py")
        jti = get_raw_jwt()['jti']
        blacklist.add(jti)
        return jsonify({"msg": "Successfully logged out"}), 200

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
        #print("val from block check:",val,ip_ban_list)
        if val is not None:
            present = datetime.datetime.utcnow()
            if val > present:
                #print("VALID DATE!!",val,present)
                abort(403)

    return app
