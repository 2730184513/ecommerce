/**
 * Checkout Page Script - Support for address selection and discounts
 */
let checkoutItems = null;
let savedAddresses = [];
let selectedAddressId = null;

$(document).ready(function() {
    if (!Auth.isLoggedIn()) {
        window.location.href = '/login.html?redirect=/checkout.html';
        return;
    }
    
    loadCheckoutItems();
    loadUserInfo();
    loadSavedAddresses();
    
    // Switch to a new address
    $('#useNewAddress').on('change', function() {
        const useNew = $(this).is(':checked');
        if (useNew) {
            $('#newAddressForm').show();
            $('#saveAddressOption').show();
            selectedAddressId = null;
            $('.address-option').removeClass('active');
            clearAddressForm();
        } else {
            if (savedAddresses.length > 0) {
                $('#newAddressForm').hide();
                $('#saveAddressOption').hide();
            }
        }
    });
    
    // Manage Addresses button
    $('#manageAddressesBtn').on('click', function() {
        loadAddressListInModal();
        new bootstrap.Modal(document.getElementById('addressModal')).show();
    });
    
    // Add address form submission
    $('#addAddressForm').on('submit', async function(e) {
        e.preventDefault();
        await addNewAddress();
    });
    
    // Place order
    $('#placeOrderBtn').on('click', function() {
        submitOrder();
    });
});

// Load the selected item from sessionStorage
function loadCheckoutItems() {
    const itemsStr = sessionStorage.getItem('checkoutItems');
    if (itemsStr) {
        checkoutItems = JSON.parse(itemsStr);
        if (!checkoutItems || checkoutItems.length === 0) {
            Utils.showToast('No items selected for checkout', 'warning');
            window.location.href = '/cart.html';
            return;
        }
        displayOrderItems();
    } else {
        // If there are no selected items, the entire cart is loaded
        loadFullCart();
    }
}

// Load the entire cart (compatible with old logic)
async function loadFullCart() {
    const result = await API.getCart();
    
    if (result.success && result.data) {
        if (result.data.items.length === 0) {
            Utils.showToast('Your cart is empty', 'warning');
            window.location.href = '/cart.html';
            return;
        }
        checkoutItems = result.data.items;
        displayOrderItems();
    } else {
        Utils.showToast('Failed to load cart', 'error');
        window.location.href = '/cart.html';
    }
}

// Display order items with discount
function displayOrderItems() {
    const container = $('#orderItems');
    container.empty();
    
    let originalTotal = 0;
    let discountedTotal = 0;
    
    checkoutItems.forEach(item => {
        const hasDiscount = item.discount && item.discount > 0;
        const originalPrice = item.price * item.quantity;
        const discountedPrice = hasDiscount ? 
            item.price * (1 - item.discount) * item.quantity : originalPrice;
        
        originalTotal += originalPrice;
        discountedTotal += discountedPrice;
        
        container.append(`
            <div class="d-flex justify-content-between mb-2">
                <span class="text-muted">
                    ${item.productName} × ${item.quantity}
                    ${hasDiscount ? `<span class="badge bg-danger">${Math.round(item.discount * 100)}% OFF</span>` : ''}
                </span>
                <span>
                    ${hasDiscount ? `<del class="text-muted small me-1">$${Utils.formatPrice(originalPrice)}</del>` : ''}
                    $${Utils.formatPrice(discountedPrice)}
                </span>
            </div>
        `);
    });
    
    const discountAmount = originalTotal - discountedTotal;
    // Calculate tax (10%)
    const tax = discountedTotal * 0.1;
    const total = discountedTotal + tax;
    
    // Update summary
    $('#originalTotal').text(Utils.formatPrice(originalTotal));
    $('#discountTotal').text(Utils.formatPrice(discountAmount));
    $('#subtotal').text(Utils.formatPrice(discountedTotal));
    $('#tax').text(Utils.formatPrice(tax));
    $('#totalAmount').text(Utils.formatPrice(total));
}

