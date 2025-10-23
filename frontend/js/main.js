// Ana JavaScript Dosyası

class SikkeApp {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeCounters();
        this.checkAuthStatus();
    }

    setupEventListeners() {
        // Mobile menu toggle
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const mobileMenu = document.getElementById('mobileMenu');

        if (mobileMenuBtn && mobileMenu) {
            mobileMenuBtn.addEventListener('click', () => {
                mobileMenu.classList.toggle('active');
                mobileMenuBtn.classList.toggle('active');
            });
        }

        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Close mobile menu when clicking on links
        document.querySelectorAll('.mobile-nav-link').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
                mobileMenuBtn.classList.remove('active');
            });
        });
    }

    initializeCounters() {
        // Animated counters in hero section
        this.animateCounter('dailyLimitCounter', 147, 0, 2000);
        this.animateCounter('savingsCounter', 23, 0, 2000);
        this.animateCounter('usersCounter', 1250, 0, 2000);
    }

    animateCounter(elementId, target, start = 0, duration = 2000) {
        const element = document.getElementById(elementId);
        if (!element) return;

        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const value = Math.floor(progress * (target - start) + start);

            element.textContent = elementId === 'usersCounter' ?
                value.toLocaleString() :
                elementId === 'savingsCounter' ? value + '%' : '₺' + value;

            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };

        window.requestAnimationFrame(step);
    }

    checkAuthStatus() {
        // Check if user is logged in (localStorage'dan kontrol edeceğiz)
        const token = localStorage.getItem('sikke_token');
        const user = localStorage.getItem('sikke_user');

        if (token && user) {
            this.updateUIForLoggedInUser(JSON.parse(user));
        }
    }

    updateUIForLoggedInUser(user) {
        // Update navigation for logged in users
        const authButtons = document.querySelector('.auth-buttons');
        if (authButtons) {
            authButtons.innerHTML = `
                <a href="dashboard.html" class="btn btn-outline">Dashboard</a>
                <a href="#" class="btn btn-primary" onclick="SikkeApp.logout()">Çıkış Yap</a>
            `;
        }
    }

    static async login(email, password) {
        try {
            // GEÇİCİ: Backend hazır olana kadar localStorage'a kaydediyoruz
            console.log('Login attempt:', email);

            // Fake delay (API simülasyonu)
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Demo kullanıcı verisi
            const userData = {
                id: 1,
                fullName: email.split('@')[0],
                email: email,
                avatar: 'assets/icons/user-default.png'
            };

            localStorage.setItem('sikke_token', 'demo_token_' + Date.now());
            localStorage.setItem('sikke_user', JSON.stringify(userData));

            Utils.showNotification('Başarıyla giriş yapıldı! (Demo mod)', 'success');

            // Dashboard'a yönlendir
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);

        } catch (error) {
            console.error('Login error:', error);
            Utils.showNotification('Giriş başarısız: ' + error.message, 'error');
            throw error;
        }
    }

    static async register(userData) {
        try {
            // GEÇİCİ: Backend hazır olana kadar localStorage'a kaydediyoruz
            console.log('Register attempt:', userData);

            // Fake delay (API simülasyonu)
            await new Promise(resolve => setTimeout(resolve, 1000));

            const user = {
                id: Date.now(),
                fullName: userData.fullName,
                email: userData.email,
                avatar: 'assets/icons/user-default.png'
            };

            localStorage.setItem('sikke_token', 'demo_token_' + Date.now());
            localStorage.setItem('sikke_user', JSON.stringify(user));

            Utils.showNotification('Hesabınız başarıyla oluşturuldu! (Demo mod)', 'success');

            // Dashboard'a yönlendir
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);

        } catch (error) {
            console.error('Register error:', error);
            Utils.showNotification('Kayıt başarısız: ' + error.message, 'error');
            throw error;
        }
    }

    static logout() {
        localStorage.removeItem('sikke_token');
        localStorage.removeItem('sikke_user');
        window.location.href = 'index.html';
    }

    static getAuthToken() {
        return localStorage.getItem('sikke_token');
    }

    static getCurrentUser() {
        const user = localStorage.getItem('sikke_user');
        return user ? JSON.parse(user) : null;
    }

    static isAuthenticated() {
        return !!localStorage.getItem('sikke_token');
    }
}

// API helper functions
class ApiService {
    static async request(endpoint, options = {}) {
        const token = SikkeApp.getAuthToken();
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(`/api${endpoint}`, config);
            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    SikkeApp.logout();
                }
                throw new Error(data.message || 'API hatası');
            }

            return data;
        } catch (error) {
            console.error('API request error:', error);
            throw error;
        }
    }

    static async get(endpoint) {
        return this.request(endpoint);
    }

    static async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    static async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    static async delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE'
        });
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.SikkeApp = new SikkeApp();
});

// Utility functions
const Utils = {
    formatCurrency(amount, currency = 'TRY') {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: currency
        }).format(amount);
    },

    formatDate(date) {
        return new Intl.DateTimeFormat('tr-TR').format(new Date(date));
    },

    formatPercentage(value) {
        return `${value.toFixed(1)}%`;
    },

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} fade-in`;
        notification.textContent = message;

        // Add to page
        document.body.appendChild(notification);

        // Remove after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
};

// Make utils globally available
window.Utils = Utils;