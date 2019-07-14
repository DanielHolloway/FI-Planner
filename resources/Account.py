from flask import request
from flask_restful import Resource
from Model import db, Account, AccountSchema

accounts_schema = AccountSchema(many=True)
account_schema = AccountSchema()

class AccountResource(Resource):
    def get(self):
        accounts = Account.query.all()
        accounts = accounts_schema.dump(accounts).data
        return {'status': 'success', 'data': accounts}, 200

    def post(self):
        json_data = request.get_json(force=True)
        if not json_data:
               return {'message': 'No input data provided'}, 400
        # Validate and deserialize input
        data, errors = account_schema.load(json_data)
        if errors:
            return errors, 422
        # account = Account.query.filter_by(name=data['name']).first()
        # if account:
        #     return {'message': 'Account already exists'}, 400
        account = Account(
            name=json_data['name'],
            plan_level=json_data['plan_level']
            )

        db.session.add(account)
        db.session.commit()

        result = account_schema.dump(account).data

        return { "status": 'success', 'data': result }, 201

    def put(self):
        json_data = request.get_json(force=True)
        if not json_data:
               return {'message': 'No input data provided'}, 400
        # Validate and deserialize input
        data, errors = account_schema.load(json_data)
        if errors:
            return errors, 422
        account = Account.query.filter_by(id=data['id']).first()
        if not account:
            return {'message': 'Account does not exist'}, 400
        account.name = data['name']
        account.plan_level = data['plan_level']
        db.session.commit()

        result = account_schema.dump(account).data

        return { "status": 'success', 'data': result }, 204

    def delete(self):
        json_data = request.get_json(force=True)
        if not json_data:
               return {'message': 'No input data provided'}, 400
        # Validate and deserialize input
        data, errors = account_schema.load(json_data)
        if errors:
            return errors, 422
        account = Account.query.filter_by(id=data['id']).delete()
        db.session.commit()

        result = account_schema.dump(account).data

        return { "status": 'success', 'data': result}, 204