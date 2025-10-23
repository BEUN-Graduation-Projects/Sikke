// Auth specific functionality
class AuthUI {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 3;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupPasswordToggle();
        this.setupPasswordStrength();
        this.setupFormSteps();
        this.setupSocialButtons();
        this.setupPageTransitions();
    }

    setupEventListeners() {
        // Input animations
        document.querySelectorAll('.form-input').forEach(input => {
            input.addEventListener('focus', this.handleInputFocus);
            input.addEventListener('blur', this.handleInputBlur);
        });
    }

    handleInputFocus(e) {
        const parent = e.target.closest('.input-group');
        parent.classList.add('focused');
    }

    handleInputBlur(e) {
        const parent = e.target.closest('.input-group');
        if (!e.target.value) {
            parent.classList.remove('focused');
        }
    }

    setupPasswordToggle() {
        document.querySelectorAll('.toggle-password').forEach(button => {
            button.addEventListener('click', (e) => {
                const input = e.target.closest('.input-group').querySelector('input');
                const icon = e.target.querySelector('i');

                if (input.type === 'password') {
                    input.type = 'text';
                    icon.className = 'fas fa-eye-slash';
                } else {
                    input.type = 'password';
                    icon.className = 'fas fa-eye';
                }
            });
        });
    }

    setupPasswordStrength() {
        const passwordInput = document.getElementById('password');
        if (!passwordInput) return;

        passwordInput.addEventListener('input', (e) => {
            const password = e.target.value;
            this.updatePasswordStrength(password);
        });
    }

    updatePasswordStrength(password) {
        const bars = document.querySelectorAll('.strength-bars .bar');
        const text = document.querySelector('.strength-text span');

        let strength = 0;
        let color = '#ef4444';
        let message = 'zayıf';

        // Length check
        if (password.length >= 8) strength += 25;
        // Lowercase and uppercase check
        if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength += 25;
        // Numbers check
        if (password.match(/\d/)) strength += 25;
        // Special characters check
        if (password.match(/[^a-zA-Z\d]/)) strength += 25;

        if (strength >= 75) {
            color = '#10b981';
            message = 'güçlü';
        } else if (strength >= 50) {
            color = '#f59e0b';
            message = 'orta';
        }

        // Update bars
        bars.forEach((bar, index) => {
            const barStrength = (index + 1) * 25;
            if (strength >= barStrength) {
                bar.style.background = color;
            } else {
                bar.style.background = 'var(--bg-tertiary)';
            }
        });

        // Update text
        if (text) {
            text.textContent = message;
            text.style.color = color;
        }
    }

    setupFormSteps() {
        const nextBtn = document.querySelector('.btn-next');
        const prevBtn = document.querySelector('.btn-prev');
        const submitBtn = document.querySelector('.btn-submit');

        if (!nextBtn) return;

        nextBtn.addEventListener('click', () => this.nextStep());
        if (prevBtn) prevBtn.addEventListener('click', () => this.prevStep());
        if (submitBtn) submitBtn.addEventListener('click', (e) => this.handleSubmit(e));
    }

    nextStep() {
        if (this.currentStep >= this.totalSteps) return;

        // Validate current step
        if (!this.validateStep(this.currentStep)) {
            return;
        }

        this.currentStep++;
        this.updateStepUI();
    }

    prevStep() {
        if (this.currentStep <= 1) return;

        this.currentStep--;
        this.updateStepUI();
    }

    validateStep(step) {
        switch (step) {
            case 1:
                return this.validatePersonalInfo();
            case 2:
                return this.validateGoals();
            case 3:
                return this.validatePreferences();
            default:
                return true;
        }
    }

    validatePersonalInfo() {
        const required = ['fullName', 'email', 'password', 'confirmPassword'];
        let isValid = true;

        required.forEach(field => {
            const input = document.getElementById(field);
            if (!input || !input.value.trim()) {
                this.showFieldError(input, 'Bu alan zorunludur');
                isValid = false;
            } else {
                this.clearFieldError(input);
            }
        });

        // Email validation
        const email = document.getElementById('email');
        if (email && email.value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email.value)) {
                this.showFieldError(email, 'Geçerli bir e-posta adresi girin');
                isValid = false;
            }
        }

        // Password match validation
        const password = document.getElementById('password');
        const confirmPassword = document.getElementById('confirmPassword');
        if (password && confirmPassword && password.value !== confirmPassword.value) {
            this.showFieldError(confirmPassword, 'Şifreler eşleşmiyor');
            isValid = false;
        }

        return isValid;
    }

    validateGoals() {
        const goalSelected = document.querySelector('input[name="goal"]:checked');
        if (!goalSelected) {
            Utils.showNotification('Lütfen bir finansal hedef seçin', 'warning');
            return false;
        }
        return true;
    }

    validatePreferences() {
        const termsAccepted = document.getElementById('terms');
        if (!termsAccepted || !termsAccepted.checked) {
            Utils.showNotification('Kullanım koşullarını kabul etmelisiniz', 'warning');
            return false;
        }
        return true;
    }

    showFieldError(input, message) {
        const parent = input.closest('.input-group');
        parent.classList.add('error');

        // Remove existing error message
        const existingError = parent.querySelector('.error-message');
        if (existingError) existingError.remove();

        // Add error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            color: #ef4444;
            font-size: 0.75rem;
            margin-top: 0.25rem;
        `;
        parent.appendChild(errorDiv);
    }

    clearFieldError(input) {
        const parent = input.closest('.input-group');
        parent.classList.remove('error');
        const errorMessage = parent.querySelector('.error-message');
        if (errorMessage) errorMessage.remove();
    }

    updateStepUI() {
        // Update steps
        document.querySelectorAll('.step').forEach((step, index) => {
            if (index + 1 === this.currentStep) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });

        // Update form steps
        document.querySelectorAll('.form-step').forEach((step, index) => {
            if (index + 1 === this.currentStep) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });

        // Update navigation buttons
        const prevBtn = document.querySelector('.btn-prev');
        const nextBtn = document.querySelector('.btn-next');
        const submitBtn = document.querySelector('.btn-submit');

        if (prevBtn) {
            prevBtn.style.display = this.currentStep > 1 ? 'flex' : 'none';
        }

        if (nextBtn && submitBtn) {
            if (this.currentStep === this.totalSteps) {
                nextBtn.style.display = 'none';
                submitBtn.style.display = 'flex';
            } else {
                nextBtn.style.display = 'flex';
                submitBtn.style.display = 'none';
            }
        }
    }

    setupSocialButtons() {
        document.querySelectorAll('.social-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const provider = btn.classList[1]; // google, microsoft, apple
                this.handleSocialLogin(provider);
            });
        });
    }

    handleSocialLogin(provider) {
        Utils.showNotification(`${provider.charAt(0).toUpperCase() + provider.slice(1)} ile giriş yakında eklenecek`, 'info');

        // Simulate loading
        const btn = event.currentTarget;
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Yönlendiriliyor...</span>';
        btn.disabled = true;

        setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.disabled = false;
        }, 2000);
    }

    setupPageTransitions() {
        // Page load transition
        window.addEventListener('load', () => {
            setTimeout(() => {
                document.querySelector('.page-transition').classList.remove('active');
            }, 1000);
        });

        // Form submission transition
        document.querySelectorAll('form').forEach(form => {
            form.addEventListener('submit', (e) => {
                const submitBtn = form.querySelector('button[type="submit"]');
                if (submitBtn) {
                    const loader = submitBtn.querySelector('.btn-loader');
                    const text = submitBtn.querySelector('#loginText, #signupText');

                    if (loader && text) {
                        text.style.opacity = '0';
                        loader.style.display = 'block';
                    }
                }
            });
        });
    }

    async handleSubmit(e) {
        e.preventDefault();

        if (!this.validateStep(this.currentStep)) {
            return;
        }

        const formData = {
            fullName: document.getElementById('fullName').value,
            email: document.getElementById('email').value,
            password: document.getElementById('password').value,
            goal: document.querySelector('input[name="goal"]:checked')?.value,
            newsletter: document.getElementById('newsletter')?.checked,
            analytics: document.getElementById('analytics')?.checked
        };

        try {
            await SikkeApp.register(formData);
        } catch (error) {
            // Error handling is done in the main.js
        }
    }
}

// Initialize auth UI when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.AuthUI = new AuthUI();
});