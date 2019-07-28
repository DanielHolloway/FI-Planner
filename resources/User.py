from flask import request
from flask_restful import Resource
from Model import db, User, UserSchema, Login, LoginSchema
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import (create_access_token, create_refresh_token,
                                jwt_required, jwt_refresh_token_required, get_jwt_identity)
import json

users_schema = UserSchema(many=True)
user_schema = UserSchema()
login_schema = LoginSchema()

class UserResource(Resource):
    #removed jwt gate so that Redux works
    # @jwt_required
    def get(self):
        users = User.query.all()
        users = users_schema.dump(users).data
        return {'status': 'success', 'data': users}, 200

    # @jwt_required
    def post(self):
        json_data = request.get_json(force=True)
        if not json_data:
               return {'message': 'No input data provided'}, 400
        # Validate and deserialize input
        password_hash = generate_password_hash(json_data['password_hash'], method='pbkdf2:sha512:100001')
        json_data['password_hash'] = ""

        data, errors = user_schema.load(json_data)
        if errors:
            return errors, 422
        user = User.query.filter_by(user_name=data['user_name']).first()
        if user:
            return {'message': 'User already exists'}, 400
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
            return errors, 422
        login = Login.query.filter_by(user_name=data['user_name']).first()
        if login:
            return {'message': 'Login already exists'}, 400
        login = Login(
            related_user_id=user_login['related_user_id'],
            user_name=user_login['user_name'],
            password_hash=password_hash
            )

        db.session.add(login)
        db.session.commit()

        password_hash = ""
        user_login = {}
        return { "status": 'success', 'data': result }, 201

    @jwt_required
    def put(self):
        json_data = request.get_json(force=True)
        if not json_data:
               return {'message': 'No input data provided'}, 400
        # Validate and deserialize input
        data, errors = user_schema.load(json_data)
        if errors:
            return errors, 422
        user = User.query.filter_by(id=data['id']).first()
        if not user:
            return {'message': 'User does not exist'}, 400
        user.first_name = data['first_name']
        user.last_name = data['last_name']
        user.user_name = data['user_name']
        db.session.commit()

        result = user_schema.dump(user).data

        return { "status": 'success', 'data': result }, 204

    @jwt_required
    def delete(self):
        json_data = request.get_json(force=True)
        if not json_data:
               return {'message': 'No input data provided'}, 400
        # Validate and deserialize input
        data, errors = user_schema.load(json_data)
        if errors:
            return errors, 422
        user = User.query.filter_by(id=data['id']).delete()
        db.session.commit()

        result = user_schema.dump(user).data

        return { "status": 'success', 'data': result}, 204