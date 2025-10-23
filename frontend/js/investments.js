// Investments functionality
class InvestmentsManager {
    constructor() {
        this.investments = [];
        this.currentPeriod = '1d';
        this.selectedInvestment = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadInvestments();
        this.setupCharts();
        this.updateUserInfo();
        this.setupInvestmentForm();
    }

    setupEventListeners() {
        // Time filters
        document.querySelectorAll('.time-filters .filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.time-filters .filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentPeriod = e.target.dataset.period;
                this.updateCharts();
            });
        });

        // Add investment modal
        const addInvestmentBtn = document.getElementById('addInvestmentBtn');
        const investmentModal = document.getElementById('investmentModal');
        const closeInvestmentModal = document.getElementById('closeInvestmentModal');
        const cancelInvestment = document.getElementById('cancelInvestment');
        const investmentForm = document.getElementById('investmentForm');

        if (addInvestmentBtn) {
            addInvestmentBtn.addEventListener('click', () => {
                this.openInvestmentModal();
            });
        }

        if (closeInvestmentModal) {
            closeInvestmentModal.addEventListener('click', () => {
                this.closeInvestmentModal();
            });
        }

        if (cancelInvestment) {
            cancelInvestment.addEventListener('click', () => {
                this.closeInvestmentModal();
            });
        }

        if (investmentForm) {
            investmentForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addInvestment(e.target);
            });
        }

        // Sell modal
        const closeSellModal = document.getElementById('closeSellModal');
        const cancelSell = document.getElementById('cancelSell');
        const sellForm = document.getElementById('sellForm');

        if (closeSellModal) {
            closeSellModal.addEventListener('click', () => {
                this.closeSellModal();
            });
        }

        if (cancelSell) {
            cancelSell.addEventListener('click', () => {
                this.closeSellModal();
            });
        }

        if (sellForm) {
            sellForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.sellInvestment(e.target);
            });
        }

        // Close modals on outside click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
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

    setupInvestmentForm() {
        // Calculate total amount when quantity or price changes
        const quantityInput = document.getElementById('investmentQuantity');
        const priceInput = document.getElementById('investmentPrice');
        const totalInput = document.getElementById('investmentTotal');

        const calculateTotal = () => {
            const quantity = parseFloat(quantityInput.value) || 0;
            const price = parseFloat(priceInput.value) || 0;
            const total = quantity * price;
            totalInput.value = `₺${total.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        };

        if (quantityInput && priceInput && totalInput) {
            quantityInput.addEventListener('input', calculateTotal);
            priceInput.addEventListener('input', calculateTotal);
        }

        // Set today's date as default
        const dateInput = document.getElementById('investmentDate');
        if (dateInput) {
            dateInput.value = new Date().toISOString().split('T')[0];
        }

        // Setup sell form calculations
        const sellQuantityInput = document.getElementById('sellQuantity');
        const sellPriceInput = document.getElementById('sellPrice');
        const sellTotalInput = document.getElementById('sellTotal');

        const calculateSellTotal = () => {
            const quantity = parseFloat(sellQuantityInput.value) || 0;
            const price = parseFloat(sellPriceInput.value) || 0;
            const total = quantity * price;
            sellTotalInput.value = `₺${total.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        };

        if (sellQuantityInput && sellPriceInput && sellTotalInput) {
            sellQuantityInput.addEventListener('input', calculateSellTotal);
            sellPriceInput.addEventListener('input', calculateSellTotal);
        }

        // Set today's date for sell form
        const sellDateInput = document.getElementById('sellDate');
        if (sellDateInput) {
            sellDateInput.value = new Date().toISOString().split('T')[0];
        }
    }

    async loadInvestments() {
        try {
            // GEÇİCİ: Demo investments data
            const demoInvestments = [
                {
                    id: 1,
                    symbol: 'BTC',
                    name: 'Bitcoin',
                    type: 'crypto',
                    quantity: 0.015,
                    avgCost: 33333.33,
                    currentPrice: 35000,
                    investedAmount: 500,
                    currentValue: 525,
                    return: 25,
                    returnPercentage: 5.0,
                    transactions: [
                        { type: 'buy', quantity: 0.015, price: 33333.33, date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
                    ]
                },
                {
                    id: 2,
                    symbol: 'XU100',
                    name: 'BIST 100',
                    type: 'stock',
                    quantity: 15,
                    avgCost: 20,
                    currentPrice: 21,
                    investedAmount: 300,
                    currentValue: 315,
                    return: 15,
                    returnPercentage: 5.0,
                    transactions: [
                        { type: 'buy', quantity: 15, price: 20, date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
                    ]
                },
                {
                    id: 3,
                    symbol: 'GLD',
                    name: 'Altın',
                    type: 'commodity',
                    quantity: 3.5,
                    avgCost: 57.14,
                    currentPrice: 60,
                    investedAmount: 200,
                    currentValue: 210,
                    return: 10,
                    returnPercentage: 5.0,
                    transactions: [
                        { type: 'buy', quantity: 3.5, price: 57.14, date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) }
                    ]
                }
            ];

            this.investments = demoInvestments;
            this.renderInvestmentsTable();
            this.updateSummary();

        } catch (error) {
            console.error('Investments loading error:', error);
            this.investments = [];
            this.renderInvestmentsTable();
            this.updateSummary();
        }
    }

    renderInvestmentsTable() {
        const tableBody = document.getElementById('investmentsTableBody');
        if (!tableBody) return;

        if (this.investments.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 3rem; color: var(--text-muted);">
                        <i class="fas fa-chart-line" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i>
                        <div>Henüz yatırımınız bulunmuyor</div>
                        <button class="btn btn-primary" onclick="InvestmentsManager.openInvestmentModal()" style="margin-top: 1rem;">
                            İlk Yatırımını Yap
                        </button>
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = this.investments.map(investment => this.createInvestmentRow(investment)).join('');

        // Add event listeners to action buttons
        document.querySelectorAll('.btn-sell').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const investmentId = parseInt(btn.dataset.investmentId);
                this.openSellModal(investmentId);
            });
        });

        document.querySelectorAll('.btn-details').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const investmentId = parseInt(btn.dataset.investmentId);
                this.showInvestmentDetails(investmentId);
            });
        });
    }

    createInvestmentRow(investment) {
        const returnClass = investment.return >= 0 ? 'positive' : 'negative';
        const returnSign = investment.return >= 0 ? '+' : '';
        const iconClass = this.getInvestmentIconClass(investment.type);
        const icon = this.getInvestmentIcon(investment.type);

        return `
            <tr>
                <td>
                    <div class="asset-cell">
                        <div class="asset-icon ${iconClass}">
                            <i class="${icon}"></i>
                        </div>
                        <div>
                            <div style="font-weight: 600;">${investment.name}</div>
                            <div style="font-size: 0.75rem; color: var(--text-muted);">${investment.symbol}</div>
                        </div>
                    </div>
                </td>
                <td>${investment.quantity}</td>
                <td>₺${investment.avgCost.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td>₺${investment.currentPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td>₺${investment.currentValue.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td class="return-cell ${returnClass}">
                    ${returnSign}₺${investment.return} (${returnSign}${investment.returnPercentage}%)
                </td>
                <td>
                    <div class="actions-cell">
                        <button class="btn-icon-sm btn-sell" data-investment-id="${investment.id}" title="Sat">
                            <i class="fas fa-arrow-up"></i>
                        </button>
                        <button class="btn-icon-sm btn-details" data-investment-id="${investment.id}" title="Detaylar">
                            <i class="fas fa-chart-line"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    getInvestmentIcon(type) {
        const icons = {
            crypto: 'fab fa-bitcoin',
            stock: 'fas fa-chart-line',
            etf: 'fas fa-layer-group',
            commodity: 'fas fa-coins',
            forex: 'fas fa-dollar-sign'
        };
        return icons[type] || 'fas fa-chart-line';
    }

    getInvestmentIconClass(type) {
        const classes = {
            crypto: 'btc',
            stock: 'tech',
            etf: 'tech',
            commodity: 'gold',
            forex: 'tech'
        };
        return classes[type] || 'tech';
    }

    updateSummary() {
        const totalPortfolio = this.investments.reduce((sum, inv) => sum + inv.currentValue, 0);
        const totalInvested = this.investments.reduce((sum, inv) => sum + inv.investedAmount, 0);
        const totalReturn = totalPortfolio - totalInvested;
        const totalReturnPercentage = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;

        document.getElementById('totalPortfolio').textContent = `₺${totalPortfolio.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        document.getElementById('totalInvested').textContent = `₺${totalInvested.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        document.getElementById('totalReturn').textContent = `₺${totalReturn.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        document.getElementById('activeInvestments').textContent = this.investments.length;

        // Update summary change indicators
        const portfolioChange = document.querySelector('.investment-summary .summary-card.primary .summary-change');
        const returnChange = document.querySelector('.investment-summary .summary-card.warning .summary-change');

        if (portfolioChange) {
            portfolioChange.className = `summary-change ${totalReturn >= 0 ? 'positive' : 'negative'}`;
            portfolioChange.innerHTML = `
                <i class="fas fa-arrow-${totalReturn >= 0 ? 'up' : 'down'}"></i>
                <span>${totalReturn >= 0 ? '+' : ''}₺${Math.abs(totalReturn)} (${totalReturn >= 0 ? '+' : ''}${totalReturnPercentage.toFixed(1)}%)</span>
            `;
        }

        if (returnChange) {
            returnChange.className = `summary-change ${totalReturn >= 0 ? 'positive' : 'negative'}`;
            returnChange.innerHTML = `
                <i class="fas fa-arrow-${totalReturn >= 0 ? 'up' : 'down'}"></i>
                <span>${totalReturn >= 0 ? '+' : ''}${totalReturnPercentage.toFixed(1)}%</span>
            `;
        }
    }

    setupCharts() {
        // Portfolio Chart (Doughnut)
        const portfolioCtx = document.getElementById('portfolioChart');
        if (portfolioCtx) {
            this.portfolioChart = new Chart(portfolioCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Kripto', 'Hisse Senetleri', 'Altın'],
                    datasets: [{
                        data: [525, 315, 210],
                        backgroundColor: [
                            '#f7931a',
                            '#3b82f6',
                            '#f59e0b'
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
                                    return `${context.label}: ₺${context.parsed}`;
                                }
                            }
                        }
                    }
                }
            });
        }

        // Performance Chart (Line)
        const performanceCtx = document.getElementById('performanceChart');
        if (performanceCtx) {
            this.performanceChart = new Chart(performanceCtx, {
                type: 'line',
                data: {
                    labels: ['1H', '2H', '3H', '4H', '5H', '6H', '7H'],
                    datasets: [
                        {
                            label: 'Portföy',
                            data: [1000, 1050, 1100, 1150, 1200, 1250, 1300],
                            borderColor: '#f0b90b',
                            backgroundColor: 'rgba(240, 185, 11, 0.1)',
                            borderWidth: 2,
                            fill: true,
                            tension: 0.4
                        },
                        {
                            label: 'BIST 100',
                            data: [1000, 1020, 1040, 1060, 1080, 1100, 1120],
                            borderColor: '#3b82f6',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            borderWidth: 2,
                            fill: true,
                            tension: 0.4,
                            borderDash: [5, 5]
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            backgroundColor: 'rgba(30, 30, 30, 0.9)',
                            titleColor: '#ffffff',
                            bodyColor: '#ffffff',
                            borderColor: '#333333',
                            borderWidth: 1,
                            cornerRadius: 8
                        }
                    },
                    scales: {
                        x: {
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)',
                                borderColor: 'rgba(255, 255, 255, 0.1)'
                            },
                            ticks: {
                                color: '#a0a0a0'
                            }
                        },
                        y: {
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)',
                                borderColor: 'rgba(255, 255, 255, 0.1)'
                            },
                            ticks: {
                                color: '#a0a0a0',
                                callback: function(value) {
                                    return '₺' + value;
                                }
                            }
                        }
                    }
                }
            });
        }
    }

    updateCharts() {
        // Update charts based on selected period
        // This would typically fetch new data from API
        console.log('Updating charts for period:', this.currentPeriod);
    }

    openInvestmentModal() {
        document.getElementById('investmentModal').classList.add('active');
    }

    closeInvestmentModal() {
        document.getElementById('investmentModal').classList.remove('active');
        document.getElementById('investmentForm').reset();
    }

    async addInvestment(form) {
        const formData = new FormData(form);
        const investmentData = {
            type: formData.get('type') || document.getElementById('investmentType').value,
            symbol: formData.get('symbol') || document.getElementById('investmentSymbol').value,
            name: formData.get('name') || document.getElementById('investmentName').value,
            quantity: parseFloat(formData.get('quantity') || document.getElementById('investmentQuantity').value),
            price: parseFloat(formData.get('price') || document.getElementById('investmentPrice').value),
            date: formData.get('date') || document.getElementById('investmentDate').value,
            notes: formData.get('notes') || document.getElementById('investmentNotes').value
        };

        try {
            // GEÇİCİ: LocalStorage'a kaydediyoruz
            console.log('Adding investment:', investmentData);

            // Fake delay
            await new Promise(resolve => setTimeout(resolve, 500));

            const newInvestment = {
                id: Date.now(),
                ...investmentData,
                avgCost: investmentData.price,
                currentPrice: investmentData.price * (1 + (Math.random() * 0.1 - 0.05)), // Random price change ±5%
                investedAmount: investmentData.quantity * investmentData.price,
                transactions: [
                    {
                        type: 'buy',
                        quantity: investmentData.quantity,
                        price: investmentData.price,
                        date: new Date(investmentData.date)
                    }
                ]
            };

            // Calculate current value and return
            newInvestment.currentValue = newInvestment.quantity * newInvestment.currentPrice;
            newInvestment.return = newInvestment.currentValue - newInvestment.investedAmount;
            newInvestment.returnPercentage = (newInvestment.return / newInvestment.investedAmount) * 100;

            this.investments.push(newInvestment);

            this.closeInvestmentModal();
            this.renderInvestmentsTable();
            this.updateSummary();
            this.updateCharts();

            Utils.showNotification('Yatırım başarıyla eklendi!', 'success');

        } catch (error) {
            console.error('Add investment error:', error);
            Utils.showNotification('Yatırım eklenemedi: ' + error.message, 'error');
        }
    }

    openSellModal(investmentId) {
        const investment = this.investments.find(inv => inv.id === investmentId);
        if (!investment) return;

        this.selectedInvestment = investment;

        document.getElementById('sellAssetName').textContent = `${investment.name} (${investment.symbol})`;
        document.getElementById('sellCurrentQuantity').textContent = investment.quantity;
        document.getElementById('sellAvgCost').textContent = `₺${investment.avgCost.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

        // Set max quantity
        const sellQuantityInput = document.getElementById('sellQuantity');
        if (sellQuantityInput) {
            sellQuantityInput.max = investment.quantity;
            sellQuantityInput.placeholder = `0 - ${investment.quantity}`;
        }

        // Set current price as default sell price
        const sellPriceInput = document.getElementById('sellPrice');
        if (sellPriceInput) {
            sellPriceInput.value = investment.currentPrice;
        }

        document.getElementById('sellModal').classList.add('active');
    }

    closeSellModal() {
        document.getElementById('sellModal').classList.remove('active');
        document.getElementById('sellForm').reset();
        this.selectedInvestment = null;
    }

    async sellInvestment(form) {
        if (!this.selectedInvestment) return;

        const formData = new FormData(form);
        const sellData = {
            quantity: parseFloat(formData.get('quantity') || document.getElementById('sellQuantity').value),
            price: parseFloat(formData.get('price') || document.getElementById('sellPrice').value),
            date: formData.get('date') || document.getElementById('sellDate').value
        };

        try {
            // GEÇİCİ: LocalStorage'a kaydediyoruz
            console.log('Selling investment:', sellData);

            // Fake delay
            await new Promise(resolve => setTimeout(resolve, 500));

            const investmentIndex = this.investments.findIndex(inv => inv.id === this.selectedInvestment.id);
            if (investmentIndex === -1) return;

            const investment = this.investments[investmentIndex];

            if (sellData.quantity > investment.quantity) {
                throw new Error('Satış miktarı mevcut miktardan fazla olamaz');
            }

            // Add sell transaction
            investment.transactions.push({
                type: 'sell',
                quantity: sellData.quantity,
                price: sellData.price,
                date: new Date(sellData.date)
            });

            // Update investment
            if (sellData.quantity === investment.quantity) {
                // Remove investment if selling all
                this.investments.splice(investmentIndex, 1);
            } else {
                // Update quantity and recalculate average cost
                investment.quantity -= sellData.quantity;

                // For simplicity, we're not recalculating average cost on partial sales
                // In a real app, you'd use FIFO or other accounting methods

                // Update current value
                investment.currentValue = investment.quantity * investment.currentPrice;
                investment.investedAmount = investment.quantity * investment.avgCost;
                investment.return = investment.currentValue - investment.investedAmount;
                investment.returnPercentage = (investment.return / investment.investedAmount) * 100;
            }

            this.closeSellModal();
            this.renderInvestmentsTable();
            this.updateSummary();
            this.updateCharts();

            Utils.showNotification('Satış işlemi başarıyla tamamlandı!', 'success');

        } catch (error) {
            console.error('Sell investment error:', error);
            Utils.showNotification('Satış işlemi başarısız: ' + error.message, 'error');
        }
    }

    showInvestmentDetails(investmentId) {
        const investment = this.investments.find(inv => inv.id === investmentId);
        if (!investment) return;

        // In a real app, this would open a detailed modal with charts and transaction history
        console.log('Showing details for:', investment);
        Utils.showNotification(`${investment.name} detayları yakında eklenecek!`, 'info');
    }

    updateUserInfo() {
        const user = SikkeApp.getCurrentUser();
        if (user) {
            const userName = document.getElementById('userName');
            const userEmail = document.getElementById('userEmail');
            const userAvatar = document.getElementById('userAvatar');
            const mobileUserName = document.getElementById('mobileUserName');
            const mobileUserEmail = document.getElementById('mobileUserEmail');

            if (userName) userName.textContent = user.fullName || 'Kullanıcı';
            if (userEmail) userEmail.textContent = user.email;
            if (userAvatar) userAvatar.src = user.avatar || 'assets/icons/user-default.png';
            if (mobileUserName) mobileUserName.textContent = user.fullName || 'Kullanıcı';
            if (mobileUserEmail) mobileUserEmail.textContent = user.email;
        }
    }
}

// Initialize investments when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    if (!SikkeApp.isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }

    window.InvestmentsManager = new InvestmentsManager();
});