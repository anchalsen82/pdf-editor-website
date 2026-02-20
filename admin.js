// Admin Panel JavaScript

// Initialize admin system
let currentUser = null;
let users = [];
let stats = {
    totalUsers: 0,
    enhancements: 0,
    compressions: 0,
    links: 0,
    pdfs: 0,
    storage: 0
};
let features = {
    enhance: true,
    compress: true,
    share: true,
    pdf: true
};
let settings = {
    maxFileSize: 50,
    maxEnhancements: 100,
    linkExpiry: 7
};

// Load data from localStorage
function loadData() {
    const savedUsers = localStorage.getItem('mediapro_users');
    const savedStats = localStorage.getItem('mediapro_stats');
    const savedFeatures = localStorage.getItem('mediapro_features');
    const savedSettings = localStorage.getItem('mediapro_settings');
    const savedUser = localStorage.getItem('mediapro_current_user');

    if (savedUsers) {
        users = JSON.parse(savedUsers);
        // Update default admin if exists
        const adminUser = users.find(u => u.email === 'admin@mediapro.studio');
        if (adminUser) {
            adminUser.email = 'anchalsen82@gmail.com';
            adminUser.password = 'Anchal@123';
            adminUser.name = 'Anchal Sen';
            saveUsers();
        }
        // Check if new admin user exists, if not add it
        const newAdmin = users.find(u => u.email === 'anchalsen82@gmail.com');
        if (!newAdmin) {
            users.push({
                id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
                name: 'Anchal Sen',
                email: 'anchalsen82@gmail.com',
                password: 'Anchal@123',
                role: 'admin',
                status: 'active',
                joined: new Date().toISOString()
            });
            saveUsers();
        }
    } else {
        // Initialize with default admin user
        users = [{
            id: 1,
            name: 'Anchal Sen',
            email: 'anchalsen82@gmail.com',
            password: 'Anchal@123',
            role: 'admin',
            status: 'active',
            joined: new Date().toISOString()
        }];
        saveUsers();
    }

    if (savedStats) {
        stats = JSON.parse(savedStats);
    }

    if (savedFeatures) {
        features = JSON.parse(savedFeatures);
    }

    if (savedSettings) {
        settings = JSON.parse(savedSettings);
    }

    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateUIForLoggedInUser();
    }
}

function saveUsers() {
    localStorage.setItem('mediapro_users', JSON.stringify(users));
}

function saveStats() {
    localStorage.setItem('mediapro_stats', JSON.stringify(stats));
}

function saveFeatures() {
    localStorage.setItem('mediapro_features', JSON.stringify(features));
    applyFeatureToggles();
}

function saveSettings() {
    localStorage.setItem('mediapro_settings', JSON.stringify(settings));
}

// Authentication
function login(email, password) {
    const user = users.find(u => u.email === email && u.password === password);
    if (user && user.status === 'active') {
        currentUser = user;
        localStorage.setItem('mediapro_current_user', JSON.stringify(user));
        updateUIForLoggedInUser();
        closeLoginModal();
        if (user.role === 'admin') {
            showAdminPanel();
        }
        showToast('Login successful!');
        return true;
    }
    showToast('Invalid credentials or account inactive');
    return false;
}

function logout() {
    currentUser = null;
    localStorage.removeItem('mediapro_current_user');
    updateUIForLoggedInUser();
    hideAdminPanel();
    showToast('Logged out successfully');
}

function updateUIForLoggedInUser() {
    const loginLink = document.getElementById('login-link');
    const logoutLink = document.getElementById('logout-link');
    const adminLink = document.getElementById('admin-link');

    if (currentUser) {
        loginLink.style.display = 'none';
        logoutLink.style.display = 'block';
        if (currentUser.role === 'admin') {
            adminLink.style.display = 'block';
        } else {
            adminLink.style.display = 'none';
        }
    } else {
        loginLink.style.display = 'block';
        logoutLink.style.display = 'none';
        adminLink.style.display = 'none';
    }
}

// Password Reset Tokens Storage
let resetTokens = {};

function loadResetTokens() {
    const saved = localStorage.getItem('mediapro_reset_tokens');
    if (saved) {
        resetTokens = JSON.parse(saved);
    }
}

function saveResetTokens() {
    localStorage.setItem('mediapro_reset_tokens', JSON.stringify(resetTokens));
}

