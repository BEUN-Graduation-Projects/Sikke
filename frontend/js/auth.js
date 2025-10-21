class AuthManager {
    constructor() {
        this.api = window.apiService;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkExistingAuth();
    }

    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Register form
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));

            // Password strength check
            const passwordInput = document.getElementById('regPassword');
            if (passwordInput) {
                passwordInput.addEventListener('input', () => this.checkPasswordStrength());
            }

            // Password match check
            const confirmInput = document.getElementById('confirmPassword');
            if (confirmInput) {
                confirmInput.addEventListener('input', () => this.checkPasswordMatch());
            }
        }
    }

    checkExistingAuth() {
        const token = localStorage.getItem('sikke_token');
        if (token && (window.location.pathname.includes('login.html') || window.location.pathname.includes('register.html'))) {
            window.location.href = 'index.html';
        }
    }

    async handleLogin(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        const data = {
            email: formData.get('email'),
            password: formData.get('password')
        };

        await this.submitAuthRequest('login', data, 'Giriş başarılı!');
    }

    async handleRegister(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        const data = {
            email: formData.get('email'),
            password: formData.get('password'),
            monthly_income: parseFloat(formData.get('monthly_income')) || 0,
            fixed_expenses: parseFloat(formData.get('fixed_expenses')) || 0
        };

        // Password confirmation check
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');

        if (password !== confirmPassword) {
            this.showToast('Şifreler eşleşmiyor!', 'error');
            return;
        }

        if (password.length < 6) {
            this.showToast('Şifre en az 6 karakter olmalıdır!', 'error');
            return;
        }

        await this.submitAuthRequest('register', data, 'Hesap başarıyla oluşturuldu!');
    }

  async submitAuthRequest(type, data, successMessage) {
        const submitBtn = document.getElementById('loginBtn') || document.getElementById('registerBtn');
        this.setLoadingState(submitBtn, true);

        try {
            let result;

            // Demo hesap için özel kontrol
            if (data.email === 'demo@sikke.com' && data.password === 'demo123') {
                result = await this.handleDemoAuth();
            } else {
                if (type === 'login') {
                    result = await this.api.login(data.email, data.password);
                } else {
                    result = await this.api.register(data);
                }
            }

            // Save token and user data
            localStorage.setItem('sikke_token', result.token);
            localStorage.setItem('sikke_user', JSON.stringify(result.user));

            this.showToast(successMessage, 'success');

            // Hemen yönlendir, setTimeout beklemeden
            console.log('Giriş başarılı, yönlendiriliyor...');
            window.location.href = 'index.html';

        } catch (error) {
            console.error('Auth error:', error);
            this.showToast(error.message, 'error');
        } finally {
            this.setLoadingState(submitBtn, false);
        }
    }


    async handleDemoAuth() {
        // Demo kullanıcı için mock response
        const demoUser = {
            id: 1,
            email: 'demo@sikke.com',
            monthly_income: 15000,
            fixed_expenses: 7500,
            created_at: new Date().toISOString()
        };

        // Mock token oluştur
        const demoToken = 'demo-token-' + Date.now();

        return {
            token: demoToken,
            user: demoUser,
            message: 'Demo girişi başarılı'
        };
    }

    checkPasswordStrength() {
        const password = document.getElementById('regPassword').value;
        const strengthBar = document.getElementById('passwordStrength');
        const strengthText = document.getElementById('passwordText');

        if (!strengthBar || !strengthText) return;

        if (!password) {
            strengthBar.style.width = '0%';
            strengthBar.style.backgroundColor = 'transparent';
            strengthText.textContent = 'Şifre gücü: zayıf';
            return;
        }

        let strength = 0;
        let feedback = '';

        // Length check
        if (password.length >= 6) strength += 25;
        if (password.length >= 8) strength += 15;

        // Character variety checks
        if (/[a-z]/.test(password)) strength += 15;
        if (/[A-Z]/.test(password)) strength += 15;
        if (/[0-9]/.test(password)) strength += 15;
        if (/[^a-zA-Z0-9]/.test(password)) strength += 15;

        // Update UI
        strengthBar.style.width = `${Math.min(strength, 100)}%`;

        if (strength < 40) {
            strengthBar.style.backgroundColor = '#f56565';
            feedback = 'zayıf';
        } else if (strength < 70) {
            strengthBar.style.backgroundColor = '#ed8936';
            feedback = 'orta';
        } else {
            strengthBar.style.backgroundColor = '#48bb78';
            feedback = 'güçlü';
        }

        strengthText.textContent = `Şifre gücü: ${feedback}`;
    }

    checkPasswordMatch() {
        const password = document.getElementById('regPassword');
        const confirmPassword = document.getElementById('confirmPassword');
        const matchHint = document.getElementById('passwordMatch');

        if (!password || !confirmPassword || !matchHint) return;

        const passwordValue = password.value;
        const confirmValue = confirmPassword.value;

        if (!confirmValue) {
            matchHint.textContent = '';
            return;
        }

        if (passwordValue === confirmValue) {
            matchHint.textContent = 'Şifreler eşleşiyor ✓';
            matchHint.style.color = 'var(--primary-green)';
        } else {
            matchHint.textContent = 'Şifreler eşleşmiyor ✗';
            matchHint.style.color = 'var(--text-danger)';
        }
    }

    setLoadingState(button, isLoading) {
        if (!button) return;

        if (isLoading) {
            button.classList.add('loading');
            button.disabled = true;
        } else {
            button.classList.remove('loading');
            button.disabled = false;
        }
    }

    showToast(message, type = 'info') {
        let toast = document.getElementById('toast');

        // Toast yoksa oluştur
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toast';
            toast.className = 'toast hidden';
            toast.innerHTML = `
                <div class="toast-content">
                    <i class="toast-icon"></i>
                    <span class="toast-message"></span>
                </div>
            `;
            document.body.appendChild(toast);
        }

        const toastIcon = toast.querySelector('.toast-icon');
        const toastMessage = toast.querySelector('.toast-message');

        // Set icon based on type
        let iconClass = 'fas fa-info-circle';
        if (type === 'success') iconClass = 'fas fa-check-circle';
        if (type === 'error') iconClass = 'fas fa-exclamation-circle';

        toastIcon.className = `toast-icon ${iconClass}`;
        toastMessage.textContent = message;

        // Update toast class
        toast.className = `toast ${type}`;
        toast.style.display = 'block';

        // Show with animation
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        // Auto hide after 5 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.style.display = 'none';
            }, 300);
        }, 5000);
    }

    // Demo login for testing
    async demoLogin() {
        const demoData = {
            email: 'demo@sikke.com',
            password: 'demo123'
        };

        // Demo butonunu bul ve loading state'e al
        const demoBtn = document.querySelector('[onclick*="demoLogin"]');
        if (demoBtn) {
            const originalText = demoBtn.innerHTML;
            demoBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Giriş yapılıyor...';
            demoBtn.disabled = true;

            try {
                await this.submitAuthRequest('login', demoData, 'Demo hesabına giriş yapıldı!');
            } finally {
                demoBtn.innerHTML = originalText;
                demoBtn.disabled = false;
            }
        } else {
            await this.submitAuthRequest('login', demoData, 'Demo hesabına giriş yapıldı!');
        }
    }
}

