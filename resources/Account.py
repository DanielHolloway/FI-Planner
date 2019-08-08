from flask import request, current_app
from flask_restful import Resource
from Model import db, Account, AccountSchema
from flask_jwt_extended import (create_access_token, create_refresh_token,
                                jwt_required, jwt_refresh_token_required, get_jwt_identity)
from templates import admin_required

accounts_schema = AccountSchema(many=True)
account_schema = AccountSchema()

class AccountResource(Resource):
    #make an api for specific user ID to restrict user access to their own entries
    @admin_required
    def get(self):
        current_app.logger.info('Processing Account GET')
        accounts = Account.query.all()
        accounts = accounts_schema.dump(accounts).data
        return {'status': 'success', 'data': accounts}, 200

    @jwt_required
    def post(self):
        current_app.logger.info('Processing Account POST')
        json_data = request.get_json(force=True)
        if not json_data:
            current_app.logger.error('No input data given to Account POST')
            return {'message': 'No input data provided', 'error': 'true'}, 400
        # Validate and deserialize input
        data, errors = account_schema.load(json_data)
        if errors:
            current_app.logger.error('Bad data given to Account POST')
            return errors, 422
        # account = Account.query.filter_by(name=data['name']).first()
        # if account:
        #     return {'message': 'Account already exists', 'error': 'true'}, 400
        account = Account(
            name=json_data['name'],
            plan_level=json_data['plan_level']
            )

        db.session.add(account)
        db.session.commit()

        result = account_schema.dump(account).data

        current_app.logger.info('Successful Account POST')
        return { "status": 'success', 'data': result }, 201

    #make an api for specific user ID to restrict user access to their own entries
    @admin_required
    def put(self):
        current_app.logger.info('Processing Account PUT')
        json_data = request.get_json(force=True)
        if not json_data:
            current_app.logger.error('No input data given to Account PUT')
            return {'message': 'No input data provided', 'error': 'true'}, 400
        # Validate and deserialize input
        data, errors = account_schema.load(json_data)
        if errors:
            current_app.logger.error('Bad data given to Account PUT')
            return errors, 422
        account = Account.query.filter_by(id=data['id']).first()
        if not account:
            current_app.logger.error('Selection not found in Account PUT')
            return {'message': 'Account does not exist', 'error': 'true'}, 400
        account.name = data['name']
        account.plan_level = data['plan_level']
        db.session.commit()

        result = account_schema.dump(account).data

        current_app.logger.info('Successful Account PUT')
        return { "status": 'success', 'data': result }, 204

    #make an api for specific user ID to restrict user access to their own entries
    @admin_required
    def delete(self):
        current_app.logger.info('Processing Account DELETE')
        json_data = request.get_json(force=True)
        if not json_data:
            current_app.logger.error('No input data given to Account DELETE')
            return {'message': 'No input data provided', 'error': 'true'}, 400
        # Validate and deserialize input
        data, errors = account_schema.load(json_data)
        if errors:
            current_app.logger.error('Bad data given to Account DELETE')
            return errors, 422
        account = Account.query.filter_by(id=data['id']).delete()
        db.session.commit()

        result = account_schema.dump(account).data

        current_app.logger.info('Successful Account DELETE')
        return { "status": 'success', 'data': result}, 204