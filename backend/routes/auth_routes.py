from flask import Blueprint, request, jsonify, session
from backend.database.db_setup import db
from backend.models.user_model import User
import jwt
import datetime

auth_bp = Blueprint('auth', __name__)

# Simple JWT secret for demo
JWT_SECRET = 'sikke-demo-secret-2024'


@auth_bp.route('/auth/login', methods=['POST'])
def login():
    """Kullanıcı giriş endpoint'i"""
    try:
        data = request.get_json()

        # Demo kullanıcı kontrolü
        if data.get('email') == 'demo@sikke.com' and data.get('password') == 'demo123':
            user_data = {
                'id': 1,
                'email': 'demo@sikke.com',
                'monthly_income': 15000.0,
                'fixed_expenses': 7500.0
            }

            # Create JWT token
            token = jwt.encode({
                'user_id': user_data['id'],
                'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)
            }, JWT_SECRET, algorithm='HS256')

            return jsonify({
                'message': 'Giriş başarılı',
                'token': token,
                'user': user_data
            }), 200

        user = User.query.filter_by(email=data.get('email')).first()

        if user and user.check_password(data.get('password', '')):
            # Create user data
            user_data = user.to_dict()

            # Create JWT token
            token = jwt.encode({
                'user_id': user.id,
                'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)
            }, JWT_SECRET, algorithm='HS256')

            return jsonify({
                'message': 'Giriş başarılı',
                'token': token,
                'user': user_data
            }), 200
        else:
            return jsonify({'error': 'Geçersiz email veya şifre'}), 401

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@auth_bp.route('/auth/register', methods=['POST'])
def register():
    """Kullanıcı kayıt endpoint'i"""
    try:
        data = request.get_json()

        # Validasyon
        if not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Email ve şifre gereklidir'}), 400

        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Bu email ile zaten kayıtlı kullanıcı var'}), 400

        # Yeni kullanıcı oluştur
        user = User(
            email=data['email'],
            monthly_income=data.get('monthly_income', 0),
            fixed_expenses=data.get('fixed_expenses', 0)
        )
        user.set_password(data['password'])

        db.session.add(user)
        db.session.commit()

        # Create JWT token
        token = jwt.encode({
            'user_id': user.id,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)
        }, JWT_SECRET, algorithm='HS256')

        return jsonify({
            'message': 'Kullanıcı başarıyla kaydedildi',
            'token': token,
            'user': user.to_dict()
        }), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@auth_bp.route('/auth/profile', methods=['GET'])
def get_profile():
    """Kullanıcı profilini getir"""
    try:
        token = request.headers.get('Authorization', '').replace('Bearer ', '')

        if not token:
            return jsonify({'error': 'Token gereklidir'}), 401

        # Verify token
        payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
        user = User.query.get(payload['user_id'])

        if not user:
            return jsonify({'error': 'Kullanıcı bulunamadı'}), 404

        return jsonify({'user': user.to_dict()}), 200

    except jwt.ExpiredSignatureError:
        return jsonify({'error': 'Token süresi dolmuş'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'error': 'Geçersiz token'}), 401
    except Exception as e:
        return jsonify({'error': str(e)}), 500