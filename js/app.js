// Trackora - Main Application

class TrackoraApp {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.init();
    }

    init() {
        this.checkAuth();
        this.setupEventListeners();
        this.updateDateDisplay();
        this.loadUserData();
    }

    checkAuth() {
        const userData = localStorage.getItem('trackora_user');
        const authPages = ['login.html', 'signup.html', 'index.html'];
        const currentPage = window.location.pathname.split('/').pop();
        
        if (userData) {
            this.currentUser = JSON.parse(userData);
            this.isAuthenticated = true;
            
            // Redirect to dashboard if on auth pages
            if (authPages.includes(currentPage) && currentPage !== 'index.html') {
                window.location.href = 'dashboard.html';
            }
        } else {
            this.isAuthenticated = false;
            
            // Redirect to login if on protected pages
            const protectedPages = ['dashboard.html', 'protocols.html', 'analytics.html'];
            if (protectedPages.includes(currentPage)) {
                window.location.href = 'login.html';
            }
        }
    }

    setupEventListeners() {
        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }

        // Modal close buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-close') || 
                e.target.classList.contains('modal')) {
                this.closeAllModals();
            }
        });

        // Escape key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }

    logout() {
        localStorage.removeItem('trackora_user');
        window.location.href = 'login.html';
    }

    updateDateDisplay() {
        const dateElements = document.querySelectorAll('#currentDate, .date-display');
        if (dateElements.length > 0) {
            const now = new Date();
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            const formattedDate = now.toLocaleDateString('en-US', options);
            
            dateElements.forEach(el => {
                el.textContent = formattedDate;
            });
        }
    }

    loadUserData() {
        if (this.isAuthenticated && this.currentUser) {
            // Update user name display
            const userNameElements = document.querySelectorAll('#userName');
            userNameElements.forEach(el => {
                el.textContent = this.currentUser.name || 'User';
            });
        }
    }

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#F44336' : '#2196F3'};
            color: white;
            padding: 15px 20px;
            border-radius: 4px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        // Add close button event
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    // Zero-based progression utilities
    isNewDay() {
        const lastAccess = localStorage.getItem('trackora_last_access');
        const today = new Date().toDateString();
        
        if (lastAccess !== today) {
            localStorage.setItem('trackora_last_access', today);
            return true;
        }
        return false;
    }

    getWeekStartDate(date = new Date()) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday as first day
        return new Date(d.setDate(diff));
    }

    getWeekNumber(date = new Date()) {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() + 4 - (d.getDay() || 7));
        const yearStart = new Date(d.getFullYear(), 0, 1);
        const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
        return weekNo;
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.trackoraApp = new TrackoraApp();
});