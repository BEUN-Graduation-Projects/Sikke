// Settings functionality
class SettingsManager {
    constructor() {
        this.currentTab = 'profile';
        this.userData = {};
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadUserData();
        this.updateUserInfo();
        this.setupFormValidation();
    }

    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const tab = e.currentTarget.dataset.tab;
                this.switchTab(tab);
            });
        });

        // Profile form
        const profileForm = document.getElementById('profileForm');
        const cancelProfile = document.getElementById('cancelProfile');

        if (profileForm) {
            profileForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveProfile(e.target);
            });
        }

        if (cancelProfile) {
            cancelProfile.addEventListener('click', () => {
                this.resetProfileForm();
            });
        }

        // Change avatar
        const changeAvatarBtn = document.getElementById('changeAvatarBtn');
        if (changeAvatarBtn) {
            changeAvatarBtn.addEventListener('click', () => {
                this.changeAvatar();
            });
        }

        // Budget form
        const incomeForm = document.getElementById('incomeForm');
        if (incomeForm) {
            incomeForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveBudgetSettings(e.target);
            });
        }

        // Savings percentage slider
        const savingsSlider = document.getElementById('savingsPercentage');
        if (savingsSlider) {
            savingsSlider.addEventListener('input', (e) => {
                this.updateSavingsDisplay(e.target.value);
            });
        }

        // Change password
        const changePasswordBtn = document.getElementById('changePasswordBtn');
        const passwordModal = document.getElementById('passwordModal');
        const closePasswordModal = document.getElementById('closePasswordModal');
        const cancelPassword = document.getElementById('cancelPassword');
        const passwordForm = document.getElementById('passwordForm');

        if (changePasswordBtn) {
            changePasswordBtn.addEventListener('click', () => {
                passwordModal.classList.add('active');
            });
        }

        if (closePasswordModal) {
            closePasswordModal.addEventListener('click', () => {
                this.closePasswordModal();
            });
        }

        if (cancelPassword) {
            cancelPassword.addEventListener('click', () => {
                this.closePasswordModal();
            });
        }

        if (passwordForm) {
            passwordForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.changePassword(e.target);
            });
        }

        // Data management buttons
        const exportDataBtn = document.getElementById('exportDataBtn');
        const backupDataBtn = document.getElementById('backupDataBtn');
        const importDataBtn = document.getElementById('importDataBtn');
        const clearCacheBtn = document.getElementById('clearCacheBtn');
        const deleteAllDataBtn = document.getElementById('deleteAllDataBtn');

        if (exportDataBtn) {
            exportDataBtn.addEventListener('click', () => {
                this.exportData();
            });
        }

        if (backupDataBtn) {
            backupDataBtn.addEventListener('click', () => {
                this.backupData();
            });
        }

        if (importDataBtn) {
            importDataBtn.addEventListener('click', () => {
                this.importData();
            });
        }

        if (clearCacheBtn) {
            clearCacheBtn.addEventListener('click', () => {
                this.clearCache();
            });
        }

        if (deleteAllDataBtn) {
            deleteAllDataBtn.addEventListener('click', () => {
                this.deleteAllData();
            });
        }

        // Theme selection
        document.querySelectorAll('input[name="theme"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.changeTheme(e.target.value);
            });
        });

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

        // Password strength indicator
        const newPasswordInput = document.getElementById('newPassword');
        if (newPasswordInput) {
            newPasswordInput.addEventListener('input', (e) => {
                this.updatePasswordStrength(e.target.value);
            });
        }
    }

    switchTab(tab) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

        // Update content
        document.querySelectorAll('.settings-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.getElementById(`${tab}-tab`).classList.add('active');

        this.currentTab = tab;
    }

    async loadUserData() {
        try {
            // GEÇİCİ: Demo user data
            const user = SikkeApp.getCurrentUser();

            if (user) {
                this.userData = {
                    fullName: user.fullName || 'Kullanıcı',
                    email: user.email,
                    phone: '+90 (5__) ___ ____',
                    birthDate: '1990-01-01',
                    bio: 'Finansal özgürlük yolunda ilerliyorum!',
                    monthlyIncome: 7500,
                    monthlyExpenses: 4500,
                    savingsPercentage: 10,
                    theme: 'dark',
                    currency: 'TRY',
                    dateFormat: 'DD/MM/YYYY',
                    timeFormat: '24h'
                };

                this.populateForms();
            }
        } catch (error) {
            console.error('User data loading error:', error);
        }
    }

    populateForms() {
        // Profile form
        document.getElementById('profileFullName').value = this.userData.fullName;
        document.getElementById('profileEmail').value = this.userData.email;
        document.getElementById('profilePhone').value = this.userData.phone;
        document.getElementById('profileBirthDate').value = this.userData.birthDate;
        document.getElementById('profileBio').value = this.userData.bio;

        // Update profile display
        document.getElementById('profileUserName').textContent = this.userData.fullName;
        document.getElementById('profileUserEmail').textContent = this.userData.email;

        // Budget settings
        document.getElementById('monthlyIncome').value = this.userData.monthlyIncome;
        document.getElementById('monthlyExpenses').value = this.userData.monthlyExpenses;
        document.getElementById('savingsPercentage').value = this.userData.savingsPercentage;
        this.updateSavingsDisplay(this.userData.savingsPercentage);

        // Preferences
        document.querySelector(`input[name="theme"][value="${this.userData.theme}"]`).checked = true;
        document.getElementById('currencySelect').value = this.userData.currency;
        document.querySelector(`input[name="dateFormat"][value="${this.userData.dateFormat}"]`).checked = true;
        document.querySelector(`input[name="timeFormat"][value="${this.userData.timeFormat}"]`).checked = true;
    }

    updateSavingsDisplay(percentage) {
        const monthlyIncome = parseFloat(document.getElementById('monthlyIncome').value) || 0;
        const savingsAmount = (monthlyIncome * percentage) / 100;

        document.getElementById('savingsValue').textContent = `${percentage}%`;
        document.getElementById('savingsAmount').textContent = savingsAmount.toLocaleString('tr-TR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    setupFormValidation() {
        // Real-time form validation can be added here
        const passwordForm = document.getElementById('passwordForm');
        if (passwordForm) {
            const confirmPassword = document.getElementById('confirmNewPassword');
            const newPassword = document.getElementById('newPassword');

            confirmPassword.addEventListener('input', () => {
                this.validatePasswordMatch();
            });

            newPassword.addEventListener('input', () => {
                this.validatePasswordMatch();
            });
        }
    }

    validatePasswordMatch() {
        const newPassword = document.getElementById('newPassword');
        const confirmPassword = document.getElementById('confirmNewPassword');

        if (newPassword.value && confirmPassword.value) {
            if (newPassword.value !== confirmPassword.value) {
                confirmPassword.style.borderColor = '#ef4444';
            } else {
                confirmPassword.style.borderColor = '#10b981';
            }
        }
    }

    updatePasswordStrength(password) {
        const bars = document.querySelectorAll('#passwordForm .strength-bars .bar');
        const text = document.querySelector('#passwordForm .strength-text span');

        let strength = 0;
        let message = 'zayıf';
        let color = '#ef4444';

        if (password.length >= 8) strength += 25;
        if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength += 25;
        if (password.match(/\d/)) strength += 25;
        if (password.match(/[^a-zA-Z\d]/)) strength += 25;

        if (strength >= 75) {
            color = '#10b981';
            message = 'güçlü';
        } else if (strength >= 50) {
            color = '#f59e0b';
            message = 'orta';
        }

        bars.forEach((bar, index) => {
            const barStrength = (index + 1) * 25;
            bar.style.background = strength >= barStrength ? color : 'var(--bg-tertiary)';
        });

        if (text) {
            text.textContent = message;
            text.style.color = color;
        }
    }

    async saveProfile(form) {
        const formData = new FormData(form);
        const profileData = {
            fullName: formData.get('fullName') || document.getElementById('profileFullName').value,
            email: formData.get('email') || document.getElementById('profileEmail').value,
            phone: formData.get('phone') || document.getElementById('profilePhone').value,
            birthDate: formData.get('birthDate') || document.getElementById('profileBirthDate').value,
            bio: formData.get('bio') || document.getElementById('profileBio').value
        };

        try {
            // GEÇİCİ: LocalStorage'a kaydediyoruz
            console.log('Saving profile:', profileData);

            // Fake delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Update user data
            this.userData = { ...this.userData, ...profileData };

            // Update current user in localStorage
            const currentUser = SikkeApp.getCurrentUser();
            if (currentUser) {
                currentUser.fullName = profileData.fullName;
                currentUser.email = profileData.email;
                localStorage.setItem('sikke_user', JSON.stringify(currentUser));
            }

            // Update UI
            this.updateUserInfo();
            document.getElementById('profileUserName').textContent = profileData.fullName;
            document.getElementById('profileUserEmail').textContent = profileData.email;

            Utils.showNotification('Profil başarıyla güncellendi!', 'success');

        } catch (error) {
            console.error('Save profile error:', error);
            Utils.showNotification('Profil güncellenemedi: ' + error.message, 'error');
        }
    }

    resetProfileForm() {
        this.populateForms();
    }

    async saveBudgetSettings(form) {
        const formData = new FormData(form);
        const budgetData = {
            monthlyIncome: parseFloat(formData.get('income') || document.getElementById('monthlyIncome').value),
            monthlyExpenses: parseFloat(formData.get('expenses') || document.getElementById('monthlyExpenses').value),
            savingsPercentage: parseInt(document.getElementById('savingsPercentage').value)
        };

        try {
            // GEÇİCİ: LocalStorage'a kaydediyoruz
            console.log('Saving budget settings:', budgetData);

            // Fake delay
            await new Promise(resolve => setTimeout(resolve, 500));

            this.userData = { ...this.userData, ...budgetData };

            Utils.showNotification('Bütçe ayarları başarıyla güncellendi!', 'success');

        } catch (error) {
            console.error('Save budget error:', error);
            Utils.showNotification('Bütçe ayarları güncellenemedi: ' + error.message, 'error');
        }
    }

    async changePassword(form) {
        const formData = new FormData(form);
        const passwordData = {
            currentPassword: formData.get('currentPassword') || document.getElementById('currentPassword').value,
            newPassword: formData.get('newPassword') || document.getElementById('newPassword').value,
            confirmPassword: formData.get('confirmPassword') || document.getElementById('confirmNewPassword').value
        };

        try {
            // GEÇİCİ: LocalStorage'a kaydediyoruz
            console.log('Changing password');

            // Fake delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            if (passwordData.newPassword !== passwordData.confirmPassword) {
                throw new Error('Yeni şifreler eşleşmiyor');
            }

            if (passwordData.newPassword.length < 8) {
                throw new Error('Şifre en az 8 karakter olmalıdır');
            }

            this.closePasswordModal();
            Utils.showNotification('Şifre başarıyla değiştirildi!', 'success');

        } catch (error) {
            console.error('Change password error:', error);
            Utils.showNotification('Şifre değiştirilemedi: ' + error.message, 'error');
        }
    }

    closePasswordModal() {
        document.getElementById('passwordModal').classList.remove('active');
        document.getElementById('passwordForm').reset();

        // Reset password strength indicator
        const bars = document.querySelectorAll('#passwordForm .strength-bars .bar');
        const text = document.querySelector('#passwordForm .strength-text span');

        bars.forEach(bar => {
            bar.style.background = 'var(--bg-tertiary)';
        });

        if (text) {
            text.textContent = 'zayıf';
            text.style.color = '#ef4444';
        }
    }

    changeAvatar() {
        // In a real app, this would open a file picker
        console.log('Changing avatar...');
        Utils.showNotification('Profil fotoğrafı değiştirme özelliği yakında eklenecek!', 'info');
    }

    changeTheme(theme) {
        // In a real app, this would change the theme dynamically
        console.log('Changing theme to:', theme);
        this.userData.theme = theme;

        // For demo purposes, we'll just show a notification
        const themeNames = {
            dark: 'Koyu',
            light: 'Açık',
            auto: 'Sistem'
        };

        Utils.showNotification(`Tema ${themeNames[theme]} olarak ayarlandı!`, 'success');
    }

    async exportData() {
        try {
            // GEÇİCİ: Demo export functionality
            console.log('Exporting data...');

            // Fake delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // In a real app, this would generate and download CSV files
            Utils.showNotification('Verileriniz CSV formatında dışa aktarıldı!', 'success');

        } catch (error) {
            console.error('Export data error:', error);
            Utils.showNotification('Veri dışa aktarma başarısız: ' + error.message, 'error');
        }
    }

    async backupData() {
        try {
            // GEÇİCİ: Demo backup functionality
            console.log('Backing up data...');

            // Fake delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            Utils.showNotification('Verilerinizin yedeği başarıyla alındı!', 'success');

        } catch (error) {
            console.error('Backup data error:', error);
            Utils.showNotification('Yedek alma başarısız: ' + error.message, 'error');
        }
    }

    async importData() {
        try {
            // GEÇİCİ: Demo import functionality
            console.log('Importing data...');

            // Fake delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // In a real app, this would open a file picker and process the file
            Utils.showNotification('CSV dosyasından veri içe aktarma özelliği yakında eklenecek!', 'info');

        } catch (error) {
            console.error('Import data error:', error);
            Utils.showNotification('Veri içe aktarma başarısız: ' + error.message, 'error');
        }
    }

    async clearCache() {
        if (!confirm('Önbellek verileri temizlenecek. Emin misiniz?')) {
            return;
        }

        try {
            // GEÇİCİ: Demo cache clearing
            console.log('Clearing cache...');

            // Fake delay
            await new Promise(resolve => setTimeout(resolve, 500));

            Utils.showNotification('Önbellek başarıyla temizlendi!', 'success');

        } catch (error) {
            console.error('Clear cache error:', error);
            Utils.showNotification('Önbellek temizleme başarısız: ' + error.message, 'error');
        }
    }

    async deleteAllData() {
        if (!confirm('TÜM VERİLERİNİZ KALICI OLARAK SİLİNECEK! Bu işlem geri alınamaz. Emin misiniz?')) {
            return;
        }

        if (!confirm('Son bir kez onaylayın: Tüm finansal verileriniz, hedefleriniz ve yatırımlarınız silinecek!')) {
            return;
        }

        try {
            // GEÇİCİ: Demo data deletion
            console.log('Deleting all data...');

            // Fake delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            Utils.showNotification('Tüm veriler başarıyla silindi!', 'success');

        } catch (error) {
            console.error('Delete data error:', error);
            Utils.showNotification('Veri silme başarısız: ' + error.message, 'error');
        }
    }

    updateUserInfo() {
        const user = SikkeApp.getCurrentUser();
        if (user) {
            const userName = document.getElementById('userName');
            const userEmail = document.getElementById('userEmail');
            const userAvatar = document.getElementById('userAvatar');
            const mobileUserName = document.getElementById('mobileUserName');
            const mobileUserEmail = document.getElementById('mobileUserEmail');
            const profileAvatar = document.getElementById('profileAvatar');

            if (userName) userName.textContent = user.fullName || 'Kullanıcı';
            if (userEmail) userEmail.textContent = user.email;
            if (userAvatar) userAvatar.src = user.avatar || 'assets/icons/user-default.png';
            if (mobileUserName) mobileUserName.textContent = user.fullName || 'Kullanıcı';
            if (mobileUserEmail) mobileUserEmail.textContent = user.email;
            if (profileAvatar) profileAvatar.src = user.avatar || 'assets/icons/user-default.png';
        }
    }
}

// Initialize settings when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    if (!SikkeApp.isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }

    window.SettingsManager = new SettingsManager();
});