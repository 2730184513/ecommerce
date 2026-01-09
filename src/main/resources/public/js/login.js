/**
 * Login Page Script
 */
$(document).ready(function() {
    // If already logged in, redirect
    if (Auth.isLoggedIn()) {
        redirectAfterLogin();
        return;
    }
    
    // Login form submit
    $('#loginForm').on('submit', async function(e) {
        e.preventDefault();
        
        const username = $('#username').val().trim();
        const password = $('#password').val();
        
        if (!username || !password) {
            showError('Please enter username and password');
            return;
        }
        
        // Disable button
        $('#loginBtn').prop('disabled', true).html('<span class="spinner-border spinner-border-sm me-2"></span>Signing in...');
        
        const result = await API.login(username, password);
        
        if (result.success && result.data) {
            Auth.saveLogin(result.data.token, result.data.user);
            Utils.showToast('Login successful', 'success');
            setTimeout(redirectAfterLogin, 500);
        } else {
            showError(result.message || 'Login failed');
            $('#loginBtn').prop('disabled', false).html('<i class="bi bi-box-arrow-in-right me-2"></i>Sign In');
        }
    });
});

// Show error message
function showError(message) {
    $('#errorMessage').text(message);
    $('#errorAlert').show();
}

// Redirect after login
function redirectAfterLogin() {
    const redirect = Utils.getUrlParam('redirect');
    window.location.href = redirect || '/';
}
