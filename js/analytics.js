// Analytics Dashboard

class AnalyticsDashboard {
    constructor() {
        this.userId = null;
        this.timeRange = 'week';
        this.chart = null;
        this.init();
    }

    init() {
        this.loadUserData();
        this.setupEventListeners();
        this.loadAnalyticsData();
        this.updateUI();
        this.initChart();
    }

    loadUserData() {
        const userData = localStorage.getItem('trackora_user');
        if (userData) {
            const user = JSON.parse(userData);
            this.userId = user.id;
            this.user = user;
        }
    }

    setupEventListeners() {
        // Time range selector
        const timeRangeSelect = document.getElementById('timeRange');
        if (timeRangeSelect) {
            timeRangeSelect.addEventListener('change', (e) => {
                this.timeRange = e.target.value;
                this.updateAnalytics();
            });
        }
    }

    loadAnalyticsData() {
        if (!this.userId) return;
        
        // Load all progress data for the user
        this.progressData = this.getUserProgressData();
        this.calculateStats();
    }

    getUserProgressData() {
        if (!this.userId) return [];
        
        const progressData = [];
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        
        // Loop through last year of data (simplified - in real app would have better storage)
        for (let i = 0; i < 365; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toDateString();
            
            const data = localStorage.getItem(`trackora_progress_${this.userId}_${dateStr}`);
            if (data) {
                progressData.push({
                    date: dateStr,
                    data: JSON.parse(data)
                });
            }
        }
        
        return progressData;
    }

    calculateStats() {
        if (!this.progressData) return;
        
        this.stats = {
            totalProtocols: this.user?.totalProtocols || 0,
            totalHours: this.user?.totalHours || 0,
            avgCompletion: 0,
            bestStreak: this.user?.bestStreak || 0,
            currentStreak: this.user?.streak || 0
        };
        
        // Calculate average completion rate
        if (this.progressData.length > 0) {
            const totalDays = this.progressData.length;
            const completedDays = this.progressData.filter(d => d.data.completed.length > 0).length;
            this.stats.avgCompletion = Math.round((completedDays / totalDays) * 100);
        }
    }

    updateUI() {
        // Update overview cards
        document.getElementById('totalProtocols')?.textContent = this.stats?.totalProtocols || 0;
        document.getElementById('totalHours')?.textContent = Math.round(this.stats?.totalHours || 0);
        document.getElementById('avgCompletion')?.textContent = (this.stats?.avgCompletion || 0) + '%';
        document.getElementById('streakRecord')?.textContent = this.stats?.bestStreak || 0;
        document.getElementById('currentStreak')?.textContent = this.stats?.currentStreak || 0;
        
        // Update changes (simplified - would calculate real changes in production)
        document.getElementById('protocolChange')?.textContent = '+0% from last week';
        document.getElementById('hoursChange')?.textContent = '+0h from last week';
        document.getElementById('completionChange')?.textContent = '+0% from last week';
        
        // Update category breakdown
        this.updateCategoryBreakdown();
        
        // Update insights
        this.updateInsights();
        
        // Update monthly summary
        this.updateMonthlySummary();
    }

    updateCategoryBreakdown() {
        const container = document.getElementById('categoryGrid');
        if (!container) return;
        
        const categories = {
            coding: { count: 0, time: 0, color: '#4CAF50' },
            learning: { count: 0, time: 0, color: '#2196F3' },
            review: { count: 0, time: 0, color: '#FF9800' },
            planning: { count: 0, time: 0, color: '#9C27B0' },
            other: { count: 0, time: 0, color: '#795548' }
        };
        
        // Count protocols by category (simplified)
        if (this.userId) {
            const protocolsData = localStorage.getItem(`trackora_protocols_${this.userId}`);
            const protocols = protocolsData ? JSON.parse(protocolsData) : [];
            
            protocols.forEach(protocol => {
                const cat = protocol.category || 'other';
                if (categories[cat]) {
                    categories[cat].count++;
                    categories[cat].time += protocol.time || 0;
                }
            });
        }
        
        let html = '';
        Object.entries(categories).forEach(([name, data]) => {
            if (data.count > 0) {
                html += `
                    <div class="category-item">
                        <div class="category-header">
                            <div class="category-color" style="background-color: ${data.color}"></div>
                            <div class="category-name">${name.charAt(0).toUpperCase() + name.slice(1)}</div>
                        </div>
                        <div class="category-stats">
                            <div class="category-stat">
                                <div class="stat-value">${data.count}</div>
                                <div class="stat-label">Protocols</div>
                            </div>
                            <div class="category-stat">
                                <div class="stat-value">${Math.round(data.time / 60)}h</div>
                                <div class="stat-label">Total Time</div>
                            </div>
                        </div>
                    </div>
                `;
            }
        });
        
        container.innerHTML = html || '<p>No category data yet.</p>';
    }

    updateInsights() {
        // Most productive time (simplified)
        document.getElementById('productiveTime')?.textContent = 'Morning (9 AM - 12 PM)';
        
        // Best completion rate category
        document.getElementById('bestCategory')?.textContent = 'Coding protocols';
        
        // Weekly trend
        const trend = this.calculateWeeklyTrend();
        document.getElementById('weeklyTrend')?.textContent = trend;
        
        // Recommendation
        const recommendation = this.generateRecommendation();
        document.getElementById('recommendation')?.textContent = recommendation;
    }

