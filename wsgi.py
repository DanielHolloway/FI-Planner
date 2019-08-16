from templates import create_app

app = create_app('configurations')
#Load this config object for development mode

app.config.from_object('configurations.ProductionConfig')

if __name__ == "__main__":
    app.run()
