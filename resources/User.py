from flask import request, current_app, session, jsonify
from flask_restful import Resource
from Model import db, User, UserSchema, Login, LoginSchema, Membership, MembershipSchema
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import login_user
from flask_jwt_extended import (create_access_token, create_refresh_token, set_access_cookies, set_refresh_cookies, 
                                jwt_required, jwt_refresh_token_required, get_jwt_identity)
from templates import admin_required, fresh_admin_required
import json, datetime
from twilio.rest import Client

# Initialize Twilio client
client = Client()

users_schema = UserSchema(many=True)
user_schema = UserSchema()
login_schema = LoginSchema()
membership_schema = MembershipSchema()

def userVerified(login):
    current_app.logger.info('Verified user in Verify PUT')
    access_token = create_access_token(identity=login.user_name, fresh=True)
    refresh_token = create_refresh_token(identity=login.user_name)
    # Set the JWTs and the CSRF double submit protection cookies
    # in this response
    user_id = User.query.filter_by(id=login.related_user_id).first()
    user_membership = Membership.query.filter_by(related_user_id=user_id.id).first()
    user_id.related_role_id = user_membership.related_role_id
    if not user_membership:
        current_app.logger.error('Membership not found in Login POST')
        return {'message': 'Login membership does not exist', 'error': 'true'}, 400
    login_user(user_id)
    resp = jsonify({
        'login': True,
        'message': 'Login successful',
        'first_name': user_id.first_name,
        'last_name': user_id.last_name,
        'user_name': user_id.user_name,
        'id': user_id.id,
        })
    set_access_cookies(resp, access_token)
    set_refresh_cookies(resp, refresh_token)
    resp.status_code = 200
    return resp

def start_verification(to):
    channel = 'sms'

    service = current_app.config.get("VERIFICATION_SID")

    verification = client.verify \
        .services(service) \
        .verifications \
        .create(to=to, channel=channel)
    
    #REDIRECT TO VERIFY PAGE FOR CODE ENTRY
    return verification.sid


def check_verification(phone, code):
    service = current_app.config.get("VERIFICATION_SID")
    
    try:
        verification_check = client.verify \
            .services(service) \
            .verification_checks \
            .create(to=phone, code=code)

        current_app.logger.info(verification_check)
        if verification_check.status == "approved":
            membership = Membership.query.filter_by(account_phone_number=phone).first()
            if not membership:
                current_app.logger.error('Phone number not found in Verify PUT')
                return {'message': 'Membership does not exist', 'error': 'true'}, 400
            # membership.related_user_id = data['related_user_id']
            # membership.related_account_id = data['related_account_id']
            # membership.related_role_id = data['related_role_id']
            # membership.account_email_address = data['account_email_address']
            # membership.account_phone_number = data['account_phone_number']
            membership.verified = 1
            db.session.commit()
            result = membership_schema.dump(membership).data

            login = Login.query.filter_by(related_user_id=result['related_user_id']).first()
            if not login:
                current_app.logger.error('User not found after Verify PUT')
                return {'message': 'User not found', 'error': 'true'}, 400
    
            

            result = login_schema.dump(login).data

            session['codecounter']=0
            current_app.logger.info('Successful Verify PUT')
            return userVerified(login)
            # return { "status": 'success', 'data': result }, 201
        
        else:
            current_app.logger.error('Bad code given to Verify PUT')
            return { "status": 'failure' }, 422
    except Exception as errors:
        current_app.logger.error('Bad data given to Verify PUT')
        return errors, 422

    #return redirect(url_for('auth.verify'))

class UserVerifyResource(Resource):
    #@jwt_required
    def post(self):
        current_app.logger.info('Processing Verify POST')
        json_data = request.get_json(force=True)
        if not json_data:
            current_app.logger.error('No input data given to Verify POST')
            return {'message': 'No input data provided', 'error': 'true'}, 400
        # Validate and deserialize input
        phone = session.get('phone')
        code = json_data['code']
        current_app.logger.info('Successful Verify POST')
        return check_verification(phone, code)

    def put(self):
        current_app.logger.info('Processing Verify PUT')
        count = session.get('codecounter')
        val = session.get('codetimer')
        if count is None:
            count = 0
        time_delay = 180 * (2**(count))
        session['codetimer']=datetime.datetime.utcnow()+datetime.timedelta(0,time_delay)
        count += 1
        session['codecounter']=count
        present = datetime.datetime.utcnow()
        if val is not None:
            if val > present:
                current_app.logger.error('Wait before using phone verification in Verify PUT')
                return {'message': 'Wait before using phone verification', 'error': 'true'}, 429
            else:
                session['codecounter']=0


        #remove after debugging
        #return {'message': 'DEBUG Wait before using phone verification', 'error': 'true'}, 429

        phone = session.get('phone')
        vsid = start_verification(phone)

        if vsid is None:
            current_app.logger.error('Bad phone verification in Verify PUT')
            return {'message': 'Bad phone verification', 'error': 'true'}, 400

        current_app.logger.info('Successful Verify POST')
        return { "status": 'success' }, 201
        

