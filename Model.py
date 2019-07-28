from flask import Flask
from marshmallow import Schema, fields, pre_load, validate, validates, ValidationError
from flask_marshmallow import Marshmallow
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin
from pymemcache.client import base
from pymemcache import serde
from templates import ip_ban_list

# Don't forget to run `memcached' before running this next line:
client = base.Client(('localhost', 11211),
    serializer=serde.python_memcache_serializer,
    deserializer=serde.python_memcache_deserializer)

ma = Marshmallow()
db = SQLAlchemy()


class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(150), nullable=False)
    last_name = db.Column(db.String(150), nullable=False)
    user_name = db.Column(db.String(150), unique=True, nullable=False)

    def __init__(self, first_name, last_name, user_name):
        self.first_name = first_name
        self.last_name = last_name
        self.user_name = user_name

class UserSchema(ma.Schema):
    id = fields.Integer()
    first_name = fields.String(required=True)
    last_name = fields.String(required=True)
    user_name = fields.String(required=True)
    
class Login(UserMixin, db.Model):
    __tablename__ = 'logins'
    id = db.Column(db.Integer, primary_key=True)
    user_name = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.String(640))
    related_user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    user = db.relationship('User', backref=db.backref('logins', lazy='dynamic' ))

    def __init__(self, user_name, password_hash, related_user_id):
        self.user_name = user_name
        self.password_hash = password_hash
        self.related_user_id = related_user_id

class LoginSchema(ma.Schema):
    id = fields.Integer(dump_only=True)
    related_user_id = fields.Integer(required=True)
    user_name = fields.String(required=True)
    password_hash = fields.String(required=True)

class Account(db.Model):
    __tablename__ = 'accounts'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    plan_level = db.Column(db.String(150), nullable=False)

    def __init__(self, name, plan_level):
        self.name = name
        self.plan_level = plan_level

class AccountSchema(ma.Schema):
    id = fields.Integer()
    name = fields.String(required=True)
    plan_level = fields.String(required=True)

class Membership(db.Model):
    __tablename__ = 'memberships'
    id = db.Column(db.Integer, primary_key=True)
    related_user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    related_account_id = db.Column(db.Integer, db.ForeignKey('accounts.id', ondelete='CASCADE'), nullable=False)
    related_role_id = db.Column(db.Integer)
    account_email_address = db.Column(db.String(150), nullable=False)
    account_phone_number = db.Column(db.String(16), nullable=False)
    user = db.relationship('User', backref=db.backref('memberships', lazy='dynamic' ))

    def __init__(self, related_user_id, related_account_id, related_role_id, account_email_address, account_phone_number):
        self.related_user_id = related_user_id
        self.related_account_id = related_account_id
        self.related_role_id = related_role_id
        self.account_email_address = account_email_address
        self.account_phone_number = account_phone_number

class MembershipSchema(ma.Schema):
    id = fields.Integer(dump_only=True)
    related_user_id = fields.Integer(required=True)
    related_account_id = fields.Integer(required=True)
    related_role_id = fields.Integer()
    account_email_address = fields.String(required=True)
    account_phone_number = fields.String()
    
class Entry(db.Model):
    __tablename__ = 'entries'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    category = db.Column(db.String(150), nullable=False)
    month = db.Column(db.String(150), nullable=False)
    amount = db.Column(db.Integer)
    related_user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    user = db.relationship('User', backref=db.backref('entries', lazy='dynamic' ))

    def __init__(self, name, category, month, amount, related_user_id):
        self.name = name
        self.category = category
        self.month = month
        self.amount = amount
        self.related_user_id = related_user_id

class EntrySchema(ma.Schema):
    id = fields.Integer(dump_only=True)
    name = fields.String(required=True)
    category = fields.String(required=True)
    month = fields.String(required=True)
    amount = fields.Integer(required=True)
    related_user_id = fields.Integer(required=True)

    @validates("name")
    def validate_name(self, value):
        if not value:
            raise ValidationError("Name must not be blank.")

class Comment(db.Model):
    __tablename__ = 'comments'
    id = db.Column(db.Integer, primary_key=True)
    comment = db.Column(db.String(250), nullable=False)
    creation_date = db.Column(db.TIMESTAMP, server_default=db.func.current_timestamp(), nullable=False)
    entry_id = db.Column(db.Integer, db.ForeignKey('entries.id', ondelete='CASCADE'), nullable=False)
    entry = db.relationship('Entry', backref=db.backref('comments', lazy='dynamic' ))

    def __init__(self, comment, entry_id):
        self.comment = comment
        self.entry_id = entry_id

class CommentSchema(ma.Schema):
    id = fields.Integer(dump_only=True)
    entry_id = fields.Integer(required=True)
    comment = fields.String(required=True, validate=validate.Length(1))
    creation_date = fields.DateTime()

class Category(db.Model):
    __tablename__ = 'categories'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), unique=True, nullable=False)

    def __init__(self, name):
        self.name = name

class CategorySchema(ma.Schema):
    id = fields.Integer()
    name = fields.String(required=True)


print("passed classes")