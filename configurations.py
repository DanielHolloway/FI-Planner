
# class Config(object):
#     # ...
#     SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
#         'sqlite:///' + os.path.join(basedir, 'app.db')
#     SQLALCHEMY_TRACK_MODIFICATIONS = False
#     DEBUG = True
#     TESTING = False

class BaseConfig(object):
 '''
 Base config class
 '''
 DEBUG = True
 TESTING = False
class ProductionConfig(BaseConfig):
 """
 Production specific config
 """
 DEBUG = False
class DevelopmentConfig(BaseConfig):
 """
 Development environment specific configuration
 """
 DEBUG = True
 TESTING = True