class UserResource(Resource):
    #removed jwt gate so that Redux works
    # @jwt_required
    @fresh_admin_required
    def get(self):
        current_app.logger.info('Processing User GET')
        users = User.query.all()
        users = users_schema.dump(users).data
        return {'status': 'success', 'data': users}, 200

    # @jwt_required
    def post(self):
        current_app.logger.info('Processing User POST')
        json_data = request.get_json(force=True)
        if not json_data:
            current_app.logger.error('No input data given to User POST')
            return {'message': 'No input data provided', 'error': 'true'}, 400
        # Validate and deserialize input
        password_hash = generate_password_hash(json_data['password_hash'], method='pbkdf2:sha512:100001')
        json_data['password_hash'] = ""

        phone = json_data['phone']


        data, errors = user_schema.load(json_data)
        if errors:
            current_app.logger.error('Bad data given to User POST')
            return errors, 422
        user = User.query.filter_by(user_name=data['user_name']).first()
        if user:
            current_app.logger.error('Username already taken in User POST')
            return {'message': 'User already exists', 'error': 'true'}, 400
        user = User(
            first_name=json_data['first_name'],
            last_name=json_data['last_name'],
            user_name=json_data['user_name']
            )

        db.session.add(user)
        db.session.commit()

        result = user_schema.dump(user).data

        user_login = {"password_hash": password_hash, "related_user_id": result['id'], "user_name": json_data['user_name']}

        data, errors = login_schema.load(user_login)
        if errors:
            current_app.logger.error('Bad Login data given to User POST')
            return errors, 422
        login = Login.query.filter_by(user_name=data['user_name']).first()
        if login:
            current_app.logger.error('Username at Login is already taken in User POST')
            return {'message': 'Login already exists', 'error': 'true'}, 400
        login = Login(
            related_user_id=user_login['related_user_id'],
            user_name=user_login['user_name'],
            password_hash=password_hash
            )

        db.session.add(login)
        db.session.commit()

        login_result = login_schema.dump(login).data

        # default related_role_id to 2
        user_membership = {"related_user_id": result['id'], "related_account_id": 0, "related_role_id": 2, "account_email_address": "sugon@deez.nutz", "account_phone_number": phone}

        session['phone'] = phone
        vsid = start_verification(phone)

        if vsid is None:
            current_app.logger.error('Bad phone verification in User POST')
            return {'message': 'Bad phone verification', 'error': 'true'}, 400

        data, errors = membership_schema.load(user_membership)

        if errors:
            current_app.logger.error('Bad Membership data given to User POST')
            return errors, 422
        # membership = Membership.query.filter_by(name=data['name']).first()
        # if membership:
        #     return {'message': 'Membership already exists', 'error': 'true'}, 400
        membership = Membership(
            related_user_id=user_membership['related_user_id'],
            related_account_id=user_membership['related_account_id'],
            related_role_id=user_membership['related_role_id'],
            account_email_address=user_membership['account_email_address'],
            account_phone_number=user_membership['account_phone_number'],
            verified=0
            )

        db.session.add(membership)
        db.session.commit()

        # new_user.id = result['id']
        # new_user.first_name = result['first_name'] 
        # new_user.last_name = result['last_name']
        # new_user.user_name = result['user_name']
        user_id = User.query.filter_by(user_name=json_data['user_name']).first()
        user_id.related_role_id = user_membership['related_role_id']
        login_user(user_id)

        password_hash = ""
        user_login = {}
        current_app.logger.info('Successful User POST')
        return { "status": 'success', 'data': result }, 201

    #make an api for specific user ID to restrict user access to their own entries
    @fresh_admin_required
    def put(self):
        current_app.logger.info('Processing User PUT')
        json_data = request.get_json(force=True)
        if not json_data:
            current_app.logger.error('No input data given to User PUT')
            return {'message': 'No input data provided', 'error': 'true'}, 400
        # Validate and deserialize input
        data, errors = user_schema.load(json_data)
        if errors:
            current_app.logger.error('Bad data given to User PUT')
            return errors, 422
        user = User.query.filter_by(id=data['id']).first()
        if not user:
            current_app.logger.error('Selection not found in User PUT')
            return {'message': 'User does not exist', 'error': 'true'}, 400
        user.first_name = data['first_name']
        user.last_name = data['last_name']
        user.user_name = data['user_name']
        db.session.commit()

        result = user_schema.dump(user).data

        current_app.logger.info('Successful User PUT')
        return { "status": 'success', 'data': result }, 204

    #make an api for specific user ID to restrict user access to their own entries
    @fresh_admin_required
    def delete(self):
        current_app.logger.info('Processing User DELETE')
        json_data = request.get_json(force=True)
        if not json_data:
            current_app.logger.error('No input data given to User DELETE')
            return {'message': 'No input data provided', 'error': 'true'}, 400
        # Validate and deserialize input
        data, errors = user_schema.load(json_data)
        if errors:
            current_app.logger.error('Bad data given to User DELETE')
            return errors, 422
        user = User.query.filter_by(id=data['id']).delete()
        db.session.commit()

        result = user_schema.dump(user).data

        current_app.logger.info('Successful User DELETE')
        return { "status": 'success', 'data': result}, 204