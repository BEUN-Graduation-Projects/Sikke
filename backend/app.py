from flask import Flask, session, jsonify
from backend.config import Config
from backend.database.db_setup import init_db
from backend.routes.auth_routes import auth_bp
from backend.routes.expense_routes import expense_bp
from backend.routes.goal_routes import goal_bp
from backend.routes.investment_routes import investment_bp
from backend.routes.dashboard_routes import dashboard_bp
import os


def create_app():
    app = Flask(__name__,
                static_folder='../frontend',
                template_folder='../frontend')

    app.config.from_object(Config)

    # Veritabanı başlatma
    init_db(app)

    # Blueprint'leri kaydet
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(expense_bp, url_prefix='/api')
    app.register_blueprint(goal_bp, url_prefix='/api')
    app.register_blueprint(investment_bp, url_prefix='/api')
    app.register_blueprint(dashboard_bp, url_prefix='/api')

    # Ana sayfa route'u
    @app.route('/')
    def index():
        return app.send_static_file('index.html')

    # Frontend dosyaları için route'lar
    @app.route('/<path:path>')
    def static_files(path):
        return app.send_static_file(path)

    # Session kontrolü
    @app.before_request
    def check_session():
        # Auth gerektirmeyen route'lar
        public_routes = ['/api/auth/login', '/api/auth/register', '/']

        if request.path in public_routes or request.path.startswith('/static/'):
            return

        if 'user_id' not in session:
            return jsonify({'error': 'Yetkisiz erişim'}), 401

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)