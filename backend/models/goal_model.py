from backend.database.db_setup import db
from datetime import datetime


class Goal(db.Model):
    __tablename__ = 'goals'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    target_amount = db.Column(db.Float, nullable=False)
    saved_amount = db.Column(db.Float, default=0.0)
    deadline = db.Column(db.Date, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'target_amount': self.target_amount,
            'saved_amount': self.saved_amount,
            'deadline': self.deadline.isoformat(),
            'created_at': self.created_at.isoformat(),
            'progress_percentage': self.calculate_progress(),
            'days_remaining': self.calculate_days_remaining()
        }

    def calculate_progress(self):
        return round((self.saved_amount / self.target_amount) * 100, 2) if self.target_amount > 0 else 0

    def calculate_days_remaining(self):
        from datetime import date
        return max(0, (self.deadline - date.today()).days)