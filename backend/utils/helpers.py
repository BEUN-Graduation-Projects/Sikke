from datetime import datetime, date
import json


def json_serializer(obj):
    """JSON serialization için helper"""
    if isinstance(obj, (datetime, date)):
        return obj.isoformat()
    raise TypeError(f"{type(obj)} not serializable")


def format_currency(amount):
    """Para birimi formatı"""
    return f"₺{amount:,.2f}"


def get_current_month_range():
    """Mevcut ayın başlangıç ve bitiş tarihleri"""
    today = date.today()
    first_day = date(today.year, today.month, 1)

    if today.month == 12:
        last_day = date(today.year + 1, 1, 1)
    else:
        last_day = date(today.year, today.month + 1, 1)

    return first_day, last_day