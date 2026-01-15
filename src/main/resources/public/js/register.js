/**
 * Register Page Script - with inline validation
 */

// Validation state
const validationState = {
    username: false,
    email: false,
    password: false,
    confirmPassword: false,
    phone: true // optional field, default valid
};

// Validation patterns
const patterns = {
    username: /^[a-zA-Z0-9_]+$/,
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    phone: /^[0-9+\-\s()]*$/
};

$(document).ready(function() {
    // If already logged in, redirect
    if (Auth.isLoggedIn()) {
        window.location.href = '/';
        return;
    }
    
    // Username validation on blur
    $('#username').on('blur', function() {
        validateUsername();
    });
    
    // Email validation on blur
    $('#email').on('blur', function() {
        validateEmail();
    });
    
    // Password validation on input (real-time strength check)
    $('#password').on('input', function() {
        checkPasswordStrength();
    });
    
    // Password validation on blur
    $('#password').on('blur', function() {
        validatePassword();
    });
    
    // Confirm password validation on blur
    $('#confirmPassword').on('blur', function() {
        validateConfirmPassword();
    });
    
    // Phone validation on blur
    $('#phone').on('blur', function() {
        validatePhone();
    });
    
    // Clear error state on focus
    $('#username, #email, #password, #confirmPassword, #phone').on('focus', function() {
        clearFieldError($(this));
    });
    
    // Register form submit
    $('#registerForm').on('submit', async function(e) {
        e.preventDefault();
        
        // Validate all fields
        validateUsername();
        validateEmail();
        validatePassword();
        validateConfirmPassword();
        validatePhone();
        
        // Check if all validations passed
        if (!validationState.username || !validationState.email || 
            !validationState.password || !validationState.confirmPassword || 
            !validationState.phone) {
            showError('Please fix the errors above before submitting');
            return;
        }
        
        if (!$('#agreeTerms').is(':checked')) {
            showError('Please agree to the Terms of Service');
            return;
        }
        
        // Disable button
        $('#registerBtn').prop('disabled', true).html('<span class="spinner-border spinner-border-sm me-2"></span>Creating account...');
        
        const userData = {
            username: $('#username').val().trim(),
            password: $('#password').val(),
            email: $('#email').val().trim(),
            phone: $('#phone').val().trim()
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

// Validate username
function validateUsername() {
    const username = $('#username').val().trim();
    const field = $('#username');
    
    if (!username) {
        setFieldError(field, 'usernameError', 'Username is required');
        validationState.username = false;
        return false;
    }
    
    if (username.length < 3) {
        setFieldError(field, 'usernameError', 'Username must be at least 3 characters');
        validationState.username = false;
        return false;
    }
    
    if (username.length > 20) {
        setFieldError(field, 'usernameError', 'Username must be less than 20 characters');
        validationState.username = false;
        return false;
    }
    
    if (!patterns.username.test(username)) {
        setFieldError(field, 'usernameError', 'Username can only contain letters, numbers, and underscores');
        validationState.username = false;
        return false;
    }
    
    setFieldSuccess(field, 'usernameError');
    validationState.username = true;
    return true;
}

// Validate email
function validateEmail() {
    const email = $('#email').val().trim();
    const field = $('#email');
    
    if (!email) {
        setFieldError(field, 'emailError', 'Email is required');
        validationState.email = false;
        return false;
    }
    
    if (!patterns.email.test(email)) {
        setFieldError(field, 'emailError', 'Please enter a valid email address');
        validationState.email = false;
        return false;
    }
    
    setFieldSuccess(field, 'emailError');
    validationState.email = true;
    return true;
}

// Check password strength
function checkPasswordStrength() {
    const password = $('#password').val();
    const strengthContainer = $('#passwordStrength');
    const strengthBar = $('#strengthBar');
    const strengthText = $('#strengthText');
    const passwordHint = $('#passwordHint');
    
    if (!password) {
        strengthContainer.hide();
        return;
    }
    
    strengthContainer.show();
    
    let strength = 0;
    let hints = [];
    
    // Length check
    if (password.length >= 8) {
        strength += 25;
    } else {
        hints.push('at least 8 characters');
    }
    
    // Lowercase check
    if (/[a-z]/.test(password)) {
        strength += 25;
    } else {
        hints.push('lowercase letter');
    }
    
    // Uppercase check
    if (/[A-Z]/.test(password)) {
        strength += 25;
    } else {
        hints.push('uppercase letter');
    }
    
    // Number or special char check
    if (/[0-9]/.test(password)) {
        strength += 12.5;
    } else {
        hints.push('number');
    }
    
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        strength += 12.5;
    } else {
        hints.push('special character');
    }
    
    // Update progress bar
    strengthBar.css('width', strength + '%');
    
    // Update color and text
    if (strength < 50) {
        strengthBar.removeClass('bg-warning bg-success').addClass('bg-danger');
        strengthText.text('Weak').removeClass('text-warning text-success').addClass('text-danger');
    } else if (strength < 75) {
        strengthBar.removeClass('bg-danger bg-success').addClass('bg-warning');
        strengthText.text('Medium').removeClass('text-danger text-success').addClass('text-warning');
    } else {
        strengthBar.removeClass('bg-danger bg-warning').addClass('bg-success');
        strengthText.text('Strong').removeClass('text-danger text-warning').addClass('text-success');
    }
    
    // Update hints
    if (hints.length > 0) {
        passwordHint.html('Add: ' + hints.join(', ')).show();
    } else {
        passwordHint.hide();
    }
    
    return strength;
}

// Validate password
function validatePassword() {
    const password = $('#password').val();
    const field = $('#password');
    
    if (!password) {
        setFieldError(field, 'passwordError', 'Password is required');
        validationState.password = false;
        return false;
    }
    
    if (password.length < 6) {
        setFieldError(field, 'passwordError', 'Password must be at least 6 characters');
        validationState.password = false;
        return false;
    }
    
    // Check minimum strength (at least medium - 50%)
    const strength = checkPasswordStrength();
    if (strength < 50) {
        setFieldError(field, 'passwordError', 'Password is too weak. Please add more complexity.');
        validationState.password = false;
        return false;
    }
    
    setFieldSuccess(field, 'passwordError');
    validationState.password = true;
    
    // Re-validate confirm password if it has value
    if ($('#confirmPassword').val()) {
        validateConfirmPassword();
    }
    
    return true;
}

// Validate confirm password
function validateConfirmPassword() {
    const password = $('#password').val();
    const confirmPassword = $('#confirmPassword').val();
    const field = $('#confirmPassword');
    
    if (!confirmPassword) {
        setFieldError(field, 'confirmPasswordError', 'Please confirm your password');
        validationState.confirmPassword = false;
        return false;
    }
    
    if (password !== confirmPassword) {
        setFieldError(field, 'confirmPasswordError', 'Passwords do not match');
        validationState.confirmPassword = false;
        return false;
    }
    
    setFieldSuccess(field, 'confirmPasswordError');
    validationState.confirmPassword = true;
    return true;
}

// Validate phone
function validatePhone() {
    const phone = $('#phone').val().trim();
    const field = $('#phone');
    
    // Phone is optional
    if (!phone) {
        clearFieldError(field);
        validationState.phone = true;
        return true;
    }
    
    // Remove allowed characters and check if anything remains
    const digitsOnly = phone.replace(/[\s\-+()]/g, '');
    
    if (!/^[0-9]+$/.test(digitsOnly)) {
        setFieldError(field, 'phoneError', 'Phone number can only contain digits, spaces, and + - ( )');
        validationState.phone = false;
        return false;
    }
    
    if (digitsOnly.length < 7) {
        setFieldError(field, 'phoneError', 'Phone number is too short (minimum 7 digits)');
        validationState.phone = false;
        return false;
    }
    
    if (digitsOnly.length > 15) {
        setFieldError(field, 'phoneError', 'Phone number is too long (maximum 15 digits)');
        validationState.phone = false;
        return false;
    }
    
    setFieldSuccess(field, 'phoneError');
    validationState.phone = true;
    return true;
}

// Set field error state
function setFieldError(field, errorId, message) {
    field.addClass('is-invalid').removeClass('is-valid');
    $('#' + errorId).text(message).addClass('d-block');
}

// Set field success state
function setFieldSuccess(field, errorId) {
    field.addClass('is-valid').removeClass('is-invalid');
    $('#' + errorId).text('').removeClass('d-block');
}

// Clear field error state
function clearFieldError(field) {
    field.removeClass('is-invalid is-valid');
}

// Show error message
function showError(message) {
    $('#errorMessage').text(message);
    $('#errorAlert').show();
}

// Hide error message
function hideError() {
    $('#errorAlert').hide();
}
