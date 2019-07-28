from flask import Blueprint
from flask_restful import Api
from resources.User import UserResource
from resources.Login import LoginResource
from resources.Account import AccountResource
from resources.Membership import MembershipResource
from resources.Entry import EntryResource, UserEntryResource
from resources.Comment import CommentResource
from resources.Category import CategoryResource
api_bp = Blueprint('api', __name__)
api = Api(api_bp)

# Route
api.add_resource(UserResource, '/User')
api.add_resource(LoginResource, '/Login')
api.add_resource(AccountResource, '/Account')
api.add_resource(MembershipResource, '/Membership')
api.add_resource(EntryResource, '/Entry')
api.add_resource(UserEntryResource, '/Entry/<user_id>')
api.add_resource(CommentResource, '/Comment')
api.add_resource(CategoryResource, '/Category')