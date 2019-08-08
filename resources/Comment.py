from flask import jsonify, request, current_app
from flask_restful import Resource
from Model import db, Comment, Entry, CommentSchema
from flask_jwt_extended import (create_access_token, create_refresh_token,
                                jwt_required, jwt_refresh_token_required, get_jwt_identity)
from templates import admin_required

comments_schema = CommentSchema(many=True)
comment_schema = CommentSchema()

class CommentResource(Resource):
    #make an api for specific user ID to restrict user access to their own entries
    @admin_required
    def get(self):
        current_app.logger.info('Processing Comment GET')
        comments = Comment.query.all()
        comments = comments_schema.dump(comments).data
        return {"status":"success", "data":comments}, 200

    @jwt_required
    def post(self):
        current_app.logger.info('Processing Comment POST')
        json_data = request.get_json(force=True)
        if not json_data:
            current_app.logger.error('No input data given to Comment POST')
            return {'message': 'No input data provided', 'error': 'true'}, 400
        # Validate and deserialize input
        data, errors = comment_schema.load(json_data)
        if errors:
            current_app.logger.error('Bad data given to Comment POST')
            return {"status": "error", "data": errors}, 422
        entry_id = Entry.query.filter_by(id=data['entry_id']).first()
        if not entry_id:
            current_app.logger.error('Parent entry missing in Comment POST')
            return {'status': 'error', 'message': 'comment entry not found', 'error': 'true'}, 400
        comment = Comment(
            entry_id=data['entry_id'], 
            comment=data['comment']
            )
        db.session.add(comment)
        db.session.commit()

        result = comment_schema.dump(comment).data

        current_app.logger.info('Successful Comment POST')
        return {'status': "success", 'data': result}, 201

    # You can add the other methods here...