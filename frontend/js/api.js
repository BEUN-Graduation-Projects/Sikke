// API-specific functions for Sikke app

class SikkeAPI {
    // Auth endpoints
    static async login(email, password) {
        return ApiService.post('/auth/login', { email, password });
    }

    static async register(userData) {
        return ApiService.post('/auth/register', userData);
    }

    static async logout() {
        return ApiService.post('/auth/logout');
    }

    // Expense endpoints
    static async getExpenses() {
        return ApiService.get('/expenses');
    }

    static async addExpense(expenseData) {
        return ApiService.post('/expenses', expenseData);
    }

    static async updateExpense(id, expenseData) {
        return ApiService.put(`/expenses/${id}`, expenseData);
    }

    static async deleteExpense(id) {
        return ApiService.delete(`/expenses/${id}`);
    }

    // Budget endpoints
    static async getBudget() {
        return ApiService.get('/budget');
    }

    static async updateBudget(budgetData) {
        return ApiService.put('/budget', budgetData);
    }

    static async getDailyLimit() {
        return ApiService.get('/budget/daily-limit');
    }

    // Goals endpoints
    static async getGoals() {
        return ApiService.get('/goals');
    }

    static async addGoal(goalData) {
        return ApiService.post('/goals', goalData);
    }

    static async updateGoal(id, goalData) {
        return ApiService.put(`/goals/${id}`, goalData);
    }

    static async deleteGoal(id) {
        return ApiService.delete(`/goals/${id}`);
    }

    // Investments endpoints
    static async getInvestments() {
        return ApiService.get('/investments');
    }

    static async getInvestmentSuggestions() {
        return ApiService.get('/investments/suggestions');
    }

    static async addInvestment(investmentData) {
        return ApiService.post('/investments', investmentData);
    }

    // Dashboard endpoints
    static async getDashboardData() {
        return ApiService.get('/dashboard');
    }

    static async getMonthlyReport(month, year) {
        return ApiService.get(`/reports/monthly?month=${month}&year=${year}`);
    }

    // User settings
    static async updateProfile(userData) {
        return ApiService.put('/user/profile', userData);
    }

    static async changePassword(passwordData) {
        return ApiService.put('/user/password', passwordData);
    }
}

// Error handling
class APIErrorHandler {
    static handle(error) {
        console.error('API Error:', error);

        let userMessage = 'Bir hata oluştu. Lütfen tekrar deneyin.';

        if (error.message.includes('Network')) {
            userMessage = 'İnternet bağlantınızı kontrol edin.';
        } else if (error.message.includes('401')) {
            userMessage = 'Oturumunuz sona erdi. Lütfen tekrar giriş yapın.';
            SikkeApp.logout();
        } else if (error.message.includes('404')) {
            userMessage = 'İstenen kaynak bulunamadı.';
        } else if (error.message.includes('500')) {
            userMessage = 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.';
        } else {
            userMessage = error.message || userMessage;
        }

        Utils.showNotification(userMessage, 'error');
        return userMessage;
    }
}

// Make API globally available
window.SikkeAPI = SikkeAPI;
window.APIErrorHandler = APIErrorHandler;