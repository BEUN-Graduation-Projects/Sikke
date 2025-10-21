from datetime import datetime, date
from backend.database.db_setup import db
from backend.models.expense_model import Expense


def calculate_daily_budget(user, current_date=None):
    """
    Günlük harcama limitini dinamik olarak hesaplar
    Formül: (aylık_gelir - sabit_giderler - bugüne_kadar_yapılan_harcamalar) / kalan_gün_sayısı
    """
    if current_date is None:
        current_date = date.today()

    # Ayın ilk günü
    first_day = date(current_date.year, current_date.month, 1)

    # Ayın son günü
    if current_date.month == 12:
        last_day = date(current_date.year + 1, 1, 1)
    else:
        last_day = date(current_date.year, current_date.month + 1, 1)

    # Bugüne kadar yapılan toplam harcama
    total_spent = db.session.query(db.func.sum(Expense.amount)).filter(
        Expense.user_id == user.id,
        Expense.date >= first_day,
        Expense.date <= current_date
    ).scalar() or 0

    # Kalan gün sayısı
    days_remaining = (last_day - current_date).days

    # Günlük bütçe hesaplama
    if days_remaining > 0:
        daily_budget = (user.monthly_income - user.fixed_expenses - total_spent) / days_remaining
    else:
        daily_budget = 0

    return max(0, round(daily_budget, 2))


def calculate_goal_recommendation(goal):
    """
    Hedef için önerilen günlük tasarruf miktarını hesaplar
    """
    days_remaining = goal.calculate_days_remaining()
    remaining_amount = goal.target_amount - goal.saved_amount

    if days_remaining > 0:
        daily_save = remaining_amount / days_remaining
    else:
        daily_save = remaining_amount

    return max(0, round(daily_save, 2))


def detect_spending_anomalies(user, days=7):
    """
    Son 7 günlük harcama anomalilerini tespit eder
    """
    end_date = date.today()
    start_date = date.today() - timedelta(days=days)

    # Son 7 günlük harcamalar
    recent_expenses = Expense.query.filter(
        Expense.user_id == user.id,
        Expense.date >= start_date,
        Expense.date <= end_date
    ).all()

    if len(recent_expenses) < 2:
        return []

    # Günlük harcama ortalaması
    daily_averages = {}
    for expense in recent_expenses:
        if expense.date not in daily_averages:
            daily_averages[expense.date] = 0
        daily_averages[expense.date] += expense.amount

    avg_spending = sum(daily_averages.values()) / len(daily_averages)

    # Anomali tespiti (%50 üzeri artış)
    anomalies = []
    for expense_date, amount in daily_averages.items():
        if amount > avg_spending * 1.5:  # %50'den fazla artış
            anomalies.append({
                'date': expense_date.isoformat(),
                'amount': amount,
                'average': avg_spending,
                'increase_percentage': round((amount / avg_spending - 1) * 100, 2)
            })

    return anomalies