// Initialize auth manager
document.addEventListener('DOMContentLoaded', () => {
    // Önce API service'i kontrol et
    if (typeof window.apiService === 'undefined') {
        // Basit bir API service oluştur
        window.apiService = {
            async login(email, password) {
                // Backend henüz hazır değilse demo response dön
                if (email === 'demo@sikke.com' && password === 'demo123') {
                    return {
                        token: 'demo-token-' + Date.now(),
                        user: {
                            id: 1,
                            email: 'demo@sikke.com',
                            monthly_income: 15000,
                            fixed_expenses: 7500,
                            created_at: new Date().toISOString()
                        }
                    };
                }
                throw new Error('Geçersiz email veya şifre');
            },

            async register(userData) {
                // Basit kayıt işlemi
                return {
                    token: 'demo-token-' + Date.now(),
                    user: {
                        id: Date.now(),
                        email: userData.email,
                        monthly_income: userData.monthly_income,
                        fixed_expenses: userData.fixed_expenses,
                        created_at: new Date().toISOString()
                    }
                };
            }
        };
    }

    window.authManager = new AuthManager();

    // Add demo login shortcut (for development)
    if (window.location.pathname.includes('login.html') || window.location.pathname.endsWith('/')) {
        const authFooter = document.querySelector('.auth-footer');
        if (authFooter && !document.querySelector('.demo-login-btn')) {
            const demoLoginBtn = document.createElement('button');
            demoLoginBtn.textContent = 'Demo Giriş';
            demoLoginBtn.className = 'btn btn-secondary btn-sm demo-login-btn';
            demoLoginBtn.style.marginTop = '16px';
            demoLoginBtn.onclick = () => window.authManager.demoLogin();

            authFooter.appendChild(demoLoginBtn);
        }
    }
});