// Dashboard functionality
class Dashboard {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadDashboardData();
        this.setupCharts();
        this.updateUserInfo();
    }

    setupEventListeners() {
        // Date selector
        document.querySelectorAll('.date-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.date-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.loadDashboardData();
            });
        });

        // Add expense modal
        const addExpenseBtn = document.getElementById('addExpenseBtn');
        const expenseModal = document.getElementById('expenseModal');
        const closeExpenseModal = document.getElementById('closeExpenseModal');
        const cancelExpense = document.getElementById('cancelExpense');
        const expenseForm = document.getElementById('expenseForm');

        if (addExpenseBtn) {
            addExpenseBtn.addEventListener('click', () => {
                expenseModal.classList.add('active');
            });
        }

        if (closeExpenseModal) {
            closeExpenseModal.addEventListener('click', () => {
                expenseModal.classList.remove('active');
            });
        }

        if (cancelExpense) {
            cancelExpense.addEventListener('click', () => {
                expenseModal.classList.remove('active');
            });
        }

        if (expenseForm) {
            expenseForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addExpense(e.target);
            });
        }

        // Close modal on outside click
        expenseModal?.addEventListener('click', (e) => {
            if (e.target === expenseModal) {
                expenseModal.classList.remove('active');
            }
        });

        // Mobile menu
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const mobileMenu = document.getElementById('mobileMenu');

        if (mobileMenuBtn && mobileMenu) {
            mobileMenuBtn.addEventListener('click', () => {
                mobileMenu.classList.toggle('active');
                mobileMenuBtn.classList.toggle('active');
            });
        }
    }

    async loadDashboardData() {
        try {
            // GEÇİCİ: Fake data gösteriyoruz
            console.log('Loading dashboard data...');

            // Fake delay
            await new Promise(resolve => setTimeout(resolve, 500));

            // Demo data
            const demoData = {
                dailyBudget: 147.50,
                totalSavings: 8400,
                investmentValue: 2150,
                goalsProgress: "3/5",
                budgetProgress: {
                    percentage: 65,
                    spent: 95.87,
                    remaining: 51.63
                },
                recentExpenses: [
                    {
                        title: "Restoran",
                        category: "food",
                        amount: 85.00,
                        date: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 saat önce
                    },
                    {
                        title: "Taksi",
                        category: "transport",
                        amount: 45.00,
                        date: new Date(Date.now() - 5 * 60 * 60 * 1000) // 5 saat önce
                    },
                    {
                        title: "Market Alışverişi",
                        category: "shopping",
                        amount: 120.50,
                        date: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 gün önce
                    }
                ],
                activeGoals: [
                    {
                        title: "Yeni Laptop",
                        target: 20000,
                        saved: 8400
                    },
                    {
                        title: "Tatil",
                        target: 15000,
                        saved: 11250
                    },
                    {
                        title: "Araba",
                        target: 150000,
                        saved: 27000
                    }
                ],
                investmentSuggestions: [
                    {
                        name: "Bitcoin",
                        symbol: "BTC",
                        icon: "bitcoin",
                        change: 5.2,
                        amount: 500
                    },
                    {
                        name: "BIST 100",
                        symbol: "XU100",
                        icon: "chart-line",
                        change: 2.1,
                        amount: 300
                    },
                    {
                        name: "Altın",
                        symbol: "GLD",
                        icon: "coins",
                        change: 1.5,
                        amount: 200
                    }
                ]
            };

            this.updateDashboardUI(demoData);

        } catch (error) {
            console.error('Dashboard data loading error:', error);
            // Hata durumunda da demo data göster
            this.loadDashboardData();
        }
    }

    showSkeletonLoading() {
        // Skeleton loading effect for stats
        document.querySelectorAll('.stat-value').forEach(el => {
            el.innerHTML = '<div class="skeleton-text" style="width: 80px; height: 28px; background: var(--bg-tertiary); border-radius: 4px;"></div>';
        });
    }

    updateDashboardUI(data) {
        // Update quick stats
        if (data.dailyBudget) {
            document.getElementById('dailyBudget').textContent = `₺${data.dailyBudget.toLocaleString()}`;
        }
        if (data.totalSavings) {
            document.getElementById('totalSavings').textContent = `₺${data.totalSavings.toLocaleString()}`;
        }
        if (data.investmentValue) {
            document.getElementById('investmentValue').textContent = `₺${data.investmentValue.toLocaleString()}`;
        }
        if (data.goalsProgress) {
            document.getElementById('goalsProgress').textContent = data.goalsProgress;
        }

        // Update budget progress
        this.updateBudgetProgress(data.budgetProgress);

        // Update charts
        this.updateCharts(data.charts);

        // Update recent expenses
        this.updateRecentExpenses(data.recentExpenses);

        // Update goals
        this.updateGoals(data.activeGoals);

        // Update investments
        this.updateInvestments(data.investmentSuggestions);
    }

    updateBudgetProgress(progress) {
        if (!progress) return;

        const progressBar = document.querySelector('.budget-progress-large .progress-fill');
        const progressMarker = document.querySelector('.progress-marker');
        const spentAmount = document.querySelector('.budget-stats .stat:first-child .stat-value');
        const remainingAmount = document.querySelector('.budget-stats .stat:nth-child(2) .stat-value');
        const usagePercentage = document.querySelector('.budget-stats .stat:last-child .stat-value');

        if (progressBar) {
            progressBar.style.width = `${progress.percentage}%`;
        }
        if (progressMarker) {
            progressMarker.style.left = `${progress.percentage}%`;
        }
        if (spentAmount) {
            spentAmount.textContent = `₺${progress.spent.toLocaleString()}`;
        }
        if (remainingAmount) {
            remainingAmount.textContent = `₺${progress.remaining.toLocaleString()}`;
        }
        if (usagePercentage) {
            usagePercentage.textContent = `${progress.percentage}%`;
        }
    }

    setupCharts() {
        // Budget Chart
        const budgetCtx = document.getElementById('budgetChart');
        if (budgetCtx) {
            this.budgetChart = new Chart(budgetCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Yemek', 'Ulaşım', 'Alışveriş', 'Eğlence', 'Faturalar', 'Diğer'],
                    datasets: [{
                        data: [35, 20, 25, 10, 8, 2],
                        backgroundColor: [
                            '#ef4444',
                            '#3b82f6',
                            '#8b5cf6',
                            '#f59e0b',
                            '#10b981',
                            '#6b7280'
                        ],
                        borderWidth: 0,
                        borderRadius: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '70%',
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                padding: 20,
                                usePointStyle: true,
                                pointStyle: 'circle',
                                color: '#a0a0a0',
                                font: {
                                    family: 'Inter',
                                    size: 12
                                }
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(30, 30, 30, 0.9)',
                            titleColor: '#ffffff',
                            bodyColor: '#ffffff',
                            borderColor: '#333333',
                            borderWidth: 1,
                            cornerRadius: 8,
                            callbacks: {
                                label: function(context) {
                                    return `${context.label}: %${context.parsed}`;
                                }
                            }
                        }
                    }
                }
            });
        }
    }

    updateCharts(chartData) {
        if (!chartData || !this.budgetChart) return;

        // Update budget chart if data provided
        if (chartData.budget) {
            this.budgetChart.data.datasets[0].data = chartData.budget;
            this.budgetChart.update();
        }
    }

    updateRecentExpenses(expenses) {
        if (!expenses) return;

        const expensesList = document.querySelector('.expenses-list');
        if (!expensesList) return;

        // Clear existing items (except skeleton)
        expensesList.innerHTML = '';

        expenses.forEach(expense => {
            const expenseItem = this.createExpenseItem(expense);
            expensesList.appendChild(expenseItem);
        });
    }

    createExpenseItem(expense) {
        const item = document.createElement('div');
        item.className = 'expense-item';

        const categoryClass = `category-${expense.category}`;
        const categoryIcon = this.getCategoryIcon(expense.category);

        item.innerHTML = `
            <div class="expense-icon ${categoryClass}">
                <i class="fas fa-${categoryIcon}"></i>
            </div>
            <div class="expense-details">
                <div class="expense-title">${expense.title}</div>
                <div class="expense-category">${this.getCategoryName(expense.category)}</div>
            </div>
            <div class="expense-amount negative">-₺${expense.amount.toLocaleString()}</div>
            <div class="expense-time">${this.formatTimeAgo(expense.date)}</div>
        `;

        return item;
    }

    getCategoryIcon(category) {
        const icons = {
            food: 'utensils',
            transport: 'bus',
            shopping: 'shopping-bag',
            entertainment: 'film',
            bills: 'file-invoice-dollar',
            other: 'receipt'
        };
        return icons[category] || 'receipt';
    }

    getCategoryName(category) {
        const names = {
            food: 'Yemek',
            transport: 'Ulaşım',
            shopping: 'Alışveriş',
            entertainment: 'Eğlence',
            bills: 'Faturalar',
            other: 'Diğer'
        };
        return names[category] || 'Diğer';
    }

    formatTimeAgo(date) {
        const now = new Date();
        const diffMs = now - new Date(date);
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) {
            return `${diffMins} dakika önce`;
        } else if (diffHours < 24) {
            return `${diffHours} saat önce`;
        } else {
            return `${diffDays} gün önce`;
        }
    }

    updateGoals(goals) {
        if (!goals) return;

        const goalsList = document.querySelector('.goals-list');
        if (!goalsList) return;

        goalsList.innerHTML = '';

        goals.forEach(goal => {
            const goalItem = this.createGoalItem(goal);
            goalsList.appendChild(goalItem);
        });
    }

    createGoalItem(goal) {
        const progressPercentage = (goal.saved / goal.target) * 100;

        const item = document.createElement('div');
        item.className = 'goal-item';
        item.innerHTML = `
            <div class="goal-info">
                <div class="goal-title">${goal.title}</div>
                <div class="goal-target">₺${goal.target.toLocaleString()}</div>
            </div>
            <div class="goal-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progressPercentage}%"></div>
                </div>
                <div class="progress-text">%${Math.round(progressPercentage)}</div>
            </div>
            <div class="goal-amount">₺${goal.saved.toLocaleString()}</div>
        `;

        return item;
    }

    updateInvestments(investments) {
        if (!investments) return;

        const investmentsList = document.querySelector('.investments-list');
        if (!investmentsList) return;

        investmentsList.innerHTML = '';

        investments.forEach(investment => {
            const investmentItem = this.createInvestmentItem(investment);
            investmentsList.appendChild(investmentItem);
        });
    }

    createInvestmentItem(investment) {
        const changeClass = investment.change >= 0 ? 'positive' : 'negative';
        const changeSign = investment.change >= 0 ? '+' : '';

        const item = document.createElement('div');
        item.className = 'investment-item';
        item.innerHTML = `
            <div class="investment-icon">
                <i class="fas fa-${investment.icon}"></i>
            </div>
            <div class="investment-details">
                <div class="investment-name">${investment.name}</div>
                <div class="investment-symbol">${investment.symbol}</div>
            </div>
            <div class="investment-change ${changeClass}">${changeSign}${investment.change}%</div>
            <div class="investment-amount">₺${investment.amount.toLocaleString()}</div>
        `;

        return item;
    }

    async addExpense(form) {
        const formData = new FormData(form);
        const expenseData = {
            title: formData.get('title') || form.querySelector('input[type="text"]').value,
            category: formData.get('category') || form.querySelector('select').value,
            amount: parseFloat(formData.get('amount') || form.querySelector('input[type="number"]').value),
            date: formData.get('date') || form.querySelector('input[type="date"]').value
        };

        try {
            // GEÇİCİ: LocalStorage'a kaydediyoruz
            console.log('Adding expense:', expenseData);

            // Fake delay
            await new Promise(resolve => setTimeout(resolve, 500));

            // Close modal and reset form
            document.getElementById('expenseModal').classList.remove('active');
            form.reset();

            // Reload dashboard data
            this.loadDashboardData();

            Utils.showNotification('Harcama başarıyla eklendi! (Demo mod)', 'success');
        } catch (error) {
            console.error('Add expense error:', error);
            Utils.showNotification('Harcama eklenemedi: ' + error.message, 'error');
        }
    }

    updateUserInfo() {
        const user = SikkeApp.getCurrentUser();
        if (user) {
            // Update desktop user info
            const userName = document.getElementById('userName');
            const userEmail = document.getElementById('userEmail');
            const userAvatar = document.getElementById('userAvatar');

            if (userName) userName.textContent = user.fullName || 'Kullanıcı';
            if (userEmail) userEmail.textContent = user.email;
            if (userAvatar) {
                userAvatar.src = user.avatar || 'assets/icons/user-default.png';
            }

            // Update mobile user info
            const mobileUserName = document.getElementById('mobileUserName');
            const mobileUserEmail = document.getElementById('mobileUserEmail');

            if (mobileUserName) mobileUserName.textContent = user.fullName || 'Kullanıcı';
            if (mobileUserEmail) mobileUserEmail.textContent = user.email;
        }
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    if (!SikkeApp.isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }

    window.Dashboard = new Dashboard();
});