// Generate reset token
function generateResetToken(email) {
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    const expiry = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
    resetTokens[email] = {
        token: token,
        expiry: expiry,
        createdAt: Date.now()
    };
    saveResetTokens();
    return token;
}

function validateResetToken(email, token) {
    const tokenData = resetTokens[email];
    if (!tokenData) {
        return false;
    }
    if (Date.now() > tokenData.expiry) {
        delete resetTokens[email];
        saveResetTokens();
        return false;
    }
    return tokenData.token === token;
}

function resetPassword(email, token, newPassword) {
    if (!validateResetToken(email, token)) {
        return false;
    }
    
    const user = users.find(u => u.email === email);
    if (!user) {
        return false;
    }
    
    user.password = newPassword;
    delete resetTokens[email];
    saveResetTokens();
    saveUsers();
    return true;
}

// Modal Functions
function showLoginModal() {
    document.getElementById('login-modal').classList.add('active');
}

function closeLoginModal() {
    document.getElementById('login-modal').classList.remove('active');
}

function showForgotPasswordModal() {
    closeLoginModal();
    document.getElementById('forgot-password-modal').classList.add('active');
    document.getElementById('reset-link-container').style.display = 'none';
    document.getElementById('forgot-password-form').reset();
}

function closeForgotPasswordModal() {
    document.getElementById('forgot-password-modal').classList.remove('active');
}

function showResetPasswordModal(email = '', token = '') {
    document.getElementById('reset-email').value = email;
    document.getElementById('reset-token').value = token;
    document.getElementById('reset-password-modal').classList.add('active');
}

function closeResetPasswordModal() {
    document.getElementById('reset-password-modal').classList.remove('active');
    document.getElementById('reset-password-form').reset();
}

function showAddUserModal() {
    document.getElementById('add-user-modal').classList.add('active');
}

function closeAddUserModal() {
    document.getElementById('add-user-modal').classList.remove('active');
    document.getElementById('add-user-form').reset();
}

// Admin Panel Functions
function showAdminPanel() {
    document.getElementById('admin-panel').style.display = 'flex';
    loadDashboard();
    loadUsers();
    loadFeatureControls();
    loadSettings();
}

function hideAdminPanel() {
    document.getElementById('admin-panel').style.display = 'none';
}

function switchAdminSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from all nav links
    document.querySelectorAll('.admin-nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Show selected section
    const section = document.getElementById(`section-${sectionName}`);
    if (section) {
        section.classList.add('active');
    }
    
    // Update nav link
    const navLink = document.querySelector(`[data-section="${sectionName}"]`);
    if (navLink) {
        navLink.classList.add('active');
    }
    
    // Update title
    const titles = {
        dashboard: 'Dashboard',
        users: 'User Management',
        features: 'Feature Control',
        analytics: 'Analytics & Reports',
        settings: 'System Settings'
    };
    document.getElementById('admin-section-title').textContent = titles[sectionName] || 'Admin Panel';
    
    // Load section-specific data
    if (sectionName === 'dashboard') {
        loadDashboard();
    } else if (sectionName === 'users') {
        loadUsers();
    } else if (sectionName === 'analytics') {
        loadAnalytics();
    }
}

// Dashboard Functions
function loadDashboard() {
    updateStats();
    loadRecentActivity();
}

function updateStats() {
    stats.totalUsers = users.length;
    document.getElementById('stat-total-users').textContent = stats.totalUsers;
    document.getElementById('stat-enhancements').textContent = stats.enhancements;
    document.getElementById('stat-compressions').textContent = stats.compressions;
    document.getElementById('stat-links').textContent = stats.links;
    document.getElementById('stat-pdfs').textContent = stats.pdfs;
    document.getElementById('stat-storage').textContent = `${stats.storage} MB`;
    saveStats();
}

function loadRecentActivity() {
    const activityList = document.getElementById('activity-list');
    const activities = JSON.parse(localStorage.getItem('mediapro_activities') || '[]');
    
    activityList.innerHTML = '';
    
    if (activities.length === 0) {
        activityList.innerHTML = '<p style="color: var(--text-secondary); text-align: center;">No recent activity</p>';
        return;
    }
    
    activities.slice(-10).reverse().forEach(activity => {
        const item = document.createElement('div');
        item.className = 'activity-item';
        item.innerHTML = `
            <div>
                <p><span>${activity.user}</span> ${activity.action}</p>
                <p style="font-size: 0.85rem; margin-top: 0.25rem;">${new Date(activity.timestamp).toLocaleString()}</p>
            </div>
        `;
        activityList.appendChild(item);
    });
}

