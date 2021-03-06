from templates import create_app


if __name__ == '__main__':
    app = create_app('configurations')
    #Load this config object for development mode

    app.config.from_object('configurations.DevelopmentConfig')

    app.run() # use this for https locally, but it's very slow: app.run(ssl_context=('cert.pem', 'key.pem'))