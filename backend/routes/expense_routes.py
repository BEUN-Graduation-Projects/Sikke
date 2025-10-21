from flask import Blueprint, request, jsonify, session
from backend.database.db_setup import db
from backend.models.expense_model import Expense
from backend.models.user_model import User
from backend.utils.calculations import calculate_daily_budget
from datetime import datetime, date

expense_bp = Blueprint('expenses', __name__)


@expense_bp.route('/expenses', methods=['GET'])
def get_expenses():
    """Kullanıcının harcamalarını getir"""
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Yetkisiz erişim'}), 401

    # Filtreleme parametreleri
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    category = request.args.get('category')

    query = Expense.query.filter_by(user_id=user_id)

    if start_date:
        query = query.filter(Expense.date >= datetime.fromisoformat(start_date).date())
    if end_date:
        query = query.filter(Expense.date <= datetime.fromisoformat(end_date).date())
    if category:
        query = query.filter(Expense.category == category)

    expenses = query.order_by(Expense.date.desc()).all()

    return jsonify({
        'expenses': [expense.to_dict() for expense in expenses]
    }), 200


@expense_bp.route('/expenses', methods=['POST'])
def add_expense():
    """Yeni harcama ekle"""
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Yetkisiz erişim'}), 401

    try:
        data = request.get_json()

        expense = Expense(
            user_id=user_id,
            amount=float(data['amount']),
            category=data['category'],
            description=data.get('description', ''),
            date=datetime.fromisoformat(data.get('date', date.today().isoformat())).date()
        )

        db.session.add(expense)
        db.session.commit()

        # Güncel günlük bütçeyi hesapla
        user = User.query.get(user_id)
        daily_budget = calculate_daily_budget(user)

        return jsonify({
            'message': 'Harcama başarıyla eklendi',
            'expense': expense.to_dict(),
            'daily_budget': daily_budget
        }), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@expense_bp.route('/expenses/<int:expense_id>', methods=['PUT', 'DELETE'])
def manage_expense(expense_id):
    """Harcama güncelle veya sil"""
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Yetkisiz erişim'}), 401

    expense = Expense.query.filter_by(id=expense_id, user_id=user_id).first()
    if not expense:
        return jsonify({'error': 'Harcama bulunamadı'}), 404

    if request.method == 'PUT':
        try:
            data = request.get_json()

            if 'amount' in data:
                expense.amount = float(data['amount'])
            if 'category' in data:
                expense.category = data['category']
            if 'description' in data:
                expense.description = data['description']
            if 'date' in data:
                expense.date = datetime.fromisoformat(data['date']).date()

            db.session.commit()

            return jsonify({
                'message': 'Harcama güncellendi',
                'expense': expense.to_dict()
            }), 200

        except Exception as e:
            return jsonify({'error': str(e)}), 500

    elif request.method == 'DELETE':
        db.session.delete(expense)
        db.session.commit()

        return jsonify({'message': 'Harcama silindi'}), 200