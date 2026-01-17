// Date Utilities

class DateUtils {
    // Format date as YYYY-MM-DD
    static formatDate(date = new Date()) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // Format date for display (e.g., "Dec 15, 2024")
    static formatDisplayDate(date = new Date()) {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }

    // Get day name (Monday, Tuesday, etc.)
    static getDayName(date = new Date()) {
        return date.toLocaleDateString('en-US', { weekday: 'long' });
    }

    // Get short day name (Mon, Tue, etc.)
    static getShortDayName(date = new Date()) {
        return date.toLocaleDateString('en-US', { weekday: 'short' });
    }

    // Check if two dates are the same day
    static isSameDay(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    }

    // Check if date is today
    static isToday(date) {
        return this.isSameDay(date, new Date());
    }

    // Check if date is yesterday
    static isYesterday(date) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return this.isSameDay(date, yesterday);
    }

    // Get start of week (Monday)
    static getWeekStart(date = new Date()) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday as first day
        d.setDate(diff);
        d.setHours(0, 0, 0, 0);
        return d;
    }

    // Get end of week (Sunday)
    static getWeekEnd(date = new Date()) {
        const start = this.getWeekStart(date);
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        return end;
    }

    // Get array of dates for a week
    static getWeekDates(date = new Date()) {
        const start = this.getWeekStart(date);
        const dates = [];
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(start);
            date.setDate(start.getDate() + i);
            dates.push(date);
        }
        
        return dates;
    }

    // Get start of month
    static getMonthStart(date = new Date()) {
        const d = new Date(date.getFullYear(), date.getMonth(), 1);
        d.setHours(0, 0, 0, 0);
        return d;
    }

    // Get end of month
    static getMonthEnd(date = new Date()) {
        const d = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        d.setHours(23, 59, 59, 999);
        return d;
    }

    // Get number of days in month
    static getDaysInMonth(date = new Date()) {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    }

    // Add days to date
    static addDays(date, days) {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }

    // Subtract days from date
    static subtractDays(date, days) {
        return this.addDays(date, -days);
    }

    // Get days between two dates
    static getDaysBetween(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);
        
        const diffTime = Math.abs(end - start);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    // Format time duration (minutes to hours/minutes)
    static formatDuration(minutes) {
        if (minutes < 60) {
            return `${minutes} min`;
        } else {
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
        }
    }

    // Get time ago string (e.g., "2 hours ago")
    static getTimeAgo(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);
        
        if (diffDays > 0) {
            return diffDays === 1 ? 'yesterday' : `${diffDays} days ago`;
        } else if (diffHours > 0) {
            return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
        } else if (diffMins > 0) {
            return diffMins === 1 ? '1 minute ago' : `${diffMins} minutes ago`;
        } else {
            return 'just now';
        }
    }

    // Check if date is in current week
    static isInCurrentWeek(date) {
        const now = new Date();
        const weekStart = this.getWeekStart(now);
        const weekEnd = this.getWeekEnd(now);
        return date >= weekStart && date <= weekEnd;
    }

    // Check if date is in current month
    static isInCurrentMonth(date) {
        const now = new Date();
        return date.getFullYear() === now.getFullYear() &&
               date.getMonth() === now.getMonth();
    }
}

// Make available globally
window.DateUtils = DateUtils;