// Load user info and addresses
async function loadUserInfo() {
    const result = await API.getCurrentUser();
    if (result.success && result.data) {
        const user = result.data;
        if (user.phone) $('#phone').val(user.phone);
        if (user.email) $('#email').val(user.email);
    }
}

// Load saved addresses
async function loadSavedAddresses() {
    const result = await API.getAddresses();
    if (result.success && result.data) {
        savedAddresses = result.data || [];
        displaySavedAddresses();
    }
}

// Display saved addresses
function displaySavedAddresses() {
    if (savedAddresses.length === 0) {
        $('#savedAddressesSection').hide();
        $('#newAddressForm').show();
        return;
    }
    
    $('#savedAddressesSection').show();
    const container = $('#savedAddressesList');
    container.empty();
    
    savedAddresses.forEach((addr, index) => {
        const isDefault = addr.isDefault || addr.default;
        container.append(`
            <div class="address-option p-3 border rounded mb-2 ${isDefault ? 'active border-primary' : ''}" 
                 data-address-id="${addr.id}" style="cursor:pointer;">
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <strong>${addr.name || 'Address ' + (index + 1)}</strong>
                        ${isDefault ? '<span class="badge bg-primary ms-2">Default</span>' : ''}
                        <br>
                        <span class="text-muted">${addr.fullName} | ${addr.phone}</span><br>
                        <span>${addr.address}, ${addr.city}, ${addr.state} ${addr.zipCode}</span>
                    </div>
                    <input type="radio" name="selectedAddress" class="form-check-input" 
                           value="${addr.id}" ${isDefault ? 'checked' : ''}>
                </div>
            </div>
        `);
        
        if (isDefault) {
            selectedAddressId = addr.id;
            fillAddressFromSaved(addr);
        }
    });
    
    // If there are saved addresses, the new address form is hidden by default
    if (savedAddresses.length > 0) {
        $('#newAddressForm').hide();
        $('#saveAddressOption').hide();
    }
    
    // Click on the address option
    $('.address-option').on('click', function() {
        const addrId = $(this).data('address-id');
        selectAddress(addrId);
    });
}

// Select an address
function selectAddress(addrId) {
    selectedAddressId = addrId;
    $('#useNewAddress').prop('checked', false);
    $('.address-option').removeClass('active border-primary');
    $(`.address-option[data-address-id="${addrId}"]`).addClass('active border-primary');
    $(`input[name="selectedAddress"][value="${addrId}"]`).prop('checked', true);
    
    const addr = savedAddresses.find(a => a.id === addrId);
    if (addr) {
        fillAddressFromSaved(addr);
    }
    
    $('#newAddressForm').hide();
    $('#saveAddressOption').hide();
}

// Fill form from saved address
function fillAddressFromSaved(addr) {
    $('#fullName').val(addr.fullName || '');
    $('#phone').val(addr.phone || '');
    $('#address').val(addr.address || '');
    $('#city').val(addr.city || '');
    $('#state').val(addr.state || '');
    $('#zipCode').val(addr.zipCode || '');
}

// Clear address form
function clearAddressForm() {
    $('#fullName').val('');
    $('#phone').val('');
    $('#address').val('');
    $('#city').val('');
    $('#state').val('');
    $('#zipCode').val('');
}

