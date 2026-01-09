/**
 * Profile Page Script
 */
$(document).ready(function() {
    // Check if user is logged in
    if (!Auth.isLoggedIn()) {
        Utils.showToast('Please login first', 'warning');
        setTimeout(() => {
            window.location.href = '/login.html';
        }, 1000);
        return;
    }

    // Load user profile
    loadProfile();

    // Profile form submit
    $('#profileForm').on('submit', async function(e) {
        e.preventDefault();
        await updateProfile();
    });

    // Change password
    $('#savePasswordBtn').on('click', async function() {
        await changePassword();
    });
});

// Load user profile
async function loadProfile() {
    const result = await API.getCurrentUser();
    
    if (result.success && result.data) {
        const user = result.data;
        
        // Update sidebar
        $('#profileUsername').text(user.username);
        if (user.createdAt) {
            const date = new Date(user.createdAt);
            $('#memberSince').text(date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }));
        }
        
        // Fill form
        $('#inputUsername').val(user.username);
        $('#inputEmail').val(user.email || '');
        $('#inputPhone').val(user.phone || '');
        $('#inputAddress').val(user.address || '');
    } else {
        Utils.showToast('Failed to load profile', 'error');
    }
}

// Update profile
async function updateProfile() {
    const email = $('#inputEmail').val().trim();
    const phone = $('#inputPhone').val().trim();
    const address = $('#inputAddress').val().trim();

    const result = await API.put('/auth/me', { email, phone, address });
    
    if (result.success) {
        Utils.showToast('Profile updated successfully', 'success');
        
        // Update local storage
        const user = Auth.getUser();
        if (user) {
            user.email = email;
            user.phone = phone;
            user.address = address;
            localStorage.setItem('user', JSON.stringify(user));
        }
    } else {
        Utils.showToast(result.message || 'Failed to update profile', 'error');
    }
}

// Change password
async function changePassword() {
    const currentPassword = $('#currentPassword').val();
    const newPassword = $('#newPassword').val();
    const confirmPassword = $('#confirmPassword').val();

    if (!currentPassword || !newPassword || !confirmPassword) {
        Utils.showToast('Please fill in all fields', 'warning');
        return;
    }

    if (newPassword !== confirmPassword) {
        Utils.showToast('New passwords do not match', 'error');
        return;
    }

    if (newPassword.length < 6) {
        Utils.showToast('Password must be at least 6 characters', 'warning');
        return;
    }

    // Note: Password change API not implemented in backend
    // This is a placeholder for future implementation
    Utils.showToast('Password change feature coming soon', 'info');
    
    // Close modal
    $('#changePasswordModal').modal('hide');
    
    // Clear form
    $('#changePasswordForm')[0].reset();
}