function addActivity(user, action) {
    const activities = JSON.parse(localStorage.getItem('mediapro_activities') || '[]');
    activities.push({
        user: user,
        action: action,
        timestamp: new Date().toISOString()
    });
    localStorage.setItem('mediapro_activities', JSON.stringify(activities.slice(-50))); // Keep last 50
}

// User Management Functions
function loadUsers() {
    const tbody = document.getElementById('users-table-body');
    tbody.innerHTML = '';
    
    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td><span class="status-badge">${user.role}</span></td>
            <td><span class="status-badge ${user.status}">${user.status}</span></td>
            <td>${new Date(user.joined).toLocaleDateString()}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon" onclick="editUser(${user.id})" title="Edit">✏️</button>
                    <button class="btn-icon" onclick="toggleUserStatus(${user.id})" title="Toggle Status">
                        ${user.status === 'active' ? '🚫' : '✅'}
                    </button>
                    <button class="btn-icon" onclick="deleteUser(${user.id})" title="Delete">🗑️</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function addUser(userData) {
    const newUser = {
        id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: userData.role || 'user',
        status: 'active',
        joined: new Date().toISOString()
    };
    
    users.push(newUser);
    saveUsers();
    loadUsers();
    updateStats();
    addActivity(currentUser.name, `created user: ${userData.email}`);
    showToast('User created successfully!');
}

function editUser(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    const newName = prompt('Enter new name:', user.name);
    if (newName && newName.trim()) {
        user.name = newName.trim();
        saveUsers();
        loadUsers();
        addActivity(currentUser.name, `updated user: ${user.email}`);
        showToast('User updated!');
    }
}

function toggleUserStatus(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    if (user.id === currentUser.id) {
        showToast('Cannot change your own status');
        return;
    }
    
    user.status = user.status === 'active' ? 'inactive' : 'active';
    saveUsers();
    loadUsers();
    addActivity(currentUser.name, `${user.status === 'active' ? 'activated' : 'deactivated'} user: ${user.email}`);
    showToast(`User ${user.status === 'active' ? 'activated' : 'deactivated'}`);
}

function deleteUser(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    if (user.id === currentUser.id) {
        showToast('Cannot delete your own account');
        return;
    }
    
    if (confirm(`Are you sure you want to delete ${user.email}?`)) {
        users = users.filter(u => u.id !== userId);
        saveUsers();
        loadUsers();
        updateStats();
        addActivity(currentUser.name, `deleted user: ${user.email}`);
        showToast('User deleted');
    }
}

// Feature Control Functions
function loadFeatureControls() {
    document.getElementById('toggle-enhance').checked = features.enhance;
    document.getElementById('toggle-compress').checked = features.compress;
    document.getElementById('toggle-share').checked = features.share;
    document.getElementById('toggle-pdf').checked = features.pdf;
    
    document.getElementById('max-file-size').value = settings.maxFileSize;
    document.getElementById('max-enhancements').value = settings.maxEnhancements;
    document.getElementById('link-expiry').value = settings.linkExpiry;
}

function applyFeatureToggles() {
    const enhanceSection = document.getElementById('enhance').closest('.feature-section');
    const compressSection = document.getElementById('compress').closest('.feature-section');
    const shareSection = document.getElementById('share').closest('.feature-section');
    const pdfSection = document.getElementById('pdf').closest('.feature-section');
    
    if (features.enhance) {
        enhanceSection.classList.remove('disabled');
    } else {
        enhanceSection.classList.add('disabled');
    }
    
    if (features.compress) {
        compressSection.classList.remove('disabled');
    } else {
        compressSection.classList.add('disabled');
    }
    
    if (features.share) {
        shareSection.classList.remove('disabled');
    } else {
        shareSection.classList.add('disabled');
    }
    
    if (features.pdf) {
        pdfSection.classList.remove('disabled');
    } else {
        pdfSection.classList.add('disabled');
    }
}

// Settings Functions
function loadSettings() {
    const siteName = localStorage.getItem('mediapro_site_name') || 'MediaPro Studio';
    document.getElementById('site-name').value = siteName;
    
    const maintenanceMode = localStorage.getItem('mediapro_maintenance') === 'true';
    document.getElementById('maintenance-mode').checked = maintenanceMode;
    
    const emailNotifications = localStorage.getItem('mediapro_email_notifications') !== 'false';
    document.getElementById('email-notifications').checked = emailNotifications;
}

// Analytics Functions
function loadAnalytics() {
    // Simple chart rendering (in production, use Chart.js or similar)
    const usageCanvas = document.getElementById('usage-chart');
    const featureCanvas = document.getElementById('feature-chart');
    
    if (usageCanvas) {
        drawSimpleChart(usageCanvas, [stats.enhancements, stats.compressions, stats.links, stats.pdfs], 
            ['Enhancements', 'Compressions', 'Links', 'PDFs']);
    }
    
    if (featureCanvas) {
        const featureData = [
            features.enhance ? 100 : 0,
            features.compress ? 100 : 0,
            features.share ? 100 : 0,
            features.pdf ? 100 : 0
        ];
        drawSimpleChart(featureCanvas, featureData, ['Enhance', 'Compress', 'Share', 'PDF']);
    }
}

function drawSimpleChart(canvas, data, labels) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#667eea';
    
    const maxValue = Math.max(...data, 1);
    const barWidth = width / data.length - 10;
    const barSpacing = 10;
    
    data.forEach((value, index) => {
        const barHeight = (value / maxValue) * (height - 40);
        const x = index * (barWidth + barSpacing) + barSpacing;
        const y = height - barHeight - 20;
        
        ctx.fillRect(x, y, barWidth, barHeight);
        
        // Label
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(labels[index], x + barWidth / 2, height - 5);
        ctx.fillText(value, x + barWidth / 2, y - 5);
        ctx.fillStyle = '#667eea';
    });
}

