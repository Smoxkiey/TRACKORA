// Dashboard - Main functionality

class Dashboard {
    constructor() {
        this.userId = null;
        this.today = new Date().toDateString();
        this.protocols = [];
        this.todayProgress = null;
        this.init();
    }

    init() {
        this.loadUserData();
        this.loadProtocols();
        this.loadTodayProgress();
        this.setupEventListeners();
        this.updateUI();
        this.checkNewDayReset();
    }

    loadUserData() {
        const userData = localStorage.getItem('trackora_user');
        if (userData) {
            const user = JSON.parse(userData);
            this.userId = user.id;
            this.user = user;
        }
    }

    loadProtocols() {
        if (!this.userId) return;
        
        const protocolsData = localStorage.getItem(`trackora_protocols_${this.userId}`);
        this.protocols = protocolsData ? JSON.parse(protocolsData) : [];
    }

    loadTodayProgress() {
        if (!this.userId) return;
        
        const progressData = localStorage.getItem(`trackora_progress_${this.userId}_${this.today}`);
        this.todayProgress = progressData ? JSON.parse(progressData) : {
            date: this.today,
            completed: [],
            totalTime: 0,
            xpEarned: 0
        };
    }

    setupEventListeners() {
        // Add Protocol Button
        const addBtn = document.getElementById('addProtocolBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                document.getElementById('addProtocolModal').classList.add('active');
            });
        }

        // Add First Protocol Button
        const addFirstBtn = document.getElementById('addFirstProtocol');
        if (addFirstBtn) {
            addFirstBtn.addEventListener('click', () => {
                document.getElementById('addProtocolModal').classList.add('active');
            });
        }

        // Protocol Form Submission
        const protocolForm = document.getElementById('protocolForm');
        if (protocolForm) {
            protocolForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addNewProtocol();
            });
        }

        // Reset Daily Button
        const resetBtn = document.getElementById('resetDailyBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                if (confirm('Reset all progress for today? This cannot be undone.')) {
                    this.resetDailyProgress();
                }
            });
        }

        // Load protocols list
        this.renderProtocolsList();
    }

    addNewProtocol() {
        const title = document.getElementById('protocolTitle').value;
        const type = document.getElementById('protocolType').value;
        const time = parseInt(document.getElementById('protocolTime').value);
        const priority = document.getElementById('protocolPriority').value;

        const newProtocol = {
            id: 'proto_' + Date.now(),
            userId: this.userId,
            title,
            description: '',
            category: type,
            time,
            xp: Math.floor(time / 5), // 1 XP per 5 minutes
            priority,
            createdAt: new Date().toISOString(),
            isDefault: false
        };

        this.protocols.push(newProtocol);
        this.saveProtocols();
        this.renderProtocolsList();
        
        // Close modal and reset form
        document.getElementById('addProtocolModal').classList.remove('active');
        document.getElementById('protocolForm').reset();
        
        trackoraApp.showNotification('Protocol added successfully!');
    }

    toggleProtocolCompletion(protocolId) {
        const protocol = this.protocols.find(p => p.id === protocolId);
        if (!protocol) return;

        const index = this.todayProgress.completed.indexOf(protocolId);
        
        if (index === -1) {
            // Mark as completed
            this.todayProgress.completed.push(protocolId);
            this.todayProgress.totalTime += protocol.time;
            this.todayProgress.xpEarned += protocol.xp;
            
            // Update user XP and streak
            this.updateUserStats(protocol.xp);
            
            // Generate analysis
            this.generateAnalysis();
        } else {
            // Mark as incomplete
            this.todayProgress.completed.splice(index, 1);
            this.todayProgress.totalTime -= protocol.time;
            this.todayProgress.xpEarned -= protocol.xp;
        }

        this.saveTodayProgress();
        this.updateUI();
        this.updateProtocolCompletion(protocolId, index === -1);
    }

    updateUserStats(xpEarned) {
        if (!this.user) return;
        
        // Update XP
        this.user.xp = (this.user.xp || 0) + xpEarned;
        
        // Update streak
        const lastAccess = localStorage.getItem(`trackora_last_completion_${this.userId}`);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastAccess === yesterday.toDateString()) {
            this.user.streak = (this.user.streak || 0) + 1;
            if (this.user.streak > (this.user.bestStreak || 0)) {
                this.user.bestStreak = this.user.streak;
            }
        } else if (!lastAccess || lastAccess !== this.today) {
            this.user.streak = 1;
        }
        
        // Update totals
        this.user.totalProtocols = (this.user.totalProtocols || 0) + 1;
        this.user.totalHours = (this.user.totalHours || 0) + (xpEarned / 12); // Approximate hours
        
        // Save user data
        localStorage.setItem('trackora_user', JSON.stringify(this.user));
        localStorage.setItem(`trackora_last_completion_${this.userId}`, this.today);
    }

    updateProtocolCompletion(protocolId, completed) {
        const protocolItem = document.querySelector(`[data-protocol-id="${protocolId}"]`);
        if (protocolItem) {
            const checkbox = protocolItem.querySelector('.protocol-checkbox');
            if (completed) {
                checkbox.classList.add('checked');
                checkbox.innerHTML = '✓';
                protocolItem.classList.add('completed');
            } else {
                checkbox.classList.remove('checked');
                checkbox.innerHTML = '';
                protocolItem.classList.remove('completed');
            }
        }
    }

    resetDailyProgress() {
        this.todayProgress = {
            date: this.today,
            completed: [],
            totalTime: 0,
            xpEarned: 0
        };
        
        this.saveTodayProgress();
        this.updateUI();
        this.renderProtocolsList();
        
        trackoraApp.showNotification('Daily progress reset successfully!');
    }

    saveProtocols() {
        if (!this.userId) return;
        localStorage.setItem(`trackora_protocols_${this.userId}`, JSON.stringify(this.protocols));
    }

    saveTodayProgress() {
        if (!this.userId) return;
        localStorage.setItem(`trackora_progress_${this.userId}_${this.today}`, JSON.stringify(this.todayProgress));
    }

    renderProtocolsList() {
        const container = document.getElementById('protocolsList');
        if (!container) return;

        if (this.protocols.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No protocols for today. Add some to get started!</p>
                    <button class="btn-primary" id="addFirstProtocol">Add First Protocol</button>
                </div>
            `;
            
            // Re-add event listener
            document.getElementById('addFirstProtocol')?.addEventListener('click', () => {
                document.getElementById('addProtocolModal').classList.add('active');
            });
            return;
        }

        const completedCount = this.todayProgress.completed.length;
        
        let html = '';
        this.protocols.forEach(protocol => {
            const isCompleted = this.todayProgress.completed.includes(protocol.id);
            
            html += `
                <div class="protocol-item ${isCompleted ? 'completed' : ''}" data-protocol-id="${protocol.id}">
                    <div class="protocol-info">
                        <div class="protocol-checkbox ${isCompleted ? 'checked' : ''}" 
                             onclick="dashboard.toggleProtocolCompletion('${protocol.id}')">
                            ${isCompleted ? '✓' : ''}
                        </div>
                        <div>
                            <div class="protocol-title">${protocol.title}</div>
                            <div class="protocol-meta">
                                <span class="protocol-category">${protocol.category}</span>
                                <span class="protocol-time">${protocol.time} min</span>
                                <span class="protocol-xp">${protocol.xp} XP</span>
                            </div>
                        </div>
                    </div>
                    <div class="protocol-actions">
                        <button onclick="dashboard.deleteProtocol('${protocol.id}')" title="Delete">🗑️</button>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    deleteProtocol(protocolId) {
        if (!confirm('Delete this protocol?')) return;
        
        this.protocols = this.protocols.filter(p => p.id !== protocolId);
        this.saveProtocols();
        this.renderProtocolsList();
        
        trackoraApp.showNotification('Protocol deleted');
    }

    updateUI() {
        // Update daily stats
        const completedCount = this.todayProgress.completed.length;
        document.getElementById('dailyCompleted')?.textContent = completedCount;
        
        // Update streak
        document.getElementById('streakDays')?.textContent = this.user?.streak || 0;
        
        // Update weekly progress
        const weeklyProgress = this.calculateWeeklyProgress();
        document.getElementById('weeklyProgress')?.textContent = weeklyProgress + '%';
        
        // Update XP
        document.getElementById('totalXP')?.textContent = this.user?.xp || 0;
        
        // Update week range
        const weekStart = trackoraApp.getWeekStartDate();
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        
        const weekRangeElement = document.getElementById('weekRange');
        if (weekRangeElement) {
            weekRangeElement.textContent = 
                `${weekStart.getDate()}/${weekStart.getMonth()+1} - ${weekEnd.getDate()}/${weekEnd.getMonth()+1}`;
        }
        
        // Update weekly grid
        this.updateWeeklyGrid();
    }

    calculateWeeklyProgress() {
        if (!this.userId) return 0;
        
        const weekStart = trackoraApp.getWeekStartDate();
        let totalCompleted = 0;
        let totalPossible = this.protocols.length * 7; // Rough estimate
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(weekStart);
            date.setDate(date.getDate() + i);
            const dateStr = date.toDateString();
            
            const progressData = localStorage.getItem(`trackora_progress_${this.userId}_${dateStr}`);
            if (progressData) {
                const progress = JSON.parse(progressData);
                totalCompleted += progress.completed.length;
            }
        }
        
        return totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;
    }

    updateWeeklyGrid() {
        const container = document.getElementById('weekGrid');
        if (!container) return;
        
        const weekStart = trackoraApp.getWeekStartDate();
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        
        let html = '';
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(weekStart);
            date.setDate(date.getDate() + i);
            const dateStr = date.toDateString();
            
            let completedCount = 0;
            if (this.userId) {
                const progressData = localStorage.getItem(`trackora_progress_${this.userId}_${dateStr}`);
                if (progressData) {
                    const progress = JSON.parse(progressData);
                    completedCount = progress.completed.length;
                }
            }
            
            const isToday = dateStr === this.today;
            const progressPercent = Math.min(completedCount * 20, 100); // 20% per protocol
            
            html += `
                <div class="day-card ${isToday ? 'today' : ''}">
                    <div class="day-name">${days[i]}</div>
                    <div class="day-date">${date.getDate()}</div>
                    <div class="day-progress">
                        <div class="day-progress-fill" style="width: ${progressPercent}%"></div>
                    </div>
                    <div class="day-count">${completedCount} done</div>
                </div>
            `;
        }
        
        container.innerHTML = html;
    }

    generateAnalysis() {
        const container = document.getElementById('dailyAnalysis');
        if (!container) return;
        
        const completedCount = this.todayProgress.completed.length;
        const totalTime = this.todayProgress.totalTime;
        const xpEarned = this.todayProgress.xpEarned;
        
        let analysis = '';
        
        if (completedCount === 0) {
            analysis = '<p>Complete your first protocol to see analysis...</p>';
        } else if (completedCount === 1) {
            analysis = `
                <p><strong>Good start!</strong> You've completed 1 protocol.</p>
                <p>Focus on consistency - try to complete at least 3 protocols daily.</p>
            `;
        } else if (completedCount < 3) {
            analysis = `
                <p><strong>Making progress!</strong> ${completedCount} protocols completed.</p>
                <p>You've spent ${totalTime} minutes on focused work today.</p>
                <p>Keep going - you're ${3 - completedCount} away from your daily goal!</p>
            `;
        } else {
            analysis = `
                <p><strong>Excellent work!</strong> ${completedCount} protocols completed (${totalTime} minutes).</p>
                <p>You earned ${xpEarned} XP today. Your current streak: ${this.user?.streak || 0} days.</p>
                <p>At this rate, you'll level up in ${Math.max(1, Math.ceil((100 - (this.user?.xp || 0)) / xpEarned))} days!</p>
            `;
        }
        
        container.innerHTML = analysis;
    }

    checkNewDayReset() {
        const lastAccess = localStorage.getItem('trackora_last_access_date');
        const today = new Date().toDateString();
        
        if (lastAccess !== today) {
            localStorage.setItem('trackora_last_access_date', today);
            // Could add auto-reset logic here if needed
        }
    }
}

// Initialize dashboard
let dashboard;
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('dashboard.html')) {
        dashboard = new Dashboard();
        window.dashboard = dashboard; // Make available globally
    }
});