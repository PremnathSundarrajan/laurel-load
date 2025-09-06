from flask import Flask
from config import DEBUG, MONGO_URI
from routes.auth_routes import auth_bp
from routes.device_routes import device_bp
from routes.scan_routes import scan_bp
from routes.cve_routes import cve_bp

def create_app():
    app = Flask(__name__)

    # Config
    app.config["DEBUG"] = DEBUG

    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(device_bp)
    app.register_blueprint(scan_bp)
    app.register_blueprint(cve_bp)

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=3000, debug=DEBUG)
