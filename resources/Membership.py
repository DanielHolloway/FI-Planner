from flask import request
from flask_restful import Resource
from Model import db, Membership, MembershipSchema
from flask_jwt_extended import (create_access_token, create_refresh_token,
                                jwt_required, jwt_refresh_token_required, get_jwt_identity)

memberships_schema = MembershipSchema(many=True)
membership_schema = MembershipSchema()

class MembershipResource(Resource):
    def get(self):
        memberships = Membership.query.all()
        memberships = memberships_schema.dump(memberships).data
        return {'status': 'success', 'data': memberships}, 200

    def post(self):
        json_data = request.get_json(force=True)
        if not json_data:
               return {'message': 'No input data provided'}, 400
        # Validate and deserialize input
        data, errors = membership_schema.load(json_data)
        if errors:
            return errors, 422
        # membership = Membership.query.filter_by(name=data['name']).first()
        # if membership:
        #     return {'message': 'Membership already exists'}, 400
        membership = Membership(
            related_user_id=json_data['related_user_id'],
            related_account_id=json_data['related_account_id'],
            related_role_id=json_data['related_role_id'],
            account_email_address=json_data['account_email_address'],
            account_phone_number=json_data['account_phone_number']
            )

        db.session.add(membership)
        db.session.commit()

        result = membership_schema.dump(membership).data

        return { "status": 'success', 'data': result }, 201

    def put(self):
        json_data = request.get_json(force=True)
        if not json_data:
               return {'message': 'No input data provided'}, 400
        # Validate and deserialize input
        data, errors = membership_schema.load(json_data)
        if errors:
            return errors, 422
        membership = Membership.query.filter_by(id=data['id']).first()
        if not membership:
            return {'message': 'Membership does not exist'}, 400
        membership.related_user_id = data['related_user_id']
        membership.related_account_id = data['related_account_id']
        membership.related_role_id = data['related_role_id']
        membership.account_email_address = data['account_email_address']
        membership.account_phone_number = data['account_phone_number']
        db.session.commit()

        result = membership_schema.dump(membership).data

        return { "status": 'success', 'data': result }, 204

    def delete(self):
        json_data = request.get_json(force=True)
        if not json_data:
               return {'message': 'No input data provided'}, 400
        # Validate and deserialize input
        data, errors = membership_schema.load(json_data)
        if errors:
            return errors, 422
        membership = Membership.query.filter_by(id=data['id']).delete()
        db.session.commit()

        result = membership_schema.dump(membership).data

        return { "status": 'success', 'data': result}, 204