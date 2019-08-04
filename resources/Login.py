import os
import datetime
from flask import request, jsonify, g
from flask_restful import Resource
from Model import db, Login, LoginSchema, User, Membership, client
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import login_user
from flask_jwt_extended import (create_access_token, create_refresh_token, get_raw_jwt,
                                jwt_required, jwt_refresh_token_required, get_jwt_identity, 
                                set_access_cookies, set_refresh_cookies, unset_jwt_cookies)
from templates import admin_required

import json
from templates import ip_ban_list
#from run import app

logins_schema = LoginSchema(many=True)
login_schema = LoginSchema()

class LoginRefreshResource(Resource):
    @jwt_refresh_token_required
    def post(self):
        # Create the new access token
        current_user = get_jwt_identity()
        print("found user in refresh:",current_user)
        access_token = create_access_token(identity=current_user, fresh=False)
        # Set the access JWT and CSRF double submit protection cookies
        # in this response
        user_id = User.query.filter_by(user_name=current_user).first()
        user_membership = Membership.query.filter_by(related_user_id=user_id.id).first()
        user_id.related_role_id = user_membership.related_role_id
        login_user(user_id)
        print("g's role is now",g.user.related_role_id)
        resp = jsonify({
                'refresh': True,
                'message': 'Login successful',
                'first_name': user_id.first_name,
                'last_name': user_id.last_name,
                'user_name': user_id.user_name,
                'id': user_id.id,
                })
        set_access_cookies(resp, access_token)
        resp.status_code = 200
        return resp

    #@jwt_refresh_token_required
    def delete(self):
        print("logging out in Login.py")
        resp = jsonify({'logout': True})
        unset_jwt_cookies(resp)
        resp.status_code = 200
        return resp


class LoginResource(Resource):
    # We probably don't need to query all logins using an API
    # def get(self):
    #     logins = Login.query.all()
    #     logins = logins_schema.dump(logins).data
    #     return {'status': 'success', 'data': logins}, 200


    def post(self):
        json_data = request.get_json(force=True)
        if not json_data:
               return {'message': 'No input data provided', 'error': 'true'}, 400
        # Validate and deserialize input
        print(json_data)
        json_data['related_user_id'] = 0
        data, errors = login_schema.load(json_data)
        if errors:
            return errors, 422
        print("received this user_name: ",data['user_name'])
        user_id = User.query.filter_by(user_name=data['user_name']).first()

        def checkBanList(key):
            count = client.get(key)
            if count is None:
                count = 0
            count += 1
            client.set(key, count)
            if count >= 3:
                time_delay = 15 * (2**(count-3))
                #print("ip: ",key,"datetime: ",datetime.datetime.utcnow()+datetime.timedelta(0,time_delay))
                ip_ban_list.append((key,datetime.datetime.utcnow()+datetime.timedelta(0,time_delay)))

        #ip = request.environ.get('REMOTE_ADDR')
        ip = request.environ.get('HTTP_X_REAL_IP', request.remote_addr) 
        if user_id:
            # print("ID is",user_id.id)
            login = Login.query.filter_by(related_user_id=user_id.id).first()
            if login:
                if check_password_hash(login.password_hash, json_data['password_hash']):
                    print("found user in login: ",data);
                    access_token = create_access_token(identity=data['user_name'], fresh=True)
                    refresh_token = create_refresh_token(identity=data['user_name'])
                    # Set the JWTs and the CSRF double submit protection cookies
                    # in this response
                    user_membership = Membership.query.filter_by(related_user_id=user_id.id).first()
                    user_id.related_role_id = user_membership.related_role_id
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
                    # clear the failed login counter
                    print("trying to set this ip in memcached:",ip,flush=True)
                    client.set(ip, 0)
                    #print("Called flask_jwt_extended!")
                    resp.status_code = 200
                    return resp
                else:
                    checkBanList(ip)
                    return {'message': 'The username or password is incorrect', 'error': 'true'}, 400
            else:
                checkBanList(ip)
                return {'message': 'The username or password is incorrect', 'error': 'true'}, 400
        else:
            checkBanList(ip)
            return {'message': 'The username or password is incorrect', 'error': 'true'}, 400

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

    #make an api for specific user ID to restrict user access to their own entries
    @admin_required
    def put(self):
        json_data = request.get_json(force=True)
        if not json_data:
               return {'message': 'No input data provided', 'error': 'true'}, 400
        # Validate and deserialize input
        data, errors = login_schema.load(json_data)
        if errors:
            return errors, 422
        login = Login.query.filter_by(id=data['id']).first()
        if not login:
            return {'message': 'Login does not exist', 'error': 'true'}, 400
        login.related_user_id = data['related_user_id']
        login.user_name = data['user_name']
        login.password_hash = data['password_hash']
        db.session.commit()

        result = login_schema.dump(login).data

        return { "status": 'success', 'data': result }, 204

    #make an api for specific user ID to restrict user access to their own entries
    @admin_required
    def delete(self):
        json_data = request.get_json(force=True)
        if not json_data:
               return {'message': 'No input data provided', 'error': 'true'}, 400
        # Validate and deserialize input
        data, errors = login_schema.load(json_data)
        if errors:
            return errors, 422
        login = Login.query.filter_by(id=data['id']).delete()
        db.session.commit()

        result = login_schema.dump(login).data

        return { "status": 'success', 'data': result}, 204