// Track usage (called from main script.js)
function trackUsage(type) {
    if (type === 'enhance') stats.enhancements++;
    else if (type === 'compress') stats.compressions++;
    else if (type === 'share') stats.links++;
    else if (type === 'pdf') stats.pdfs++;
    
    saveStats();
    updateStats();
    
    if (currentUser) {
        addActivity(currentUser.name || currentUser.email, `used ${type} feature`);
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    loadResetTokens();
    applyFeatureToggles();
    
    // Login form
    document.getElementById('login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        login(email, password);
    });
    
    // Login modal
    document.getElementById('login-link').addEventListener('click', (e) => {
        e.preventDefault();
        showLoginModal();
    });
    
    document.getElementById('close-login').addEventListener('click', closeLoginModal);
    document.getElementById('login-modal').addEventListener('click', (e) => {
        if (e.target.id === 'login-modal') {
            closeLoginModal();
        }
    });
    
    // Forgot Password
    document.getElementById('forgot-password-link').addEventListener('click', (e) => {
        e.preventDefault();
        showForgotPasswordModal();
    });
    
    document.getElementById('close-forgot-password').addEventListener('click', closeForgotPasswordModal);
    document.getElementById('forgot-password-modal').addEventListener('click', (e) => {
        if (e.target.id === 'forgot-password-modal') {
            closeForgotPasswordModal();
        }
    });
    
    document.getElementById('forgot-password-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('forgot-email').value;
        const user = users.find(u => u.email === email);
        
        if (!user) {
            showToast('Email not found in our system');
            return;
        }
        
        const token = generateResetToken(email);
        const resetLink = `${window.location.origin}${window.location.pathname}?reset=true&email=${encodeURIComponent(email)}&token=${token}`;
        
        document.getElementById('reset-link-display').value = resetLink;
        document.getElementById('reset-link-container').style.display = 'block';
        
        showToast('Reset link generated! Copy the link below.');
    });
    
    document.getElementById('copy-reset-link').addEventListener('click', () => {
        const linkInput = document.getElementById('reset-link-display');
        linkInput.select();
        document.execCommand('copy');
        showToast('Reset link copied to clipboard!');
    });
    
    // Reset Password Modal
    document.getElementById('close-reset-password').addEventListener('click', closeResetPasswordModal);
    document.getElementById('reset-password-modal').addEventListener('click', (e) => {
        if (e.target.id === 'reset-password-modal') {
            closeResetPasswordModal();
        }
    });
    
    document.getElementById('reset-password-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('reset-email').value;
        const token = document.getElementById('reset-token').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        if (newPassword !== confirmPassword) {
            showToast('Passwords do not match');
            return;
        }
        
        if (newPassword.length < 6) {
            showToast('Password must be at least 6 characters');
            return;
        }
        
        if (resetPassword(email, token, newPassword)) {
            closeResetPasswordModal();
            showToast('Password reset successfully! You can now login.');
            showLoginModal();
        } else {
            showToast('Invalid or expired reset token');
        }
    });
    
    // Check for reset link in URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('reset') === 'true') {
        const email = urlParams.get('email');
        const token = urlParams.get('token');
        if (email && token) {
            showResetPasswordModal(email, token);
            // Clean URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }
    
    // Logout
    document.getElementById('logout-link').addEventListener('click', (e) => {
        e.preventDefault();
        logout();
    });
    
    // Admin panel navigation
    document.getElementById('admin-link').addEventListener('click', (e) => {
        e.preventDefault();
        if (currentUser && currentUser.role === 'admin') {
            showAdminPanel();
        }
    });
    
    document.getElementById('close-admin').addEventListener('click', hideAdminPanel);
    
    // Admin nav links
    document.querySelectorAll('.admin-nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.getAttribute('data-section');
            switchAdminSection(section);
        });
    });
    
    // Add user
    document.getElementById('add-user-btn').addEventListener('click', showAddUserModal);
    document.getElementById('close-add-user').addEventListener('click', closeAddUserModal);
    document.getElementById('add-user-modal').addEventListener('click', (e) => {
        if (e.target.id === 'add-user-modal') {
            closeAddUserModal();
        }
    });
    
    document.getElementById('add-user-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const userData = {
            name: document.getElementById('user-name').value,
            email: document.getElementById('user-email').value,
            password: document.getElementById('user-password').value,
            role: document.getElementById('user-role').value
        };
        addUser(userData);
        closeAddUserModal();
    });
    
    // Feature toggles
    document.getElementById('toggle-enhance').addEventListener('change', (e) => {
        features.enhance = e.target.checked;
        saveFeatures();
        addActivity(currentUser.name, `${e.target.checked ? 'enabled' : 'disabled'} photo enhancement`);
    });
    
    document.getElementById('toggle-compress').addEventListener('change', (e) => {
        features.compress = e.target.checked;
        saveFeatures();
        addActivity(currentUser.name, `${e.target.checked ? 'enabled' : 'disabled'} photo compression`);
    });
    
    document.getElementById('toggle-share').addEventListener('change', (e) => {
        features.share = e.target.checked;
        saveFeatures();
        addActivity(currentUser.name, `${e.target.checked ? 'enabled' : 'disabled'} link generation`);
    });
    
    document.getElementById('toggle-pdf').addEventListener('change', (e) => {
        features.pdf = e.target.checked;
        saveFeatures();
        addActivity(currentUser.name, `${e.target.checked ? 'enabled' : 'disabled'} PDF editor`);
    });
    
    // Save settings
    document.getElementById('save-settings').addEventListener('click', () => {
        settings.maxFileSize = parseInt(document.getElementById('max-file-size').value);
        settings.maxEnhancements = parseInt(document.getElementById('max-enhancements').value);
        settings.linkExpiry = parseInt(document.getElementById('link-expiry').value);
        saveSettings();
        addActivity(currentUser.name, 'updated feature settings');
        showToast('Settings saved!');
    });
    
    // System settings
    document.getElementById('save-system-settings').addEventListener('click', () => {
        const siteName = document.getElementById('site-name').value;
        const maintenanceMode = document.getElementById('maintenance-mode').checked;
        const emailNotifications = document.getElementById('email-notifications').checked;
        
        localStorage.setItem('mediapro_site_name', siteName);
        localStorage.setItem('mediapro_maintenance', maintenanceMode);
        localStorage.setItem('mediapro_email_notifications', emailNotifications);
        
        addActivity(currentUser.name, 'updated system settings');
        showToast('System settings saved!');
    });
    
    // User search
    const userSearch = document.getElementById('user-search');
    if (userSearch) {
        userSearch.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const rows = document.querySelectorAll('#users-table-body tr');
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        });
    }
});

// Make functions globally available
window.trackUsage = trackUsage;
window.editUser = editUser;
window.toggleUserStatus = toggleUserStatus;
window.deleteUser = deleteUser;
