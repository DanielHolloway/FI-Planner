from flask import jsonify, request
from flask_restful import Resource
from Model import db, Comment, Entry, CommentSchema
from flask_jwt_extended import (create_access_token, create_refresh_token,
                                jwt_required, jwt_refresh_token_required, get_jwt_identity)

comments_schema = CommentSchema(many=True)
comment_schema = CommentSchema()

class CommentResource(Resource):
    @jwt_required
    def get(self):
        comments = Comment.query.all()
        comments = comments_schema.dump(comments).data
        return {"status":"success", "data":comments}, 200

    @jwt_required
    def post(self):
        json_data = request.get_json(force=True)
        if not json_data:
               return {'message': 'No input data provided'}, 400
        # Validate and deserialize input
        data, errors = comment_schema.load(json_data)
        if errors:
            return {"status": "error", "data": errors}, 422
        entry_id = Entry.query.filter_by(id=data['entry_id']).first()
        if not entry_id:
            return {'status': 'error', 'message': 'comment entry not found'}, 400
        comment = Comment(
            entry_id=data['entry_id'], 
            comment=data['comment']
            )
        db.session.add(comment)
        db.session.commit()

        result = comment_schema.dump(comment).data

        return {'status': "success", 'data': result}, 201

    # You can add the other methods here...