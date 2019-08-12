from flask import request, current_app
from flask_restful import Resource
from Model import db, Membership, MembershipSchema
from flask_jwt_extended import (create_access_token, create_refresh_token,
                                jwt_required, jwt_refresh_token_required, get_jwt_identity)
from templates import admin_required

memberships_schema = MembershipSchema(many=True)
membership_schema = MembershipSchema()

class MembershipResource(Resource):
    #make an api for specific user ID to restrict user access to their own entries
    @admin_required
    def get(self):
        current_app.logger.info('Processing Membership GET')
        memberships = Membership.query.all()
        memberships = memberships_schema.dump(memberships).data
        return {'status': 'success', 'data': memberships}, 200

    @jwt_required
    def post(self):
        current_app.logger.info('Processing Membership POST')
        json_data = request.get_json(force=True)
        if not json_data:
            current_app.logger.error('No input data given to Membership POST')
            return {'message': 'No input data provided', 'error': 'true'}, 400
        # Validate and deserialize input
        data, errors = membership_schema.load(json_data)
        if errors:
            current_app.logger.error('Bad data given to Membership POST')
            return errors, 422
        # membership = Membership.query.filter_by(name=data['name']).first()
        # if membership:
        #     return {'message': 'Membership already exists', 'error': 'true'}, 400
        membership = Membership(
            related_user_id=json_data['related_user_id'],
            related_account_id=json_data['related_account_id'],
            related_role_id=json_data['related_role_id'],
            account_email_address=json_data['account_email_address'],
            account_phone_number=json_data['account_phone_number'],
            verified=json_data['verified']
            )

        db.session.add(membership)
        db.session.commit()

        result = membership_schema.dump(membership).data

        current_app.logger.info('Successful Membership POST')
        return { "status": 'success', 'data': result }, 201

    #make an api for specific user ID to restrict user access to their own entries
    @admin_required
    def put(self):
        current_app.logger.info('Processing Membership PUT')
        json_data = request.get_json(force=True)
        if not json_data:
            current_app.logger.error('No input data given to Membership PUT')
            return {'message': 'No input data provided', 'error': 'true'}, 400
        # Validate and deserialize input
        data, errors = membership_schema.load(json_data)
        if errors:
            current_app.logger.error('Bad data given to Membership PUT')
            return errors, 422
        membership = Membership.query.filter_by(id=data['id']).first()
        if not membership:
            current_app.logger.error('Selection not found in Membership PUT')
            return {'message': 'Membership does not exist', 'error': 'true'}, 400
        membership.related_user_id = data['related_user_id']
        membership.related_account_id = data['related_account_id']
        membership.related_role_id = data['related_role_id']
        membership.account_email_address = data['account_email_address']
        membership.account_phone_number = data['account_phone_number']
        membership.verified = data['verified']
        db.session.commit()

        result = membership_schema.dump(membership).data

        current_app.logger.info('Successful Membership PUT')
        return { "status": 'success', 'data': result }, 204

    #make an api for specific user ID to restrict user access to their own entries
    @admin_required
    def delete(self):
        current_app.logger.info('Processing Membership DELETE')
        json_data = request.get_json(force=True)
        if not json_data:
            current_app.logger.error('No input data given to Membership DELETE')
            return {'message': 'No input data provided', 'error': 'true'}, 400
        # Validate and deserialize input
        data, errors = membership_schema.load(json_data)
        if errors:
            current_app.logger.error('Bad data given to Membership PUT')
            return errors, 422
        membership = Membership.query.filter_by(id=data['id']).delete()
        db.session.commit()

        result = membership_schema.dump(membership).data

        current_app.logger.info('Successful Membership DELETE')
        return { "status": 'success', 'data': result}, 204