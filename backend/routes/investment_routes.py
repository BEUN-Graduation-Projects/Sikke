from flask import Blueprint, request, jsonify, session
from backend.database.db_setup import db
from backend.models.investment_model import Investment
from backend.models.user_model import User
from backend.services.investment_service import InvestmentService
from backend.services.budget_service import BudgetService
from datetime import datetime, date

investment_bp = Blueprint('investments', __name__)


@investment_bp.route('/investments', methods=['GET'])
def get_investments():
    """Kullanıcının yatırımlarını getir"""
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Yetkisiz erişim'}), 401

    investments = Investment.query.filter_by(user_id=user_id).order_by(Investment.date.desc()).all()

    total_invested = sum(inv.amount for inv in investments)
    total_current = sum(inv.calculate_current_value() for inv in investments)

    return jsonify({
        'investments': [inv.to_dict() for inv in investments],
        'summary': {
            'total_invested': total_invested,
            'total_current_value': total_current,
            'total_profit': total_current - total_invested,
            'profit_percentage': round(((total_current / total_invested) - 1) * 100, 2) if total_invested > 0 else 0
        }
    }), 200


@investment_bp.route('/investments/recommendations', methods=['GET'])
def get_recommendations():
    """Yatırım önerilerini getir"""
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Yetkisiz erişim'}), 401

    try:
        # Kullanıcının kalan bütçesini hesapla
        overview = BudgetService.get_user_financial_overview(User.query.get(user_id))
        available_amount = overview['remaining_budget'] * 0.3  # %30'u yatırım için

        recommendations = InvestmentService.generate_investment_recommendations(available_amount)

        return jsonify({
            'recommendations': recommendations,
            'available_amount': available_amount
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@investment_bp.route('/investments/simulate', methods=['POST'])
def simulate_investment():
    """Yatırım simülasyonu yap"""
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Yetkisiz erişim'}), 401

    try:
        data = request.get_json()

        simulation = InvestmentService.simulate_investment_purchase(
            data['asset_symbol'],
            float(data['amount'])
        )

        if not simulation:
            return jsonify({'error': 'Geçersiz yatırım aracı'}), 400

        # Simülasyonu veritabanına kaydet (paper trading)
        investment = Investment(
            user_id=user_id,
            asset_name=simulation['asset_name'],
            asset_symbol=simulation['asset_symbol'],
            amount=simulation['amount'],
            simulated_price=simulation['simulated_price'],
            units=simulation['units'],
            date=date.today()
        )

        db.session.add(investment)
        db.session.commit()

        return jsonify({
            'message': 'Yatırım simülasyonu başarılı',
            'investment': investment.to_dict()
        }), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500