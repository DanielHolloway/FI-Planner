import os
import datetime
from flask import request, jsonify, g, current_app, redirect, session
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
        current_app.logger.info('Processing LoginRefresh POST')
        # Create the new access token
        current_user = get_jwt_identity()
        access_token = create_access_token(identity=current_user, fresh=False)
        if not access_token:
            current_app.logger.error('Access token failed in LoginRefresh POST')
            return {'message': 'Access token failed', 'error': 'true'}, 400
        # Set the access JWT and CSRF double submit protection cookies
        # in this response
        user_id = User.query.filter_by(user_name=current_user).first()
        if not user_id:
            current_app.logger.error('User not found in LoginRefresh POST')
            return {'message': 'Refresh user does not exist', 'error': 'true'}, 400
        user_membership = Membership.query.filter_by(related_user_id=user_id.id).first()
        if not user_membership:
            current_app.logger.error('Membership not found in LoginRefresh POST')
            return {'message': 'Refresh membership does not exist', 'error': 'true'}, 400
        if user_membership.verified != 1:
            current_app.logger.error('Membership not verified in LoginRefresh POST')
            return {'message': 'Account must be verified before login', 'error': 'true'}, 400
        user_id.related_role_id = user_membership.related_role_id
        login_user(user_id)
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
        current_app.logger.info('Successful LoginRefresh POST')
        return resp

    #@jwt_refresh_token_required
    def delete(self):
        current_app.logger.info('Processing LoginRefresh DELETE')
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
        current_app.logger.info('Processing Login POST')
        json_data = request.get_json(force=True)
        if not json_data:
            current_app.logger.error('No input data given to Login POST')
            return {'message': 'No input data provided', 'error': 'true'}, 400
        #why do we set related_user_id? probably re-work this line
        json_data['related_user_id'] = 0
        # Validate and deserialize input
        data, errors = login_schema.load(json_data)
        if errors:
            current_app.logger.error('Bad data given to Login POST')
            return errors, 422
        user_id = User.query.filter_by(user_name=data['user_name']).first()

        def checkBanList(key):
            count = client.get(key)
            if count is None:
                count = 0
            count += 1
            client.set(key, count)
            if count >= 3:
                logStr = '!!!BAD VISITOR: Incrementing Blacklist for '+key
                current_app.logger.info(logStr)
                time_delay = 15 * (2**(count-3))
                ip_ban_list.append((key,datetime.datetime.utcnow()+datetime.timedelta(0,time_delay)))

        ip = request.environ.get('HTTP_X_REAL_IP', request.remote_addr) 
        if user_id:
            login = Login.query.filter_by(related_user_id=user_id.id).first()
            if login:
                if check_password_hash(login.password_hash, json_data['password_hash']):
                    access_token = create_access_token(identity=data['user_name'], fresh=True)
                    refresh_token = create_refresh_token(identity=data['user_name'])
                    # Set the JWTs and the CSRF double submit protection cookies
                    # in this response
                    user_membership = Membership.query.filter_by(related_user_id=user_id.id).first()
                    if not user_membership:
                        current_app.logger.error('Membership not found in Login POST')
                        return {'message': 'Login membership does not exist', 'error': 'true'}, 400
                    user_id.related_role_id = user_membership.related_role_id
                    if user_membership.verified != 1:
                        current_app.logger.error('Membership not verified in Login POST')
                        #redirect("/verify", code=302)
                        session['phone'] = user_membership.account_phone_number
                        return {'message': 'Account must be verified before login', 'error': 'true'}, 417
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
                    client.set(ip, 0)
                    resp.status_code = 200
                    return resp
                else:
                    checkBanList(ip)
                    current_app.logger.error('Username or password not found in Login POST')
                    return {'message': 'The username or password is incorrect', 'error': 'true'}, 400
            else:
                checkBanList(ip)
                current_app.logger.error('Username or password not found in Login POST')
                return {'message': 'The username or password is incorrect', 'error': 'true'}, 400
        else:
            checkBanList(ip)
            current_app.logger.error('Username or password not found in Login POST')
            return {'message': 'The username or password is incorrect', 'error': 'true'}, 400

        login = Login(
            related_user_id=json_data['related_user_id'],
            user_name=json_data['user_name'],
            password_hash=generate_password_hash(json_data['password_hash'], method='pbkdf2:sha512:100001')
            )

        db.session.add(login)
        db.session.commit()

        result = login_schema.dump(login).data

        current_app.logger.info('Successful Login POST')
        return { "status": 'success', 'data': result }, 201

    #make an api for specific user ID to restrict user access to their own entries
    @admin_required
    def put(self):
        current_app.logger.info('Processing Login PUT')
        json_data = request.get_json(force=True)
        if not json_data:
            current_app.logger.error('No input data given to Login PUT')
            return {'message': 'No input data provided', 'error': 'true'}, 400
        # Validate and deserialize input
        data, errors = login_schema.load(json_data)
        if errors:
            current_app.logger.error('Bad data given to Login PUT')
            return errors, 422
        login = Login.query.filter_by(id=data['id']).first()
        if not login:
            current_app.logger.error('Selection not found in Login PUT')
            return {'message': 'Login does not exist', 'error': 'true'}, 400
        login.related_user_id = data['related_user_id']
        login.user_name = data['user_name']
        login.password_hash = data['password_hash']
        db.session.commit()

        result = login_schema.dump(login).data

        current_app.logger.info('Successful Login PUT')
        return { "status": 'success', 'data': result }, 204

    #make an api for specific user ID to restrict user access to their own entries
    @admin_required
    def delete(self):
        current_app.logger.info('Processing Login DELETE')
        json_data = request.get_json(force=True)
        if not json_data:
            current_app.logger.error('No input data given to Login DELETE')
            return {'message': 'No input data provided', 'error': 'true'}, 400
        # Validate and deserialize input
        data, errors = login_schema.load(json_data)
        if errors:
            current_app.logger.error('Bad data given to Login DELETE')
            return errors, 422
        login = Login.query.filter_by(id=data['id']).delete()
        db.session.commit()

        result = login_schema.dump(login).data

        current_app.logger.info('Successful Login DELETE')
        return { "status": 'success', 'data': result}, 204