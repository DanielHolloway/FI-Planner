from flask import request
from flask_restful import Resource
from Model import db, Entry, EntrySchema
from flask_jwt_extended import (create_access_token, create_refresh_token,
                                jwt_required, jwt_refresh_token_required, get_jwt_identity)

entries_schema = EntrySchema(many=True)
entry_schema = EntrySchema()


class UserEntryResource(Resource):
    @jwt_required
    def get(self, user_id):
        print("hit the get",user_id)
        entries = Entry.query.filter(Entry.related_user_id == user_id).all()
        entries = entries_schema.dump(entries).data
        return {'status': 'success', 'data': entries}, 200

class EntryResource(Resource):
    @jwt_required
    def get(self):
        print("hit the get")
        entries = Entry.query.all()
        entries = entries_schema.dump(entries).data
        return {'status': 'success', 'data': entries}, 200

    @jwt_required
    def post(self):
        json_data = request.get_json(force=True)
        if not json_data:
               return {'message': 'No input data provided'}, 400
        # Validate and deserialize input
        data, errors = entry_schema.load(json_data)
        if errors:
            return errors, 422
        # entry = Entry.query.filter_by(name=data['name']).first()
        # if entry:
        #     return {'message': 'Entry already exists'}, 400
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

        return { "status": 'success', 'data': result }, 201

    @jwt_required
    def put(self):
        json_data = request.get_json(force=True)
        if not json_data:
               return {'message': 'No input data provided'}, 400
        # Validate and deserialize input
        data, errors = entry_schema.load(json_data)
        if errors:
            return errors, 422
        entry = Entry.query.filter_by(id=data['id']).first()
        if not entry:
            return {'message': 'Entry does not exist'}, 400
        entry.name = data['name']
        entry.category = data['category']
        entry.month = data['month']
        entry.amount = data['amount']
        entry.related_user_id = data['related_user_id']
        db.session.commit()

        result = entry_schema.dump(entry).data

        return { "status": 'success', 'data': result }, 204

    @jwt_required
    def delete(self):
        json_data = request.get_json(force=True)
        if not json_data:
               return {'message': 'No input data provided'}, 400
        # Validate and deserialize input
        data, errors = entry_schema.load(json_data)
        if errors:
            return errors, 422
        entry = Entry.query.filter_by(id=data['id']).delete()
        db.session.commit()

        result = entry_schema.dump(entry).data

        return { "status": 'success', 'data': result}, 204