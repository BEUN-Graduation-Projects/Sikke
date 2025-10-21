import random
from datetime import datetime, date


class InvestmentService:
    # Simüle edilmiş yatırım araçları
    INVESTMENT_OPTIONS = [
        {'symbol': 'BTC', 'name': 'Bitcoin', 'volatility': 0.15},
        {'symbol': 'ETH', 'name': 'Ethereum', 'volatility': 0.12},
        {'symbol': 'XU100', 'name': 'BIST 100', 'volatility': 0.08},
        {'symbol': 'SPY', 'name': 'S&P 500 ETF', 'volatility': 0.06},
        {'symbol': 'GLD', 'name': 'Altın', 'volatility': 0.04},
        {'symbol': 'TL', 'name': 'TL Mevduat', 'volatility': 0.02}
    ]

    @staticmethod
    def generate_investment_recommendations(available_amount):
        """Mevcut bütçe için yatırım önerileri oluşturur"""
        if available_amount <= 0:
            return []

        # Basit momentum algoritması
        recommendations = []
        total_weight = 0

        for asset in InvestmentService.INVESTMENT_OPTIONS:
            # Rastgele performans simülasyonu (-%5 ile +%10 arası)
            performance = random.uniform(-0.05, 0.10)
            volatility = asset['volatility']

            # Risk-adjusted score
            score = performance / volatility if volatility > 0 else performance

            weight = max(0.1, score + 0.5)  # Minimum %10 ağırlık
            total_weight += weight

            recommendations.append({
                **asset,
                'performance': round(performance * 100, 2),
                'score': round(score, 3),
                'weight': weight,
                'recommended_amount': 0  # Sonradan hesaplanacak
            })

        # Ağırlıklara göre miktar dağıtımı
        for rec in recommendations:
            rec['recommended_amount'] = round(
                (rec['weight'] / total_weight) * available_amount, 2
            )

        # Miktara göre sırala
        recommendations.sort(key=lambda x: x['recommended_amount'], reverse=True)

        return recommendations

    @staticmethod
    def simulate_investment_purchase(asset_symbol, amount):
        """Yatırım alımını simüle eder"""
        asset = next((a for a in InvestmentService.INVESTMENT_OPTIONS
                      if a['symbol'] == asset_symbol), None)

        if not asset:
            return None

        # Simüle edilmiş fiyat (base price ± volatility)
        base_prices = {
            'BTC': 450000, 'ETH': 25000, 'XU100': 8500,
            'SPY': 450, 'GLD': 1800, 'TL': 1
        }

        base_price = base_prices.get(asset_symbol, 1)
        simulated_price = base_price * (1 + random.uniform(-0.1, 0.1))
        units = amount / simulated_price

        return {
            'asset_symbol': asset_symbol,
            'asset_name': asset['name'],
            'amount': amount,
            'simulated_price': round(simulated_price, 2),
            'units': round(units, 6)
        }