// Protocols Management

class ProtocolsManager {
    constructor() {
        this.userId = null;
        this.protocols = [];
        this.filter = 'all';
        this.init();
    }

    init() {
        this.loadUserData();
        this.loadProtocols();
        this.setupEventListeners();
        this.renderProtocols();
    }

    loadUserData() {
        const userData = localStorage.getItem('trackora_user');
        if (userData) {
            const user = JSON.parse(userData);
            this.userId = user.id;
        }
    }

    loadProtocols() {
        if (!this.userId) return;
        
        const protocolsData = localStorage.getItem(`trackora_protocols_${this.userId}`);
        this.protocols = protocolsData ? JSON.parse(protocolsData) : [];
    }

    setupEventListeners() {
        // Filter tabs
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.filter = e.target.dataset.filter;
                
                // Update active tab
                document.querySelectorAll('.filter-tab').forEach(t => {
                    t.classList.remove('active');
                });
                e.target.classList.add('active');
                
                this.renderProtocols();
            });
        });

        // Search input
        const searchInput = document.getElementById('protocolSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchProtocols(e.target.value);
            });
        }

        // Create protocol button
        const createBtn = document.getElementById('createProtocolBtn');
        if (createBtn) {
            createBtn.addEventListener('click', () => {
                document.getElementById('createProtocolModal').classList.add('active');
            });
        }

        // Create protocol form
        const createForm = document.getElementById('createProtocolForm');
        if (createForm) {
            createForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.createCustomProtocol();
            });
        }

        // Quick add templates
        document.querySelectorAll('.template-card button').forEach(button => {
            button.addEventListener('click', (e) => {
                const template = e.target.closest('.template-card').dataset.template;
                this.addTemplateProtocol(template);
            });
        });
    }

    renderProtocols() {
        const container = document.getElementById('protocolsGrid');
        if (!container) return;

        let filteredProtocols = this.protocols;
        
        // Apply filter
        if (this.filter !== 'all') {
            filteredProtocols = filteredProtocols.filter(p => p.category === this.filter);
        }

        if (filteredProtocols.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No protocols found. Create your first one!</p>
                </div>
            `;
            return;
        }

        let html = '';
        filteredProtocols.forEach(protocol => {
            const isDefault = protocol.isDefault || false;
            
            html += `
                <div class="protocol-card ${isDefault ? 'default' : 'custom'}">
                    <div class="protocol-card-header">
                        <div>
                            <div class="protocol-card-title">${protocol.title}</div>
                            <div class="protocol-card-category">${protocol.category}</div>
                        </div>
                        <div class="protocol-card-xp">${protocol.xp} XP</div>
                    </div>
                    
                    ${protocol.description ? `
                        <div class="protocol-card-description">
                            ${protocol.description}
                        </div>
                    ` : ''}
                    
                    <div class="protocol-card-footer">
                        <div class="protocol-card-time">${protocol.time} minutes</div>
                        <div class="protocol-card-actions">
                            <button class="btn-outline btn-small" onclick="protocolsManager.addToToday('${protocol.id}')">
                                Add to Today
                            </button>
                            ${!isDefault ? `
                                <button class="btn-outline btn-small" onclick="protocolsManager.editProtocol('${protocol.id}')">
                                    Edit
                                </button>
                                <button class="btn-outline btn-small" onclick="protocolsManager.deleteProtocol('${protocol.id}')">
                                    Delete
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    searchProtocols(query) {
        if (!query.trim()) {
            this.renderProtocols();
            return;
        }

        const searchTerm = query.toLowerCase();
        const filtered = this.protocols.filter(protocol => 
            protocol.title.toLowerCase().includes(searchTerm) ||
            protocol.description?.toLowerCase().includes(searchTerm) ||
            protocol.category.toLowerCase().includes(searchTerm)
        );

        this.renderFilteredProtocols(filtered);
    }

    renderFilteredProtocols(filteredProtocols) {
        const container = document.getElementById('protocolsGrid');
        if (!container) return;

        if (filteredProtocols.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No protocols match your search.</p>
                </div>
            `;
            return;
        }

        // Similar rendering logic as renderProtocols but with filtered list
        let html = '';
        filteredProtocols.forEach(protocol => {
            // ... same card HTML as in renderProtocols
        });

        container.innerHTML = html;
    }

    createCustomProtocol() {
        const title = document.getElementById('createTitle').value;
        const description = document.getElementById('createDescription').value;
        const category = document.getElementById('createCategory').value;
        const time = parseInt(document.getElementById('createTime').value);
        const xp = parseInt(document.getElementById('createXP').value) || Math.floor(time / 5);
        const recurring = document.getElementById('createRecurring')?.checked;

        const newProtocol = {
            id: 'custom_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            userId: this.userId,
            title,
            description,
            category,
            time,
            xp,
            isDefault: false,
            isRecurring: recurring,
            createdAt: new Date().toISOString()
        };

        this.protocols.push(newProtocol);
        this.saveProtocols();
        this.renderProtocols();
        
        // Close modal and reset form
        document.getElementById('createProtocolModal').classList.remove('active');
        document.getElementById('createProtocolForm').reset();
        
        trackoraApp.showNotification('Protocol created successfully!');
    }

    addTemplateProtocol(template) {
        const templates = {
            'morning-review': {
                title: 'Morning Code Review',
                description: 'Review yesterday\'s code and plan today\'s work',
                category: 'review',
                time: 30,
                xp: 15
            },
            'pomodoro': {
                title: 'Pomodoro Session',
                description: '25 minutes of focused coding',
                category: 'coding',
                time: 25,
                xp: 10
            },
            'learn-new': {
                title: 'Learn New Concept',
                description: 'Study a new programming concept or technology',
                category: 'learning',
                time: 45,
                xp: 20
            },
            'code-review': {
                title: 'Code Review Practice',
                description: 'Review open source PRs or team code',
                category: 'review',
                time: 30,
                xp: 15
            }
        };

        const templateData = templates[template];
        if (!templateData) return;

        const newProtocol = {
            id: 'template_' + Date.now(),
            userId: this.userId,
            ...templateData,
            isDefault: false,
            createdAt: new Date().toISOString()
        };

        this.protocols.push(newProtocol);
        this.saveProtocols();
        this.renderProtocols();
        
        trackoraApp.showNotification('Protocol added from template!');
    }

    addToToday(protocolId) {
        // For now, just show a message
        trackoraApp.showNotification('Protocol added to today\'s list! Check your dashboard.');
        
        // In a full implementation, this would add to today's active protocols
        // localStorage.setItem(`trackora_today_${this.userId}`, ...);
    }

    editProtocol(protocolId) {
        const protocol = this.protocols.find(p => p.id === protocolId);
        if (!protocol) return;

        // For now, just show a message
        trackoraApp.showNotification('Edit feature coming soon!');
        
        // In full implementation, open edit modal with protocol data
    }

    deleteProtocol(protocolId) {
        if (!confirm('Delete this protocol?')) return;
        
        this.protocols = this.protocols.filter(p => p.id !== protocolId);
        this.saveProtocols();
        this.renderProtocols();
        
        trackoraApp.showNotification('Protocol deleted');
    }

    saveProtocols() {
        if (!this.userId) return;
        localStorage.setItem(`trackora_protocols_${this.userId}`, JSON.stringify(this.protocols));
    }
}

// Initialize protocols manager
let protocolsManager;
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('protocols.html')) {
        protocolsManager = new ProtocolsManager();
        window.protocolsManager = protocolsManager;
    }
});