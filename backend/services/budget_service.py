from backend.utils.calculations import calculate_daily_budget, detect_spending_anomalies
from backend.models.expense_model import Expense
from datetime import datetime, date, timedelta


class BudgetService:
    @staticmethod
    def get_user_financial_overview(user):
        """Kullanıcının finansal özetini hesaplar"""
        today = date.today()
        first_day, last_day = get_current_month_range()

        # Mevcut ay harcamaları
        monthly_expenses = Expense.query.filter(
            Expense.user_id == user.id,
            Expense.date >= first_day,
            Expense.date < last_day
        ).all()

        total_spent = sum(exp.amount for exp in monthly_expenses)
        daily_budget = calculate_daily_budget(user, today)

        # Kategori bazlı harcamalar
        category_spending = {}
        for expense in monthly_expenses:
            if expense.category not in category_spending:
                category_spending[expense.category] = 0
            category_spending[expense.category] += expense.amount

        # Anomali tespiti
        anomalies = detect_spending_anomalies(user)

        return {
            'monthly_income': user.monthly_income,
            'fixed_expenses': user.fixed_expenses,
            'total_spent': total_spent,
            'remaining_budget': user.monthly_income - user.fixed_expenses - total_spent,
            'daily_budget': daily_budget,
            'category_spending': category_spending,
            'anomalies': anomalies,
            'expenses_count': len(monthly_expenses)
        }