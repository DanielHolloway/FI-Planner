from flask import request, g, current_app
from flask_restful import Resource
from Model import db, Entry, EntrySchema
from flask_jwt_extended import (create_access_token, create_refresh_token,
                                jwt_required, jwt_refresh_token_required, get_jwt_identity)
from templates import admin_required

entries_schema = EntrySchema(many=True)
entry_schema = EntrySchema()

class UserEntryResource(Resource):
    @jwt_required
    def get(self, user_id):
        current_app.logger.info('Processing UserEntry GET')
        entries = Entry.query.filter(Entry.related_user_id == user_id).all()
        entries = entries_schema.dump(entries).data
        return {'status': 'success', 'data': entries}, 200

class EntryResource(Resource):
    @admin_required
    def get(self):
        current_app.logger.info('Processing Entry GET')
        entries = Entry.query.all()
        entries = entries_schema.dump(entries).data
        return {'status': 'success', 'data': entries}, 200

    @jwt_required
    def post(self):
        current_app.logger.info('Processing Entry POST')
        json_data = request.get_json(force=True)
        if not json_data:
            current_app.logger.error('No input data given to Entry POST')
            return {'message': 'No input data provided', 'error': 'true'}, 400
        # Validate and deserialize input
        data, errors = entry_schema.load(json_data)
        if errors:
            current_app.logger.error('Bad data given to Entry POST')
            return errors, 422
        # entry = Entry.query.filter_by(name=data['name']).first()
        # if entry:
        #     return {'message': 'Entry already exists', 'error': 'true'}, 400
        entry = Entry(
            name=json_data['name'],
            category=json_data['category'],
            month=json_data['month'],
            amount=json_data['amount'],
            related_user_id=json_data['related_user_id']
            )

        db.session.add(entry)
        db.session.commit()

        result = entry_schema.dump(entry).data

        current_app.logger.info('Successful Entry POST')
        return { "status": 'success', 'data': result }, 201

    #make a specific put for specific user ID to restrict user access to their own entries
    @admin_required
    def put(self):
        current_app.logger.info('Processing Entry PUT')
        json_data = request.get_json(force=True)
        if not json_data:
            current_app.logger.error('No input data given to Entry PUT')
            return {'message': 'No input data provided', 'error': 'true'}, 400
        # Validate and deserialize input
        data, errors = entry_schema.load(json_data)
        if errors:
            current_app.logger.error('Bad data given to Entry PUT')
            return errors, 422
        entry = Entry.query.filter_by(id=data['id']).first()
        if not entry:
            current_app.logger.error('Selection not found in Entry PUT')
            return {'message': 'Entry does not exist', 'error': 'true'}, 400
        entry.name = data['name']
        entry.category = data['category']
        entry.month = data['month']
        entry.amount = data['amount']
        entry.related_user_id = data['related_user_id']
        db.session.commit()

        result = entry_schema.dump(entry).data

        current_app.logger.info('Successful Entry PUT')
        return { "status": 'success', 'data': result }, 204

    #make an api for specific user ID to restrict user access to their own entries
    @admin_required
    def delete(self):
        current_app.logger.info('Processing Entry DELETE')
        json_data = request.get_json(force=True)
        if not json_data:
            current_app.logger.error('No input data given to Entry DELETE')
            return {'message': 'No input data provided', 'error': 'true'}, 400
        # Validate and deserialize input
        data, errors = entry_schema.load(json_data)
        if errors:
            current_app.logger.error('Bad data given to Entry DELETE')
            return errors, 422
        entry = Entry.query.filter_by(id=data['id']).delete()
        db.session.commit()

        result = entry_schema.dump(entry).data

        current_app.logger.info('Successful Entry DELETE')
        return { "status": 'success', 'data': result}, 204