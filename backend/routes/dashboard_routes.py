from flask import Blueprint, request, jsonify, session
from backend.models.user_model import User
from backend.services.budget_service import BudgetService

dashboard_bp = Blueprint('dashboard', __name__)


@dashboard_bp.route('/dashboard/overview', methods=['GET'])
def get_dashboard_overview():
    """Dashboard özet verilerini getir"""
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Yetkisiz erişim'}), 401

    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'Kullanıcı bulunamadı'}), 404

    try:
        overview = BudgetService.get_user_financial_overview(user)

        return jsonify(overview), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@dashboard_bp.route('/dashboard/insights', methods=['GET'])
def get_insights():
    """Finansal insight'ları getir"""
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Yetkisiz erişim'}), 401

    user = User.query.get(user_id)
    overview = BudgetService.get_user_financial_overview(user)

    insights = []

    # Bütçe insight'ları
    if overview['remaining_budget'] < 0:
        insights.append({
            'type': 'warning',
            'title': 'Bütçe Aşımı',
            'message': 'Aylık bütçenizi aştınız! Harcamalarınızı gözden geçirin.'
        })
    elif overview['remaining_budget'] < overview['monthly_income'] * 0.1:
        insights.append({
            'type': 'info',
            'title': 'Bütçe Daralıyor',
            'message': 'Aylık bütçenizin sonlarına yaklaşıyorsunuz.'
        })

    # Tasarruf insight'ları
    savings_ratio = (overview['monthly_income'] - overview['fixed_expenses'] - overview['total_spent']) / overview[
        'monthly_income']
    if savings_ratio > 0.2:
        insights.append({
            'type': 'success',
            'title': 'İyi Tasarruf',
            'message': f'Tasarruf oranınız %{savings_ratio * 100:.1f}. Harika gidiyorsunuz!'
        })

    # Anomali insight'ları
    for anomaly in overview.get('anomalies', []):
        insights.append({
            'type': 'warning',
            'title': 'Olağandışı Harcama',
            'message': f"{anomaly['date']} tarihinde harcamalarınız normalin %{anomaly['increase_percentage']:.1f} üzerinde."
        })

    return jsonify({'insights': insights}), 200