// Load addresses in modal
async function loadAddressListInModal() {
    const result = await API.getAddresses();
    if (result.success) {
        savedAddresses = result.data || [];
    }
    
    const container = $('#addressList');
    container.empty();
    
    if (savedAddresses.length === 0) {
        container.html('<p class="text-muted">No saved addresses yet.</p>');
        return;
    }
    
    savedAddresses.forEach((addr, index) => {
        const isDefault = addr.isDefault || addr.default;
        container.append(`
            <div class="d-flex justify-content-between align-items-center p-3 border rounded mb-2">
                <div>
                    <strong>${addr.name || 'Address ' + (index + 1)}</strong>
                    ${isDefault ? '<span class="badge bg-primary ms-2">Default</span>' : ''}
                    <br>
                    <span class="text-muted">${addr.fullName} | ${addr.phone}</span><br>
                    <span>${addr.address}, ${addr.city}, ${addr.state} ${addr.zipCode}</span>
                </div>
                <div>
                    ${!isDefault ? `<button class="btn btn-sm btn-outline-primary me-1 set-default-btn" data-id="${addr.id}">Set Default</button>` : ''}
                    <button class="btn btn-sm btn-outline-danger delete-addr-btn" data-id="${addr.id}">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        `);
    });
    
    // Set default button
    $('.set-default-btn').on('click', async function() {
        const id = $(this).data('id');
        const result = await API.setDefaultAddress(id);
        if (result.success) {
            Utils.showToast('Default address updated', 'success');
            loadAddressListInModal();
            loadSavedAddresses();
        } else {
            Utils.showToast(result.message || 'Failed to update', 'error');
        }
    });
    
    // Delete button
    $('.delete-addr-btn').on('click', async function() {
        if (!confirm('Delete this address?')) return;
        const id = $(this).data('id');
        const result = await API.deleteAddress(id);
        if (result.success) {
            Utils.showToast('Address deleted', 'success');
            loadAddressListInModal();
            loadSavedAddresses();
        } else {
            Utils.showToast(result.message || 'Failed to delete', 'error');
        }
    });
}

// Add new address
async function addNewAddress() {
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
        Utils.showToast('Address added', 'success');
        // Clear form
        $('#addAddressForm')[0].reset();
        loadAddressListInModal();
        loadSavedAddresses();
    } else {
        Utils.showToast(result.message || 'Failed to add address', 'error');
    }
}

// Submit order
async function submitOrder() {
    // Validate form
    const fullName = $('#fullName').val().trim();
    const phone = $('#phone').val().trim();
    const email = $('#email').val().trim();
    const address = $('#address').val().trim();
    const city = $('#city').val().trim();
    const state = $('#state').val().trim();
    const zipCode = $('#zipCode').val().trim();
    const paymentMethod = $('input[name="payment"]:checked').val();
    const notes = $('#notes').val().trim();
    const saveAddress = $('#saveAddress').is(':checked');
    
    if (!fullName) {
        Utils.showToast('Please enter your full name', 'warning');
        $('#fullName').focus();
        return;
    }
    
    if (!phone) {
        Utils.showToast('Please enter your phone number', 'warning');
        $('#phone').focus();
        return;
    }
    
    if (!email) {
        Utils.showToast('Please enter your email', 'warning');
        $('#email').focus();
        return;
    }
    
    if (!address) {
        Utils.showToast('Please enter your address', 'warning');
        $('#address').focus();
        return;
    }
    
    // If you choose to save the new address
    if (saveAddress && !selectedAddressId) {
        const addrResult = await API.addAddress({
            name: 'Shipping Address',
            fullName: fullName,
            phone: phone,
            address: address,
            city: city,
            state: state,
            zipCode: zipCode,
            isDefault: savedAddresses.length === 0
        });
        if (!addrResult.success) {
            console.log('Failed to save address:', addrResult.message);
        }
    }
    
    // Disable button
    $('#placeOrderBtn').prop('disabled', true).html('<span class="spinner-border spinner-border-sm me-2"></span>Processing...');
    
    const shippingAddress = `${address}, ${city}, ${state} ${zipCode}`;
    
    const orderData = {
        contactName: fullName,
        contactPhone: phone,
        shippingAddress: shippingAddress,
        paymentMethod: paymentMethod,
        notes: notes,
        items: checkoutItems  // Pass the selected item
    };
    
    const result = await API.createOrder(orderData);
    
    if (result.success && result.data) {
        // remove sessionStorage
        sessionStorage.removeItem('checkoutItems');
        
        // Show success modal
        $('#orderNumber').text(result.data.id);
        new bootstrap.Modal(document.getElementById('orderSuccessModal')).show();
        Auth.updateCartCount();
    } else {
        Utils.showToast(result.message || 'Order failed', 'error');
        $('#placeOrderBtn').prop('disabled', false).html('<i class="bi bi-check-circle me-2"></i>Place Order');
    }
}
