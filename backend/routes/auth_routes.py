from flask import Blueprint, request, jsonify, session
from backend.database.db_setup import db
from backend.models.user_model import User

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/register', methods=['POST'])
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

        # Oturum aç
        session['user_id'] = user.id

        return jsonify({
            'message': 'Kullanıcı başarıyla kaydedildi',
            'user': user.to_dict()
        }), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    """Kullanıcı giriş endpoint'i"""
    try:
        data = request.get_json()

        user = User.query.filter_by(email=data.get('email')).first()

        if user and user.check_password(data.get('password', '')):
            session['user_id'] = user.id
            return jsonify({
                'message': 'Giriş başarılı',
                'user': user.to_dict()
            }), 200
        else:
            return jsonify({'error': 'Geçersiz email veya şifre'}), 401

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@auth_bp.route('/logout', methods=['POST'])
def logout():
    """Kullanıcı çıkış endpoint'i"""
    session.pop('user_id', None)
    return jsonify({'message': 'Çıkış başarılı'}), 200


@auth_bp.route('/profile', methods=['GET', 'PUT'])
def profile():
    """Kullanıcı profil işlemleri"""
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Yetkisiz erişim'}), 401

    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'Kullanıcı bulunamadı'}), 404

    if request.method == 'GET':
        return jsonify({'user': user.to_dict()}), 200

    elif request.method == 'PUT':
        data = request.get_json()

        if 'monthly_income' in data:
            user.monthly_income = float(data['monthly_income'])
        if 'fixed_expenses' in data:
            user.fixed_expenses = float(data['fixed_expenses'])

        db.session.commit()
        return jsonify({
            'message': 'Profil güncellendi',
            'user': user.to_dict()
        }), 200