    calculateWeeklyTrend() {
        if (!this.progressData || this.progressData.length < 7) {
            return 'Not enough data yet';
        }
        
        const lastWeek = this.progressData.slice(0, 7);
        const completedLastWeek = lastWeek.reduce((sum, day) => sum + day.data.completed.length, 0);
        
        if (this.progressData.length < 14) {
            return `${completedLastWeek} protocols completed last week`;
        }
        
        const previousWeek = this.progressData.slice(7, 14);
        const completedPreviousWeek = previousWeek.reduce((sum, day) => sum + day.data.completed.length, 0);
        
        const change = completedLastWeek - completedPreviousWeek;
        
        if (change > 0) {
            return `Up ${change} protocols from previous week`;
        } else if (change < 0) {
            return `Down ${Math.abs(change)} protocols from previous week`;
        } else {
            return 'Same as previous week';
        }
    }

    generateRecommendation() {
        if (!this.userId) return 'Complete more protocols to get personalized recommendations';
        
        const today = new Date().toDateString();
        const todayData = localStorage.getItem(`trackora_progress_${this.userId}_${today}`);
        
        if (!todayData) {
            return 'Start your day with a morning code review protocol!';
        }
        
        const todayProgress = JSON.parse(todayData);
        
        if (todayProgress.completed.length === 0) {
            return 'Try completing at least one protocol today to build momentum!';
        } else if (todayProgress.completed.length < 3) {
            return 'Great start! Try to complete 3 protocols daily for best results.';
        } else {
            return 'Excellent! Consider adding a learning protocol to expand your skills.';
        }
    }

    updateMonthlySummary() {
        const now = new Date();
        const monthName = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        document.getElementById('currentMonth')?.textContent = monthName;
        
        // Calculate monthly stats (simplified)
        const thisMonth = now.getMonth();
        const monthData = this.progressData?.filter(d => {
            const date = new Date(d.date);
            return date.getMonth() === thisMonth;
        }) || [];
        
        const monthProtocols = monthData.reduce((sum, day) => sum + day.data.completed.length, 0);
        const monthHours = monthData.reduce((sum, day) => sum + (day.data.totalTime / 60), 0);
        const monthCompletion = monthData.length > 0 ? 
            Math.round((monthData.filter(d => d.data.completed.length > 0).length / monthData.length) * 100) : 0;
        
        document.getElementById('monthProtocols')?.textContent = monthProtocols;
        document.getElementById('monthHours')?.textContent = Math.round(monthHours);
        document.getElementById('monthCompletion')?.textContent = monthCompletion + '%';
        
        // Update calendar
        this.updateMonthlyCalendar();
    }

    updateMonthlyCalendar() {
        const container = document.getElementById('monthlyCalendar');
        if (!container) return;
        
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        
        // Get day of week for first day (0 = Sunday, 1 = Monday, etc.)
        let firstDayOfWeek = firstDay.getDay();
        if (firstDayOfWeek === 0) firstDayOfWeek = 7; // Make Monday = 1
        
        let html = '<div class="calendar-grid">';
        
        // Day headers
        const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        dayNames.forEach(day => {
            html += `<div class="calendar-day">${day}</div>`;
        });
        
        // Empty cells for days before the first day of month
        for (let i = 1; i < firstDayOfWeek; i++) {
            html += '<div class="calendar-date empty"></div>';
        }
        
        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateStr = date.toDateString();
            const isToday = dateStr === new Date().toDateString();
            
            // Check if there's data for this day
            let hasData = false;
            let completedCount = 0;
            
            if (this.progressData) {
                const dayData = this.progressData.find(d => d.date === dateStr);
                if (dayData) {
                    hasData = true;
                    completedCount = dayData.data.completed.length;
                }
            }
            
            let className = 'calendar-date';
            if (isToday) className += ' today';
            if (hasData) {
                if (completedCount > 0) className += ' completed';
                else className += ' partial';
            }
            
            html += `
                <div class="${className}" title="${dateStr}: ${completedCount} protocols">
                    ${day}
                    ${completedCount > 0 ? `<div class="day-dot"></div>` : ''}
                </div>
            `;
        }
        
        html += '</div>';
        container.innerHTML = html;
    }

    initChart() {
        const ctx = document.getElementById('weeklyChart');
        if (!ctx) return;
        
        // Destroy existing chart
        if (this.chart) {
            this.chart.destroy();
        }
        
        // Sample data - in real app would use actual progress data
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const data = days.map(() => Math.floor(Math.random() * 5)); // Random 0-4 protocols
        
        this.chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: days,
                datasets: [{
                    label: 'Protocols Completed',
                    data: data,
                    backgroundColor: '#4CAF50',
                    borderColor: '#388E3C',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 5,
                        ticks: {
                            stepSize: 1
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    updateAnalytics() {
        this.loadAnalyticsData();
        this.updateUI();
        
        if (this.chart) {
            this.initChart(); // Re-initialize chart with new time range
        }
    }
}

// Initialize analytics dashboard
let analyticsDashboard;
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('analytics.html')) {
        analyticsDashboard = new AnalyticsDashboard();
        window.analyticsDashboard = analyticsDashboard;
    }
});