from templates import create_app

app = create_app('configurations')
#Load this config object for development mode

app.config.from_object('configurations.DevelopmentConfig')

# import os
# files = [f for f in os.listdir('.') if os.path.isfile(f)]
# for f in files:
#     print(f)


app.run() # use this for https locally, but it's very slow: app.run(ssl_context=('cert.pem', 'key.pem'))