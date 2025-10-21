from backend.database.db_setup import db
from datetime import datetime


class Investment(db.Model):
    __tablename__ = 'investments'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    asset_name = db.Column(db.String(100), nullable=False)
    asset_symbol = db.Column(db.String(20), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    simulated_price = db.Column(db.Float, nullable=False)
    units = db.Column(db.Float, nullable=False)
    date = db.Column(db.Date, nullable=False, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'asset_name': self.asset_name,
            'asset_symbol': self.asset_symbol,
            'amount': self.amount,
            'simulated_price': self.simulated_price,
            'units': self.units,
            'date': self.date.isoformat(),
            'current_value': self.calculate_current_value()
        }

    def calculate_current_value(self):
        # Basit simülasyon: %5 kar varsayalım
        return round(self.units * self.simulated_price * 1.05, 2)