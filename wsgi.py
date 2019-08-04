from templates import create_app

app = create_app('configurations')
#Load this config object for development mode

app.config.from_object('configurations.ProductionConfig')
print("set config before guard",flush=True)

if __name__ == "__main__":
    app.run()
