// Goals functionality
class GoalsManager {
    constructor() {
        this.goals = [];
        this.currentFilter = 'all';
        this.editingGoalId = null;
        this.selectedGoalId = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadGoals();
        this.updateUserInfo();
    }

    setupEventListeners() {
        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                this.filterGoals();
            });
        });

        // Add goal modal
        const addGoalBtn = document.getElementById('addGoalBtn');
        const goalModal = document.getElementById('goalModal');
        const closeGoalModal = document.getElementById('closeGoalModal');
        const cancelGoal = document.getElementById('cancelGoal');
        const goalForm = document.getElementById('goalForm');
        const createFirstGoal = document.getElementById('createFirstGoal');

        if (addGoalBtn) {
            addGoalBtn.addEventListener('click', () => {
                this.openGoalModal();
            });
        }

        if (createFirstGoal) {
            createFirstGoal.addEventListener('click', () => {
                this.openGoalModal();
            });
        }

        if (closeGoalModal) {
            closeGoalModal.addEventListener('click', () => {
                this.closeGoalModal();
            });
        }

        if (cancelGoal) {
            cancelGoal.addEventListener('click', () => {
                this.closeGoalModal();
            });
        }

        if (goalForm) {
            goalForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveGoal(e.target);
            });
        }

        // Goal detail modal
        const closeDetailModal = document.getElementById('closeDetailModal');
        const editGoalBtn = document.getElementById('editGoalBtn');
        const addSavingsBtn = document.getElementById('addSavingsBtn');
        const deleteGoalBtn = document.getElementById('deleteGoalBtn');

        if (closeDetailModal) {
            closeDetailModal.addEventListener('click', () => {
                this.closeDetailModal();
            });
        }

        if (editGoalBtn) {
            editGoalBtn.addEventListener('click', () => {
                this.editGoal();
            });
        }

        if (addSavingsBtn) {
            addSavingsBtn.addEventListener('click', () => {
                this.openSavingsModal();
            });
        }

        if (deleteGoalBtn) {
            deleteGoalBtn.addEventListener('click', () => {
                this.deleteGoal();
            });
        }

        // Savings modal
        const closeSavingsModal = document.getElementById('closeSavingsModal');
        const cancelSavings = document.getElementById('cancelSavings');
        const savingsForm = document.getElementById('savingsForm');

        if (closeSavingsModal) {
            closeSavingsModal.addEventListener('click', () => {
                this.closeSavingsModal();
            });
        }

        if (cancelSavings) {
            cancelSavings.addEventListener('click', () => {
                this.closeSavingsModal();
            });
        }

        if (savingsForm) {
            savingsForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addSavings(e.target);
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

    async loadGoals() {
        try {
            // GEÇİCİ: Demo goals data
            const demoGoals = [
                {
                    id: 1,
                    title: "Yeni Laptop",
                    targetAmount: 20000,
                    savedAmount: 8400,
                    deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 gün sonra
                    category: "technology",
                    description: "Yüksek performanslı gaming laptop",
                    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 gün önce
                    status: "active"
                },
                {
                    id: 2,
                    title: "Tatil",
                    targetAmount: 15000,
                    savedAmount: 11250,
                    deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 gün sonra
                    category: "travel",
                    description: "Antalya'da 1 haftalık tatil",
                    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 gün önce
                    status: "active"
                },
                {
                    id: 3,
                    title: "Araba",
                    targetAmount: 150000,
                    savedAmount: 27000,
                    deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 yıl sonra
                    category: "vehicle",
                    description: "İkinci el aile arabası",
                    createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000), // 180 gün önce
                    status: "active"
                },
                {
                    id: 4,
                    title: "Yeni Telefon",
                    targetAmount: 8000,
                    savedAmount: 8000,
                    deadline: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 gün önce
                    category: "technology",
                    description: "Flagship akıllı telefon",
                    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 gün önce
                    status: "completed"
                },
                {
                    id: 5,
                    title: "Kurs Ücreti",
                    targetAmount: 5000,
                    savedAmount: 5000,
                    deadline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 gün önce
                    category: "education",
                    description: "Online yazılım geliştirme kursu",
                    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 gün önce
                    status: "completed"
                }
            ];

            this.goals = demoGoals;
            this.renderGoals();
            this.updateSummary();

        } catch (error) {
            console.error('Goals loading error:', error);
            // Hata durumunda boş goals array kullan
            this.goals = [];
            this.renderGoals();
            this.updateSummary();
        }
    }

    renderGoals() {
        const goalsGrid = document.getElementById('goalsGrid');
        const emptyState = document.getElementById('emptyState');

        if (!goalsGrid) return;

        if (this.goals.length === 0) {
            goalsGrid.style.display = 'none';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }

        goalsGrid.style.display = 'grid';
        if (emptyState) emptyState.style.display = 'none';

        const filteredGoals = this.filterGoalsByStatus(this.goals, this.currentFilter);

        goalsGrid.innerHTML = filteredGoals.map(goal => this.createGoalCard(goal)).join('');

        // Add click event to goal cards
        document.querySelectorAll('.goal-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.goal-actions')) {
                    const goalId = parseInt(card.dataset.goalId);
                    this.openGoalDetail(goalId);
                }
            });
        });

        // Add click events to action buttons
        document.querySelectorAll('.goal-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const goalId = parseInt(btn.closest('.goal-card').dataset.goalId);
                const action = btn.dataset.action;

                if (action === 'edit') {
                    this.editGoal(goalId);
                } else if (action === 'delete') {
                    this.deleteGoal(goalId);
                } else if (action === 'add') {
                    this.openSavingsModal(goalId);
                }
            });
        });
    }

    filterGoalsByStatus(goals, filter) {
        switch (filter) {
            case 'active':
                return goals.filter(goal => goal.status === 'active');
            case 'completed':
                return goals.filter(goal => goal.status === 'completed');
            default:
                return goals;
        }
    }

    filterGoals() {
        this.renderGoals();
    }

    createGoalCard(goal) {
        const progress = (goal.savedAmount / goal.targetAmount) * 100;
        const daysLeft = this.calculateDaysLeft(goal.deadline);
        const dailySave = this.calculateDailySave(goal);
        const status = this.getGoalStatus(goal);

        return `
            <div class="goal-card ${status}" data-goal-id="${goal.id}">
                <div class="goal-header">
                    <div>
                        <div class="goal-title">${goal.title}</div>
                        <span class="goal-category">${this.getCategoryName(goal.category)}</span>
                    </div>
                    <div class="goal-actions">
                        <button class="goal-action-btn" data-action="add" title="Birikim Ekle">
                            <i class="fas fa-plus"></i>
                        </button>
                        <button class="goal-action-btn" data-action="edit" title="Düzenle">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="goal-action-btn" data-action="delete" title="Sil">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                
                <div class="goal-progress">
                    <div class="progress-info">
                        <div class="progress-percent">%${Math.round(progress)}</div>
                        <div class="progress-amount">₺${goal.savedAmount.toLocaleString()} / ₺${goal.targetAmount.toLocaleString()}</div>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                </div>
                
                <div class="goal-details">
                    <div class="detail-item">
                        <div class="detail-label">Kalan Tutar</div>
                        <div class="detail-value ${goal.targetAmount - goal.savedAmount > 0 ? 'warning' : 'positive'}">
                            ₺${(goal.targetAmount - goal.savedAmount).toLocaleString()}
                        </div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Kalan Gün</div>
                        <div class="detail-value ${daysLeft < 0 ? 'negative' : daysLeft < 7 ? 'warning' : ''}">
                            ${daysLeft < 0 ? 'Süre doldu' : daysLeft + ' gün'}
                        </div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Günlük Tasarruf</div>
                        <div class="detail-value">
                            ₺${dailySave.toLocaleString()}
                        </div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Başlangıç</div>
                        <div class="detail-value">
                            ${this.formatDate(goal.createdAt)}
                        </div>
                    </div>
                </div>
                
                <div class="goal-footer">
                    <div class="goal-deadline">
                        Hedef Tarihi: ${this.formatDate(goal.deadline)}
                    </div>
                    <div class="goal-status status-${status}">
                        ${this.getStatusText(status)}
                    </div>
                </div>
            </div>
        `;
    }

    calculateDaysLeft(deadline) {
        const now = new Date();
        const target = new Date(deadline);
        const diffTime = target - now;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    calculateDailySave(goal) {
        const daysLeft = this.calculateDaysLeft(goal.deadline);
        if (daysLeft <= 0) return 0;

        const remainingAmount = goal.targetAmount - goal.savedAmount;
        return Math.ceil(remainingAmount / daysLeft);
    }

    getGoalStatus(goal) {
        if (goal.status === 'completed') return 'completed';

        const daysLeft = this.calculateDaysLeft(goal.deadline);
        if (daysLeft < 0) return 'overdue';

        return 'active';
    }

    getStatusText(status) {
        const statusMap = {
            active: 'Aktif',
            completed: 'Tamamlandı',
            overdue: 'Süre Doldu'
        };
        return statusMap[status] || 'Aktif';
    }

    getCategoryName(category) {
        const categories = {
            technology: 'Teknoloji',
            travel: 'Seyahat',
            vehicle: 'Araç',
            home: 'Ev',
            education: 'Eğitim',
            health: 'Sağlık',
            other: 'Diğer'
        };
        return categories[category] || 'Diğer';
    }

    formatDate(date) {
        return new Intl.DateTimeFormat('tr-TR').format(new Date(date));
    }

    updateSummary() {
        const totalGoals = this.goals.length;
        const completedGoals = this.goals.filter(goal => goal.status === 'completed').length;
        const activeGoals = this.goals.filter(goal => goal.status === 'active').length;
        const totalSaved = this.goals.reduce((sum, goal) => sum + goal.savedAmount, 0);

        document.getElementById('totalGoals').textContent = totalGoals;
        document.getElementById('completedGoals').textContent = completedGoals;
        document.getElementById('activeGoals').textContent = activeGoals;
        document.getElementById('totalSaved').textContent = `₺${totalSaved.toLocaleString()}`;
    }

    openGoalModal(goalId = null) {
        const modal = document.getElementById('goalModal');
        const title = document.getElementById('goalModalTitle');
        const form = document.getElementById('goalForm');

        this.editingGoalId = goalId;

        if (goalId) {
            title.textContent = 'Hedefi Düzenle';
            this.fillGoalForm(goalId);
        } else {
            title.textContent = 'Yeni Hedef Ekle';
            form.reset();
        }

        modal.classList.add('active');
    }

    closeGoalModal() {
        document.getElementById('goalModal').classList.remove('active');
        this.editingGoalId = null;
    }

    fillGoalForm(goalId) {
        const goal = this.goals.find(g => g.id === goalId);
        if (!goal) return;

        document.getElementById('goalTitle').value = goal.title;
        document.getElementById('goalAmount').value = goal.targetAmount;
        document.getElementById('goalSaved').value = goal.savedAmount;
        document.getElementById('goalDeadline').value = this.formatDateForInput(goal.deadline);
        document.getElementById('goalCategory').value = goal.category;
        document.getElementById('goalDescription').value = goal.description || '';
    }

    formatDateForInput(date) {
        return new Date(date).toISOString().split('T')[0];
    }

    async saveGoal(form) {
        const formData = new FormData(form);
        const goalData = {
            title: formData.get('title') || document.getElementById('goalTitle').value,
            targetAmount: parseFloat(formData.get('amount') || document.getElementById('goalAmount').value),
            savedAmount: parseFloat(formData.get('saved') || document.getElementById('goalSaved').value),
            deadline: formData.get('deadline') || document.getElementById('goalDeadline').value,
            category: formData.get('category') || document.getElementById('goalCategory').value,
            description: formData.get('description') || document.getElementById('goalDescription').value
        };

        try {
            // GEÇİCİ: LocalStorage'a kaydediyoruz
            console.log('Saving goal:', goalData);

            // Fake delay
            await new Promise(resolve => setTimeout(resolve, 500));

            if (this.editingGoalId) {
                // Update existing goal
                const index = this.goals.findIndex(g => g.id === this.editingGoalId);
                if (index !== -1) {
                    this.goals[index] = {
                        ...this.goals[index],
                        ...goalData,
                        deadline: new Date(goalData.deadline)
                    };
                }
            } else {
                // Add new goal
                const newGoal = {
                    id: Date.now(),
                    ...goalData,
                    deadline: new Date(goalData.deadline),
                    createdAt: new Date(),
                    status: 'active'
                };
                this.goals.push(newGoal);
            }

            this.closeGoalModal();
            this.renderGoals();
            this.updateSummary();

            Utils.showNotification(
                this.editingGoalId ? 'Hedef başarıyla güncellendi!' : 'Hedef başarıyla oluşturuldu!',
                'success'
            );

        } catch (error) {
            console.error('Save goal error:', error);
            Utils.showNotification('Hedef kaydedilemedi: ' + error.message, 'error');
        }
    }

    openGoalDetail(goalId) {
        const goal = this.goals.find(g => g.id === goalId);
        if (!goal) return;

        this.selectedGoalId = goalId;

        const progress = (goal.savedAmount / goal.targetAmount) * 100;
        const daysLeft = this.calculateDaysLeft(goal.deadline);
        const dailySave = this.calculateDailySave(goal);

        document.getElementById('detailGoalTitle').textContent = goal.title;
        document.getElementById('detailProgressPercent').textContent = `${Math.round(progress)}%`;
        document.getElementById('detailTargetAmount').textContent = `₺${goal.targetAmount.toLocaleString()}`;
        document.getElementById('detailSavedAmount').textContent = `₺${goal.savedAmount.toLocaleString()}`;
        document.getElementById('detailRemainingAmount').textContent = `₺${(goal.targetAmount - goal.savedAmount).toLocaleString()}`;
        document.getElementById('detailCategory').textContent = this.getCategoryName(goal.category);
        document.getElementById('detailDeadline').textContent = this.formatDate(goal.deadline);
        document.getElementById('detailDaysLeft').textContent = daysLeft < 0 ? 'Süre doldu' : `${daysLeft} gün`;
        document.getElementById('detailDailySave').textContent = `₺${dailySave.toLocaleString()}`;
        document.getElementById('detailDescription').textContent = goal.description || 'Açıklama bulunmuyor.';

        // Update progress circle
        const progressCircle = document.getElementById('detailProgressCircle');
        if (progressCircle) {
            progressCircle.style.setProperty('--progress', `${progress}%`);
        }

        document.getElementById('goalDetailModal').classList.add('active');
    }

    closeDetailModal() {
        document.getElementById('goalDetailModal').classList.remove('active');
        this.selectedGoalId = null;
    }

    editGoal() {
        if (!this.selectedGoalId) return;

        this.closeDetailModal();
        this.openGoalModal(this.selectedGoalId);
    }

    openSavingsModal() {
        if (!this.selectedGoalId) return;

        document.getElementById('savingsModal').classList.add('active');
    }

    closeSavingsModal() {
        document.getElementById('savingsModal').classList.remove('active');
    }

    async addSavings(form) {
        if (!this.selectedGoalId) return;

        const formData = new FormData(form);
        const savingsData = {
            amount: parseFloat(formData.get('amount') || document.getElementById('savingsAmount').value),
            date: formData.get('date') || document.getElementById('savingsDate').value,
            description: formData.get('description') || document.getElementById('savingsDescription').value
        };

        try {
            // GEÇİCİ: LocalStorage'a kaydediyoruz
            console.log('Adding savings:', savingsData);

            // Fake delay
            await new Promise(resolve => setTimeout(resolve, 500));

            // Update goal saved amount
            const goalIndex = this.goals.findIndex(g => g.id === this.selectedGoalId);
            if (goalIndex !== -1) {
                this.goals[goalIndex].savedAmount += savingsData.amount;

                // Check if goal is completed
                if (this.goals[goalIndex].savedAmount >= this.goals[goalIndex].targetAmount) {
                    this.goals[goalIndex].status = 'completed';
                }
            }

            this.closeSavingsModal();
            this.renderGoals();
            this.updateSummary();

            // Refresh detail modal if open
            if (this.selectedGoalId) {
                this.openGoalDetail(this.selectedGoalId);
            }

            Utils.showNotification('Birikim başarıyla eklendi!', 'success');

        } catch (error) {
            console.error('Add savings error:', error);
            Utils.showNotification('Birikim eklenemedi: ' + error.message, 'error');
        }
    }

    async deleteGoal(goalId = null) {
        const targetGoalId = goalId || this.selectedGoalId;
        if (!targetGoalId) return;

        if (!confirm('Bu hedefi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
            return;
        }

        try {
            // GEÇİCİ: LocalStorage'dan siliyoruz
            console.log('Deleting goal:', targetGoalId);

            // Fake delay
            await new Promise(resolve => setTimeout(resolve, 500));

            this.goals = this.goals.filter(goal => goal.id !== targetGoalId);

            if (this.selectedGoalId === targetGoalId) {
                this.closeDetailModal();
            }

            this.renderGoals();
            this.updateSummary();

            Utils.showNotification('Hedef başarıyla silindi!', 'success');

        } catch (error) {
            console.error('Delete goal error:', error);
            Utils.showNotification('Hedef silinemedi: ' + error.message, 'error');
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

            if (userName) userName.textContent = user.fullName || 'Kullanıcı';
            if (userEmail) userEmail.textContent = user.email;
            if (userAvatar) userAvatar.src = user.avatar || 'assets/icons/user-default.png';
            if (mobileUserName) mobileUserName.textContent = user.fullName || 'Kullanıcı';
            if (mobileUserEmail) mobileUserEmail.textContent = user.email;
        }
    }
}

// Initialize goals when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    if (!SikkeApp.isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }

    window.GoalsManager = new GoalsManager();
});