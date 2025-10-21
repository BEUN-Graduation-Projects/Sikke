from flask import Blueprint, request, jsonify, session
from backend.database.db_setup import db
from backend.models.goal_model import Goal
from backend.utils.calculations import calculate_goal_recommendation
from datetime import datetime

goal_bp = Blueprint('goals', __name__)


@goal_bp.route('/goals', methods=['GET'])
def get_goals():
    """Kullanıcının hedeflerini getir"""
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Yetkisiz erişim'}), 401

    goals = Goal.query.filter_by(user_id=user_id).order_by(Goal.deadline.asc()).all()

    return jsonify({
        'goals': [goal.to_dict() for goal in goals]
    }), 200


@goal_bp.route('/goals', methods=['POST'])
def create_goal():
    """Yeni hedef oluştur"""
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Yetkisiz erişim'}), 401

    try:
        data = request.get_json()

        goal = Goal(
            user_id=user_id,
            name=data['name'],
            target_amount=float(data['target_amount']),
            saved_amount=float(data.get('saved_amount', 0)),
            deadline=datetime.fromisoformat(data['deadline']).date()
        )

        db.session.add(goal)
        db.session.commit()

        # Önerilen günlük tasarruf
        recommended_daily = calculate_goal_recommendation(goal)

        return jsonify({
            'message': 'Hedef başarıyla oluşturuldu',
            'goal': goal.to_dict(),
            'recommended_daily_save': recommended_daily
        }), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@goal_bp.route('/goals/<int:goal_id>', methods=['PUT', 'DELETE'])
def manage_goal(goal_id):
    """Hedef güncelle veya sil"""
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Yetkisiz erişim'}), 401

    goal = Goal.query.filter_by(id=goal_id, user_id=user_id).first()
    if not goal:
        return jsonify({'error': 'Hedef bulunamadı'}), 404

    if request.method == 'PUT':
        try:
            data = request.get_json()

            if 'name' in data:
                goal.name = data['name']
            if 'target_amount' in data:
                goal.target_amount = float(data['target_amount'])
            if 'saved_amount' in data:
                goal.saved_amount = float(data['saved_amount'])
            if 'deadline' in data:
                goal.deadline = datetime.fromisoformat(data['deadline']).date()

            db.session.commit()

            # Güncel öneri
            recommended_daily = calculate_goal_recommendation(goal)

            return jsonify({
                'message': 'Hedef güncellendi',
                'goal': goal.to_dict(),
                'recommended_daily_save': recommended_daily
            }), 200

        except Exception as e:
            return jsonify({'error': str(e)}), 500

    elif request.method == 'DELETE':
        db.session.delete(goal)
        db.session.commit()

        return jsonify({'message': 'Hedef silindi'}), 200


@goal_bp.route('/goals/<int:goal_id>/add-savings', methods=['POST'])
def add_savings(goal_id):
    """Hedefe tasarruf ekle"""
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Yetkisiz erişim'}), 401

    goal = Goal.query.filter_by(id=goal_id, user_id=user_id).first()
    if not goal:
        return jsonify({'error': 'Hedef bulunamadı'}), 404

    try:
        data = request.get_json()
        amount = float(data['amount'])

        goal.saved_amount += amount

        # Hedef tutarı aşmamalı
        if goal.saved_amount > goal.target_amount:
            goal.saved_amount = goal.target_amount

        db.session.commit()

        return jsonify({
            'message': f'₺{amount:.2f} tasarruf eklendi',
            'goal': goal.to_dict()
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500