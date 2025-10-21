class ApiService {
    constructor() {
        this.baseURL = '/api';
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;

        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        // Token'ı localStorage'dan al
        const token = localStorage.getItem('sikke_token');
        if (token && !token.startsWith('demo-token-')) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(url, config);

            if (response.status === 401) {
                this.handleUnauthorized();
                throw new Error('Oturum süresi doldu');
            }

            // Backend henüz hazır değilse demo data dön
            if (!response.ok && response.status !== 404) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            try {
                const data = await response.json();
                return data;
            } catch (e) {
                // JSON parse hatası - backend henüz hazır değil
                return this.getMockData(endpoint, options);
            }

        } catch (error) {
            console.error('API request failed, using mock data:', error);
            // Backend down ise mock data dön
            return this.getMockData(endpoint, options);
        }
    }

    getMockData(endpoint, options) {
        // Mock data for development
        const mockData = {
            '/auth/login': {
                token: 'mock-token-' + Date.now(),
                user: {
                    id: 1,
                    email: 'demo@sikke.com',
                    monthly_income: 15000,
                    fixed_expenses: 7500,
                    created_at: new Date().toISOString()
                }
            },
            '/auth/register': {
                token: 'mock-token-' + Date.now(),
                user: {
                    id: Date.now(),
                    email: options.body ? JSON.parse(options.body).email : 'user@example.com',
                    monthly_income: 10000,
                    fixed_expenses: 5000,
                    created_at: new Date().toISOString()
                }
            },
            '/dashboard/overview': {
                daily_budget: 250.00,
                monthly_income: 15000,
                fixed_expenses: 7500,
                total_spent: 5250,
                savings_rate: 15,
                investment_growth: 5.2,
                category_spending: {
                    'Yemek': 1500,
                    'Ulaşım': 750,
                    'Alışveriş': 2000,
                    'Fatura': 1000
                }
            },
            '/expenses': {
                expenses: [
                    { id: 1, amount: 150, category: 'Yemek', description: 'Öğle yemeği', date: new Date().toISOString() },
                    { id: 2, amount: 45, category: 'Ulaşım', description: 'Taksi', date: new Date(Date.now() - 86400000).toISOString() },
                    { id: 3, amount: 200, category: 'Alışveriş', description: 'Market', date: new Date(Date.now() - 172800000).toISOString() }
                ]
            },
            '/goals': {
                goals: [
                    { id: 1, name: 'Yeni Laptop', target_amount: 15000, saved_amount: 5200, progress_percentage: 34.67, deadline: new Date(Date.now() + 90 * 86400000).toISOString() },
                    { id: 2, name: 'Tatil', target_amount: 8000, saved_amount: 3200, progress_percentage: 40, deadline: new Date(Date.now() + 120 * 86400000).toISOString() }
                ]
            }
        };

        return mockData[endpoint] || { message: 'Mock data not available' };
    }

    handleUnauthorized() {
        localStorage.removeItem('sikke_token');
        localStorage.removeItem('sikke_user');
        window.location.href = 'login.html';
    }

    // Auth endpoints
    async login(email, password) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
    }

    async register(userData) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    // Dashboard endpoints
    async getDashboardOverview() {
        return this.request('/dashboard/overview');
    }

    async getDashboardInsights() {
        return this.request('/dashboard/insights');
    }

    // Expenses endpoints
    async getExpenses(params = {}) {
        const query = new URLSearchParams(params).toString();
        return this.request(`/expenses?${query}`);
    }

    async addExpense(expenseData) {
        return this.request('/expenses', {
            method: 'POST',
            body: JSON.stringify(expenseData)
        });
    }
}

// Create global API instance
window.apiService = new ApiService();