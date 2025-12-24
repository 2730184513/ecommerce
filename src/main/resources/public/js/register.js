/**
 * Register Page Script
 */
$(document).ready(function() {
    // If already logged in, redirect
    if (Auth.isLoggedIn()) {
        window.location.href = '/';
        return;
    }
    
    // Register form submit
    $('#registerForm').on('submit', async function(e) {
        e.preventDefault();
        
        const username = $('#username').val().trim();
        const password = $('#password').val();
        const confirmPassword = $('#confirmPassword').val();
        const email = $('#email').val().trim();
        const phone = $('#phone').val().trim();
        
        // Validation
        if (!username) {
            showError('Please enter a username');
            return;
        }
        
        if (username.length < 3) {
            showError('Username must be at least 3 characters');
            return;
        }
        
        if (!email) {
            showError('Please enter your email');
            return;
        }
        
        if (!password) {
            showError('Please enter a password');
            return;
        }
        
        if (password.length < 6) {
            showError('Password must be at least 6 characters');
            return;
        }
        
        if (password !== confirmPassword) {
            showError('Passwords do not match');
            return;
        }
        
        if (!$('#agreeTerms').is(':checked')) {
            showError('Please agree to the Terms of Service');
            return;
        }
        
        // Disable button
        $('#registerBtn').prop('disabled', true).html('<span class="spinner-border spinner-border-sm me-2"></span>Creating account...');
        
        const userData = {
            username,
            password,
            email,
            phone
        };
        
        const result = await API.register(userData);
        
        if (result.success && result.data) {
            Auth.saveLogin(result.data.token, result.data.user);
            Utils.showToast('Account created successfully', 'success');
            setTimeout(() => {
                window.location.href = '/';
            }, 1000);
        } else {
            showError(result.message || 'Registration failed');
            $('#registerBtn').prop('disabled', false).html('<i class="bi bi-person-plus me-2"></i>Create Account');
        }
    });
});

// Show error message
function showError(message) {
    $('#errorMessage').text(message);
    $('#errorAlert').show();
}
