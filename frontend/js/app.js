class SikkeApp {
    constructor() {
        this.user = null;
        this.overview = {};
        this.charts = {};
        this.init();
    }

    async init() {
        await this.checkAuth();
        await this.loadUserData();
        await this.loadDashboardData();
        this.setupEventListeners();
        this.renderCharts();
    }

    async checkAuth() {
        const token = localStorage.getItem('sikke_token');
        if (!token) {
            window.location.href = 'login.html';
            return;
        }

        try {
            const response = await fetch('/api/auth/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Auth failed');
            }

            this.user = await response.json();
        } catch (error) {
            localStorage.removeItem('sikke_token');
            window.location.href = 'login.html';
        }
    }

    async loadUserData() {
        try {
            const response = await fetch('/api/user/profile');
            const data = await response.json();
            this.user = data.user;
            this.updateUI();
        } catch (error) {
            console.error('Kullanıcı verisi yüklenemedi:', error);
        }
    }

    async loadDashboardData() {
        try {
            const [overviewRes, expensesRes, goalsRes, insightsRes] = await Promise.all([
                fetch('/api/dashboard/overview'),
                fetch('/api/expenses?limit=5'),
                fetch('/api/goals'),
                fetch('/api/dashboard/insights')
            ]);

            this.overview = await overviewRes.json();
            this.recentExpenses = await expensesRes.json();
            this.activeGoals = await goalsRes.json();
            this.insights = await insightsRes.json();

            this.updateDashboard();
        } catch (error) {
            console.error('Dashboard verisi yüklenemedi:', error);
        }
    }

    updateDashboard() {
        // Update quick stats
        document.getElementById('dailyBudget').textContent = this.formatCurrency(this.overview.daily_budget || 0);
        document.getElementById('monthlySpent').textContent = this.formatCurrency(this.overview.total_spent || 0);
        document.getElementById('savingsRate').textContent = `${this.overview.savings_rate || 0}%`;
        document.getElementById('investmentGrowth').textContent = `${this.overview.investment_growth || 0}%`;

        // Update recent expenses
        this.renderRecentExpenses();

        // Update active goals
        this.renderActiveGoals();

        // Update insights
        this.renderInsights();
    }

    renderRecentExpenses() {
        const container = document.getElementById('recentExpenses');
        const expenses = this.recentExpenses.expenses || [];

        if (expenses.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: var(--text-muted);">
                    <i class="fas fa-receipt" style="font-size: 2rem; margin-bottom: 16px;"></i>
                    <p>Henüz harcama kaydı yok</p>
                </div>
            `;
            return;
        }

        container.innerHTML = expenses.map(expense => `
            <div class="flex-between" style="padding: 12px 0; border-bottom: 1px solid var(--border-primary);">
                <div>
                    <div style="font-weight: 500; color: var(--text-primary);">${expense.category}</div>
                    <div style="font-size: 0.875rem; color: var(--text-muted);">${expense.description || 'Açıklama yok'}</div>
                </div>
                <div style="text-align: right;">
                    <div style="font-weight: 600; color: var(--text-primary);">${this.formatCurrency(expense.amount)}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">${this.formatDate(expense.date)}</div>
                </div>
            </div>
        `).join('');
    }

    renderActiveGoals() {
        const container = document.getElementById('activeGoals');
        const goals = this.activeGoals.goals || [];

        if (goals.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: var(--text-muted);">
                    <i class="fas fa-bullseye" style="font-size: 2rem; margin-bottom: 16px;"></i>
                    <p>Henüz hedef oluşturmadınız</p>
                </div>
            `;
            return;
        }

        container.innerHTML = goals.map(goal => `
            <div style="margin-bottom: 16px; padding: 16px; background: var(--bg-secondary); border-radius: var(--radius-md);">
                <div class="flex-between" style="margin-bottom: 12px;">
                    <div style="font-weight: 500; color: var(--text-primary);">${goal.name}</div>
                    <div style="font-size: 0.875rem; color: var(--text-success);">%${goal.progress_percentage || 0}</div>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${Math.min(goal.progress_percentage || 0, 100)}%"></div>
                </div>
                <div class="flex-between" style="font-size: 0.75rem; color: var(--text-muted); margin-top: 8px;">
                    <span>${this.formatCurrency(goal.saved_amount || 0)}</span>
                    <span>${this.formatCurrency(goal.target_amount || 0)}</span>
                </div>
            </div>
        `).join('');
    }

    renderInsights() {
        const container = document.getElementById('insightsList');
        const insights = this.insights.insights || [];

        if (insights.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 20px; color: var(--text-muted);">
                    <i class="fas fa-chart-line" style="font-size: 1.5rem; margin-bottom: 8px;"></i>
                    <p>Öngörü bulunmuyor</p>
                </div>
            `;
            return;
        }

        container.innerHTML = insights.map(insight => `
            <div style="padding: 12px; background: var(--bg-secondary); border-radius: var(--radius-md); margin-bottom: 8px;">
                <div class="flex-start" style="margin-bottom: 4px;">
                    <i class="fas fa-${this.getInsightIcon(insight.type)}" style="color: ${this.getInsightColor(insight.type)}; margin-right: 8px;"></i>
                    <div style="font-weight: 500; color: var(--text-primary);">${insight.title}</div>
                </div>
                <div style="font-size: 0.875rem; color: var(--text-muted);">${insight.message}</div>
            </div>
        `).join('');
    }

    getInsightIcon(type) {
        const icons = {
            'success': 'check-circle',
            'warning': 'exclamation-triangle',
            'info': 'info-circle',
            'danger': 'exclamation-circle'
        };
        return icons[type] || 'info-circle';
    }

    getInsightColor(type) {
        const colors = {
            'success': 'var(--primary-green)',
            'warning': 'var(--accent-gold)',
            'info': 'var(--primary-blue)',
            'danger': 'var(--text-danger)'
        };
        return colors[type] || 'var(--text-muted)';
    }

    renderCharts() {
        this.renderSpendingChart();
    }

    renderSpendingChart() {
        const ctx = document.getElementById('spendingChart').getContext('2d');
        const categories = this.overview.category_spending || {};

        this.charts.spending = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(categories),
                datasets: [{
                    data: Object.values(categories),
                    backgroundColor: [
                        '#00c087', '#0063f7', '#7928ca', '#ffb800', '#f56565', '#4299e1'
                    ],
                    borderWidth: 0,
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: 'var(--text-secondary)',
                            font: {
                                family: 'Inter'
                            }
                        }
                    }
                },
                cutout: '65%'
            }
        });
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (item.getAttribute('href').startsWith('#')) {
                    e.preventDefault();
                    this.handleNavigation(item.getAttribute('href').substring(1));
                }
            });
        });

        // Logout
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.logout();
        });
    }

    handleNavigation(section) {
        console.log('Navigating to:', section);
        // Implementation for SPA navigation
    }

    logout() {
        localStorage.removeItem('sikke_token');
        window.location.href = 'login.html';
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY'
        }).format(amount);
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('tr-TR');
    }
}

// Modal functions
function showAddExpenseModal() {
    console.log('Add expense modal opened');
    // Modal implementation will be added
}

function showAddGoalModal() {
    console.log('Add goal modal opened');
    // Modal implementation will be added
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    window.sikkeApp = new SikkeApp();
});