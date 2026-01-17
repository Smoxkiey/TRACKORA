// Storage Utilities

class StorageManager {
    constructor() {
        this.userId = null;
    }

    setUser(user) {
        this.userId = user?.id;
    }

    // Protocol Management
    saveProtocols(protocols) {
        if (!this.userId) return false;
        try {
            localStorage.setItem(`trackora_protocols_${this.userId}`, JSON.stringify(protocols));
            return true;
        } catch (e) {
            console.error('Failed to save protocols:', e);
            return false;
        }
    }

    getProtocols() {
        if (!this.userId) return [];
        try {
            const data = localStorage.getItem(`trackora_protocols_${this.userId}`);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('Failed to load protocols:', e);
            return [];
        }
    }

    // Daily Progress
    saveDailyProgress(date, progress) {
        if (!this.userId) return false;
        try {
            localStorage.setItem(`trackora_progress_${this.userId}_${date}`, JSON.stringify(progress));
            return true;
        } catch (e) {
            console.error('Failed to save progress:', e);
            return false;
        }
    }

    getDailyProgress(date) {
        if (!this.userId) return null;
        try {
            const data = localStorage.getItem(`trackora_progress_${this.userId}_${date}`);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Failed to load progress:', e);
            return null;
        }
    }

    // User Stats
    saveUserStats(stats) {
        if (!this.userId) return false;
        try {
            localStorage.setItem(`trackora_stats_${this.userId}`, JSON.stringify(stats));
            return true;
        } catch (e) {
            console.error('Failed to save stats:', e);
            return false;
        }
    }

    getUserStats() {
        if (!this.userId) return null;
        try {
            const data = localStorage.getItem(`trackora_stats_${this.userId}`);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Failed to load stats:', e);
            return null;
        }
    }

    // Analytics Data
    saveAnalyticsData(data) {
        if (!this.userId) return false;
        try {
            localStorage.setItem(`trackora_analytics_${this.userId}`, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('Failed to save analytics:', e);
            return false;
        }
    }

    getAnalyticsData() {
        if (!this.userId) return null;
        try {
            const data = localStorage.getItem(`trackora_analytics_${this.userId}`);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Failed to load analytics:', e);
            return null;
        }
    }

    // Clean up old data (older than 30 days)
    cleanupOldData() {
        if (!this.userId) return;
        
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        // Get all progress keys for this user
        const keys = Object.keys(localStorage).filter(key => 
            key.startsWith(`trackora_progress_${this.userId}_`)
        );
        
        keys.forEach(key => {
            const dateStr = key.split('_').pop();
            const date = new Date(dateStr);
            
            if (date < thirtyDaysAgo) {
                localStorage.removeItem(key);
            }
        });
    }

    // Export all user data
    exportUserData() {
        if (!this.userId) return null;
        
        const data = {
            protocols: this.getProtocols(),
            stats: this.getUserStats(),
            analytics: this.getAnalyticsData(),
            exportDate: new Date().toISOString()
        };
        
        return JSON.stringify(data, null, 2);
    }

    // Import user data
    importUserData(jsonData) {
        if (!this.userId) return false;
        
        try {
            const data = JSON.parse(jsonData);
            
            if (data.protocols) {
                this.saveProtocols(data.protocols);
            }
            
            if (data.stats) {
                this.saveUserStats(data.stats);
            }
            
            if (data.analytics) {
                this.saveAnalyticsData(data.analytics);
            }
            
            return true;
        } catch (e) {
            console.error('Failed to import data:', e);
            return false;
        }
    }
}

// Create global instance
const storageManager = new StorageManager();