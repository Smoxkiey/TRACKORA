// Authentication System

class AuthSystem {
    constructor() {
        this.initForms();
    }

    initForms() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        // Signup form
        const signupForm = document.getElementById('signupForm');
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSignup();
            });
        }
    }

    handleLogin() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const remember = document.getElementById('remember')?.checked;

        // Simple validation
        if (!email || !password) {
            trackoraApp.showNotification('Please fill in all fields', 'error');
            return;
        }

        // For demo purposes - in real app, this would be a server call
        const users = JSON.parse(localStorage.getItem('trackora_users') || '[]');
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            // Don't store password in user session
            const { password, ...userData } = user;
            localStorage.setItem('trackora_user', JSON.stringify(userData));
            
            if (remember) {
                localStorage.setItem('trackora_remember', 'true');
            }
            
            trackoraApp.showNotification('Login successful!', 'success');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } else {
            trackoraApp.showNotification('Invalid email or password', 'error');
        }
    }

    handleSignup() {
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const developerType = document.getElementById('developerType').value;
        const terms = document.getElementById('terms').checked;

        // Validation
        if (!name || !email || !password || !developerType) {
            trackoraApp.showNotification('Please fill in all required fields', 'error');
            return;
        }

        if (!terms) {
            trackoraApp.showNotification('Please accept the terms and conditions', 'error');
            return;
        }

        if (password.length < 6) {
            trackoraApp.showNotification('Password must be at least 6 characters', 'error');
            return;
        }

        // Check if user already exists
        const users = JSON.parse(localStorage.getItem('trackora_users') || '[]');
        if (users.some(u => u.email === email)) {
            trackoraApp.showNotification('Email already registered', 'error');
            return;
        }

        // Create new user with initial data
        const newUser = {
            id: this.generateId(),
            name,
            email,
            password, // In real app, this would be hashed
            developerType,
            createdAt: new Date().toISOString(),
            level: 1,
            xp: 0,
            streak: 0,
            bestStreak: 0,
            totalProtocols: 0,
            totalHours: 0
        };

        // Save user
        users.push(newUser);
        localStorage.setItem('trackora_users', JSON.stringify(users));

        // Set initial protocols for new user
        this.setupNewUserProtocols(newUser.id);

        // Auto login
        const { password: _, ...userData } = newUser;
        localStorage.setItem('trackora_user', JSON.stringify(userData));

        trackoraApp.showNotification('Account created successfully!', 'success');
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
    }

    generateId() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    setupNewUserProtocols(userId) {
        const defaultProtocols = [
            {
                id: 'proto_1',
                userId,
                title: 'Morning Code Review',
                description: 'Review yesterday\'s code and plan today\'s work',
                category: 'review',
                time: 30,
                xp: 15,
                priority: 'high',
                isDefault: true
            },
            {
                id: 'proto_2',
                userId,
                title: 'Focused Coding Session',
                description: '25 minutes of uninterrupted coding',
                category: 'coding',
                time: 25,
                xp: 10,
                priority: 'medium',
                isDefault: true
            },
            {
                id: 'proto_3',
                userId,
                title: 'Learn Something New',
                description: 'Study a new concept or technology',
                category: 'learning',
                time: 45,
                xp: 20,
                priority: 'medium',
                isDefault: true
            },
            {
                id: 'proto_4',
                userId,
                title: 'Evening Reflection',
                description: 'Review what you accomplished and plan for tomorrow',
                category: 'review',
                time: 15,
                xp: 5,
                priority: 'low',
                isDefault: true
            }
        ];

        localStorage.setItem(`trackora_protocols_${userId}`, JSON.stringify(defaultProtocols));
        
        // Initialize empty progress for today
        const today = new Date().toDateString();
        const initialProgress = {
            date: today,
            completed: [],
            totalTime: 0,
            xpEarned: 0
        };
        
        localStorage.setItem(`trackora_progress_${userId}_${today}`, JSON.stringify(initialProgress));
    }
}

// Initialize auth system
document.addEventListener('DOMContentLoaded', () => {
    new AuthSystem();
});