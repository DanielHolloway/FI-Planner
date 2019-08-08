from flask import request, current_app
from flask_restful import Resource
from Model import db, Category, CategorySchema
from flask_jwt_extended import (create_access_token, create_refresh_token,
                                jwt_required, jwt_refresh_token_required, get_jwt_identity)
from templates import admin_required

categories_schema = CategorySchema(many=True)
category_schema = CategorySchema()

class CategoryResource(Resource):
    @jwt_required
    def get(self):
        current_app.logger.info('Processing Account GET')
        categories = Category.query.all()
        categories = categories_schema.dump(categories).data
        return {'status': 'success', 'data': categories}, 200

    #make an api for specific user ID to restrict user access to their own entries
    @admin_required
    def post(self):
        current_app.logger.info('Processing Category POST')
        json_data = request.get_json(force=True)
        if not json_data:
            current_app.logger.error('No input data given to Category POST')
            return {'message': 'No input data provided', 'error': 'true'}, 400
        # Validate and deserialize input
        data, errors = category_schema.load(json_data)
        if errors:
            current_app.logger.error('Bad data given to Category POST')
            return errors, 422
        category = Category.query.filter_by(name=data['name']).first()
        if category:
            current_app.logger.error('Category already exists in Category POST')
            return {'message': 'Category already exists', 'error': 'true'}, 400
        category = Category(
            name=json_data['name']
            )

        db.session.add(category)
        db.session.commit()

        result = category_schema.dump(category).data

        current_app.logger.info('Successful Category POST')
        return { "status": 'success', 'data': result }, 201

    #make an api for specific user ID to restrict user access to their own entries
    @admin_required
    def put(self):
        current_app.logger.info('Processing Category PUT')
        json_data = request.get_json(force=True)
        if not json_data:
            current_app.logger.error('No input data given to Category PUT')
            return {'message': 'No input data provided', 'error': 'true'}, 400
        # Validate and deserialize input
        data, errors = category_schema.load(json_data)
        if errors:
            current_app.logger.error('Bad data given to Category PUT')
            return errors, 422
        category = Category.query.filter_by(id=data['id']).first()
        if not category:
            current_app.logger.error('Selection not found in Category PUT')
            return {'message': 'Category does not exist', 'error': 'true'}, 400
        category.name = data['name']
        db.session.commit()

        result = category_schema.dump(category).data

        current_app.logger.info('Successful Category PUT')
        return { "status": 'success', 'data': result }, 204

    #make an api for specific user ID to restrict user access to their own entries
    @admin_required
    def delete(self):
        current_app.logger.info('Processing Category DELETE')
        json_data = request.get_json(force=True)
        if not json_data:
            current_app.logger.error('No input data given to Category DELETE')
            return {'message': 'No input data provided', 'error': 'true'}, 400
        # Validate and deserialize input
        data, errors = category_schema.load(json_data)
        if errors:
            current_app.logger.error('Bad data given to Category DELETE')
            return errors, 422
        category = Category.query.filter_by(id=data['id']).delete()
        db.session.commit()

        result = category_schema.dump(category).data

        current_app.logger.info('Successful Category DELETE')
        return { "status": 'success', 'data': result}, 204