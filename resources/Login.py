from flask import request
from flask_restful import Resource
from Model import db, Login, LoginSchema, User
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import login_user
from flask_jwt_extended import (create_access_token, create_refresh_token, 
                                jwt_required, jwt_refresh_token_required, get_jwt_identity)
import json
# from app import jwt

logins_schema = LoginSchema(many=True)
login_schema = LoginSchema()

class LoginResource(Resource):
    # We probably don't need to query all logins using an API
    # def get(self):
    #     logins = Login.query.all()
    #     logins = logins_schema.dump(logins).data
    #     return {'status': 'success', 'data': logins}, 200

    def post(self):
        json_data = request.get_json(force=True)
        if not json_data:
               return {'message': 'No input data provided'}, 400
        # Validate and deserialize input
        data, errors = login_schema.load(json_data)
        if errors:
            return errors, 422
        print("received this user_name: ",data['user_name'])
        user_id = User.query.filter_by(user_name=data['user_name']).first()
        if user_id:
            # print("ID is",user_id.id)
            login = Login.query.filter_by(related_user_id=user_id.id).first()
            if login:
                if check_password_hash(login.password_hash, json_data['password_hash']):
                    access_token = create_access_token(identity=data)
                    refresh_token = create_refresh_token(identity=data)
                    returnedUser = {}
                    returnedUser['message'] = 'Login successful'
                    returnedUser['token'] = access_token
                    returnedUser['refresh'] = refresh_token
                    returnedUser['first_name'] = user_id.first_name
                    returnedUser['last_name'] = user_id.last_name
                    returnedUser['user_name'] = user_id.user_name
                    print("Called flask_jwt_extended!")
                    return returnedUser, 201
                else:
                    return {'message': 'The username or password is incorrect'}, 400

    # create password
    #    self.password_hash = generate_password_hash(password, method='pbkdf2:sha512')

    # def check_password(self, password):
    #    return check_password_hash(self.password_hash, password)


        login = Login(
            related_user_id=json_data['related_user_id'],
            user_name=json_data['user_name'],
            password_hash=generate_password_hash(json_data['password_hash'], method='pbkdf2:sha512:100001')
            )

        db.session.add(login)
        db.session.commit()

        result = login_schema.dump(login).data

        return { "status": 'success', 'data': result }, 201

    @jwt_required
    def put(self):
        json_data = request.get_json(force=True)
        if not json_data:
               return {'message': 'No input data provided'}, 400
        # Validate and deserialize input
        data, errors = login_schema.load(json_data)
        if errors:
            return errors, 422
        login = Login.query.filter_by(id=data['id']).first()
        if not login:
            return {'message': 'Login does not exist'}, 400
        login.related_user_id = data['related_user_id']
        login.user_name = data['user_name']
        login.password_hash = data['password_hash']
        db.session.commit()

        result = login_schema.dump(login).data

        return { "status": 'success', 'data': result }, 204

    @jwt_required
    def delete(self):
        json_data = request.get_json(force=True)
        if not json_data:
               return {'message': 'No input data provided'}, 400
        # Validate and deserialize input
        data, errors = login_schema.load(json_data)
        if errors:
            return errors, 422
        login = Login.query.filter_by(id=data['id']).delete()
        db.session.commit()

        result = login_schema.dump(login).data

        return { "status": 'success', 'data': result}, 204