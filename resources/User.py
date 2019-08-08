from flask import request, current_app
from flask_restful import Resource
from Model import db, User, UserSchema, Login, LoginSchema, Membership, MembershipSchema
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import login_user
from flask_jwt_extended import (create_access_token, create_refresh_token,
                                jwt_required, jwt_refresh_token_required, get_jwt_identity)
from templates import admin_required, fresh_admin_required
import json

users_schema = UserSchema(many=True)
user_schema = UserSchema()
login_schema = LoginSchema()
membership_schema = MembershipSchema()

class UserResource(Resource):
    #removed jwt gate so that Redux works
    # @jwt_required
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

        print("user id is ",result,result['id'])
        user_login = {"password_hash": password_hash, "related_user_id": result['id'], "user_name": json_data['user_name']}

        data, errors = login_schema.load(user_login)
        print("data and errors: ",data,errors)
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
        user_membership = {"related_user_id": result['id'], "related_account_id": 0, "related_role_id": 2, "account_email_address": "sugon@deez.nutz", "account_phone_number": ""}

        data, errors = membership_schema.load(user_membership)
        print("data and errors: ",data,errors)
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
            account_phone_number=user_membership['account_phone_number']
            )

        db.session.add(membership)
        db.session.commit()

        # new_user.id = result['id']
        # new_user.first_name = result['first_name'] 
        # new_user.last_name = result['last_name']
        # new_user.user_name = result['user_name']
        user_id = User.query.filter_by(user_name=json_data['user_name']).first()
        print("user_membership: ",user_membership)
        print(user_membership['related_role_id']," ",result)
        user_id.related_role_id = user_membership['related_role_id']
        login_user(user_id)

        password_hash = ""
        user_login = {}
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