/**
 * Profile Page Script
 */
let savedAddresses = [];

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
    
    // Load saved addresses
    loadAddresses();

    // Profile form submit
    $('#profileForm').on('submit', async function(e) {
        e.preventDefault();
        await updateProfile();
    });

    // Change password
    $('#savePasswordBtn').on('click', async function() {
        await changePassword();
    });
    
    // Add address
    $('#saveAddressBtn').on('click', async function() {
        await addAddress();
    });
    
    // Update address
    $('#updateAddressBtn').on('click', async function() {
        await updateAddress();
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
    } else {
        Utils.showToast('Failed to load profile', 'error');
    }
}

// Load saved addresses
async function loadAddresses() {
    const result = await API.getAddresses();
    
    if (result.success && result.data) {
        savedAddresses = result.data || [];
        displayAddresses();
    } else {
        $('#addressList').html('<p class="text-muted mb-0">Failed to load addresses.</p>');
    }
}

// Display addresses
function displayAddresses() {
    const container = $('#addressList');
    container.empty();
    
    if (savedAddresses.length === 0) {
        container.html('<p class="text-muted mb-0">No saved addresses yet. Add your first address!</p>');
        return;
    }
    
    savedAddresses.forEach((addr, index) => {
        const isDefault = addr.isDefault || addr.default;
        container.append(`
            <div class="address-card p-3 border rounded mb-3 ${isDefault ? 'border-primary' : ''}">
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <strong>${addr.name || 'Address ' + (index + 1)}</strong>
                        ${isDefault ? '<span class="badge bg-primary ms-2">Default</span>' : ''}
                        <br>
                        <span class="text-muted">${addr.fullName} | ${addr.phone}</span><br>
                        <span>${addr.address}, ${addr.city}, ${addr.state} ${addr.zipCode}</span>
                    </div>
                    <div class="btn-group">
                        ${!isDefault ? `<button class="btn btn-sm btn-outline-primary set-default-btn" data-id="${addr.id}" title="Set as default">
                            <i class="bi bi-star"></i>
                        </button>` : ''}
                        <button class="btn btn-sm btn-outline-secondary edit-addr-btn" data-id="${addr.id}" title="Edit">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger delete-addr-btn" data-id="${addr.id}" title="Delete">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `);
    });
    
    // Bind click events
    bindAddressActions();
}

// Bind address action buttons
function bindAddressActions() {
    // Set default
    $('.set-default-btn').off('click').on('click', async function() {
        const id = $(this).data('id');
        const result = await API.setDefaultAddress(id);
        if (result.success) {
            Utils.showToast('Default address updated', 'success');
            loadAddresses();
        } else {
            Utils.showToast(result.message || 'Failed to update', 'error');
        }
    });
    
    // Edit
    $('.edit-addr-btn').off('click').on('click', function() {
        const id = $(this).data('id');
        const addr = savedAddresses.find(a => a.id === id);
        if (addr) {
            fillEditForm(addr);
            new bootstrap.Modal(document.getElementById('editAddressModal')).show();
        }
    });
    
    // Delete
    $('.delete-addr-btn').off('click').on('click', async function() {
        if (!confirm('Are you sure you want to delete this address?')) return;
        const id = $(this).data('id');
        const result = await API.deleteAddress(id);
        if (result.success) {
            Utils.showToast('Address deleted', 'success');
            loadAddresses();
        } else {
            Utils.showToast(result.message || 'Failed to delete', 'error');
        }
    });
}

// Fill edit form
function fillEditForm(addr) {
    $('#editAddrId').val(addr.id);
    $('#editAddrName').val(addr.name || '');
    $('#editAddrFullName').val(addr.fullName || '');
    $('#editAddrPhone').val(addr.phone || '');
    $('#editAddrAddress').val(addr.address || '');
    $('#editAddrCity').val(addr.city || '');
    $('#editAddrState').val(addr.state || '');
    $('#editAddrZipCode').val(addr.zipCode || '');
    $('#editAddrIsDefault').prop('checked', addr.isDefault || addr.default);
}

// Add new address
async function addAddress() {
    const addressData = {
        name: $('#addrName').val().trim() || 'New Address',
        fullName: $('#addrFullName').val().trim(),
        phone: $('#addrPhone').val().trim(),
        address: $('#addrAddress').val().trim(),
        city: $('#addrCity').val().trim(),
        state: $('#addrState').val().trim(),
        zipCode: $('#addrZipCode').val().trim(),
        isDefault: $('#addrIsDefault').is(':checked')
    };
    
    if (!addressData.fullName || !addressData.phone || !addressData.address) {
        Utils.showToast('Please fill in all required fields', 'warning');
        return;
    }
    
    const result = await API.addAddress(addressData);
    if (result.success) {
        Utils.showToast('Address added successfully', 'success');
        // Clear form and close modal
        $('#addAddressForm')[0].reset();
        bootstrap.Modal.getInstance(document.getElementById('addAddressModal')).hide();
        loadAddresses();
    } else {
        Utils.showToast(result.message || 'Failed to add address', 'error');
    }
}

// Update address
async function updateAddress() {
    const id = $('#editAddrId').val();
    const addressData = {
        name: $('#editAddrName').val().trim() || 'Address',
        fullName: $('#editAddrFullName').val().trim(),
        phone: $('#editAddrPhone').val().trim(),
        address: $('#editAddrAddress').val().trim(),
        city: $('#editAddrCity').val().trim(),
        state: $('#editAddrState').val().trim(),
        zipCode: $('#editAddrZipCode').val().trim(),
        isDefault: $('#editAddrIsDefault').is(':checked')
    };
    
    if (!addressData.fullName || !addressData.phone || !addressData.address) {
        Utils.showToast('Please fill in all required fields', 'warning');
        return;
    }
    
    const result = await API.updateAddress(id, addressData);
    if (result.success) {
        Utils.showToast('Address updated successfully', 'success');
        bootstrap.Modal.getInstance(document.getElementById('editAddressModal')).hide();
        loadAddresses();
    } else {
        Utils.showToast(result.message || 'Failed to update address', 'error');
    }
}

// Update profile
async function updateProfile() {
    const email = $('#inputEmail').val().trim();
    const phone = $('#inputPhone').val().trim();

    const result = await API.put('/auth/me', { email, phone });
    
    if (result.success) {
        Utils.showToast('Profile updated successfully', 'success');
        
        // Update local storage
        const user = Auth.getUser();
        if (user) {
            user.email = email;
            user.phone = phone;
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
