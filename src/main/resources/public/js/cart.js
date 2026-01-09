/**
 * Cart Page Script - With selection function and inventory check
 */

// Store the selected items
let selectedItems = new Set();
let cartData = null;

$(document).ready(function() {
    if (!Auth.isLoggedIn()) {
        $('#loginAlert').show();
        $('#loadingSpinner').hide();
        return;
    }
    
    loadCart();
    
    // Select All/Cancel All
    $('#selectAllCheckbox').on('change', function() {
        const isChecked = $(this).is(':checked');
        $('.item-checkbox').prop('checked', isChecked);
        
        selectedItems.clear();
        if (isChecked && cartData && cartData.items) {
            cartData.items.forEach(item => {
                selectedItems.add(item.productId);
            });
        }
        updateSummary();
    });
    
    // Clear cart
    $('#clearCartBtn').on('click', async function() {
        if (confirm('Are you sure you want to clear your cart?')) {
            const result = await API.clearCart();
            if (result.success) {
                Utils.showToast('Cart cleared', 'success');
                selectedItems.clear();
                loadCart();
                Auth.updateCartCount();
            } else {
                Utils.showToast(result.message || 'Operation failed', 'error');
            }
        }
    });
    
    // Proceed to checkout - Check inventory and then jump
    $('#checkoutBtn').on('click', async function() {
        if (selectedItems.size === 0) {
            Utils.showToast('Please select items to checkout', 'warning');
            return;
        }
        
        // Get the selected product
        const itemsToCheck = cartData.items.filter(item => selectedItems.has(item.productId));
        
        // Check inventory
        const stockResult = await API.checkStock(itemsToCheck);
        if (!stockResult.success) {
            Utils.showToast(stockResult.message || 'Some items are out of stock', 'error');
            return;
        }
        
        // Save the selected items to sessionStorage
        sessionStorage.setItem('checkoutItems', JSON.stringify(itemsToCheck));
        window.location.href = '/checkout.html';
    });
});

// Load cart
async function loadCart() {
    $('#loadingSpinner').show();
    $('#cartContent').hide();
    $('#emptyCart').hide();
    
    const result = await API.getCart();
    
    $('#loadingSpinner').hide();
    
    if (result.success && result.data) {
        cartData = result.data;
        
        if (cartData.items.length === 0) {
            $('#emptyCart').show();
        } else {
            displayCart(cartData);
            $('#cartContent').show();
        }
    } else {
        Utils.showToast(result.message || 'Failed to load', 'error');
        $('#emptyCart').show();
    }
}

// Display cart
function displayCart(cart) {
    const container = $('#cartList');
    container.empty();
    
    let totalQuantity = 0;
    
    cart.items.forEach(item => {
        totalQuantity += item.quantity;
        const isChecked = selectedItems.has(item.productId);
        const hasDiscount = item.discount && item.discount > 0;
        const originalPrice = item.price;
        const discountedPrice = hasDiscount ? item.price * (1 - item.discount) : item.price;
        const originalSubtotal = originalPrice * item.quantity;
        const discountedSubtotal = discountedPrice * item.quantity;
        
        // Stock tips
        const stockWarning = item.stock !== undefined && item.quantity > item.stock;
        const stockClass = stockWarning ? 'text-danger' : '';
        const stockInfo = item.stock !== undefined ? 
            `<small class="${stockClass}">(Stock: ${item.stock})</small>` : '';
        
        container.append(`
            <tr class="${isChecked ? 'table-active' : ''}" data-product-id="${item.productId}">
                <td class="text-center">
                    <input type="checkbox" class="form-check-input item-checkbox" 
                           data-id="${item.productId}" ${isChecked ? 'checked' : ''}>
                </td>
                <td>
                    <img src="${item.imageUrl}" class="cart-item-image" alt="${item.productName}">
                </td>
                <td>
                    <a href="/product-detail.html?id=${item.productId}" class="text-decoration-none">
                        ${item.productName}
                    </a>
                    ${hasDiscount ? `<span class="badge bg-danger ms-2">${Math.round(item.discount * 100)}% OFF</span>` : ''}
                    <br>${stockInfo}
                </td>
                <td>
                    ${hasDiscount ? `
                        <del class="text-muted small">$${Utils.formatPrice(originalPrice)}</del><br>
                        <span class="text-danger fw-bold">$${Utils.formatPrice(discountedPrice)}</span>
                    ` : `
                        <span class="fw-bold">$${Utils.formatPrice(originalPrice)}</span>
                    `}
                </td>
                <td>
                    <div class="input-group input-group-sm quantity-selector" style="width: 120px;">
                        <button class="btn btn-outline-secondary decrease-qty" data-id="${item.productId}">-</button>
                        <input type="number" class="form-control text-center item-quantity" 
                               value="${item.quantity}" min="1" data-id="${item.productId}" 
                               ${item.stock !== undefined ? `max="${item.stock}"` : ''}>
                        <button class="btn btn-outline-secondary increase-qty" data-id="${item.productId}">+</button>
                    </div>
                    ${stockWarning ? '<small class="text-danger d-block">Exceeds stock!</small>' : ''}
                </td>
                <td>
                    ${hasDiscount ? `
                        <del class="text-muted small">$${Utils.formatPrice(originalSubtotal)}</del><br>
                        <span class="text-elegant fw-bold">$${Utils.formatPrice(discountedSubtotal)}</span>
                    ` : `
                        <span class="text-elegant fw-bold">$${Utils.formatPrice(originalSubtotal)}</span>
                    `}
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-danger remove-item" data-id="${item.productId}">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `);
    });
    
    // Update cart item count
    $('#cartItemCount').text(totalQuantity);
    
    // Update the full marquee status
    updateSelectAllCheckbox();
    
    // Update summary
    updateSummary();
}

// Update the Select All checkbox status
function updateSelectAllCheckbox() {
    if (!cartData || !cartData.items || cartData.items.length === 0) {
        $('#selectAllCheckbox').prop('checked', false);
        return;
    }
    
    const allSelected = cartData.items.every(item => selectedItems.has(item.productId));
    $('#selectAllCheckbox').prop('checked', allSelected);
}

// Update the order summary
function updateSummary() {
    if (!cartData || !cartData.items) {
        $('#selectedCount').text('Selected: 0');
        $('#selectedItemsCount').text('0');
        $('#originalTotal').text('0.00');
        $('#discountTotal').text('0.00');
        $('#subtotal').text('0.00');
        $('#totalAmount').text('0.00');
        $('#checkoutBtn').prop('disabled', true);
        return;
    }
    
    let selectedCount = 0;
    let originalTotal = 0;
    let discountedTotal = 0;
    
    cartData.items.forEach(item => {
        if (selectedItems.has(item.productId)) {
            selectedCount++;
            const originalPrice = item.price * item.quantity;
            const hasDiscount = item.discount && item.discount > 0;
            const discountedPrice = hasDiscount ? 
                item.price * (1 - item.discount) * item.quantity : originalPrice;
            
            originalTotal += originalPrice;
            discountedTotal += discountedPrice;
        }
    });
    
    const discountAmount = originalTotal - discountedTotal;
    
    $('#selectedCount').text(`Selected: ${selectedCount}`);
    $('#selectedItemsCount').text(selectedCount);
    $('#originalTotal').text(Utils.formatPrice(originalTotal));
    $('#discountTotal').text(Utils.formatPrice(discountAmount));
    $('#subtotal').text(Utils.formatPrice(discountedTotal));
    $('#totalAmount').text(Utils.formatPrice(discountedTotal));
    
    // If no items are selected, disable the checkout button
    $('#checkoutBtn').prop('disabled', selectedCount === 0);
}

// Individual product selection changes
$(document).on('change', '.item-checkbox', function() {
    const productId = $(this).data('id');
    const isChecked = $(this).is(':checked');
    const row = $(this).closest('tr');
    
    if (isChecked) {
        selectedItems.add(productId);
        row.addClass('table-active');
    } else {
        selectedItems.delete(productId);
        row.removeClass('table-active');
    }
    
    updateSelectAllCheckbox();
    updateSummary();
});

// Decrease quantity
$(document).on('click', '.decrease-qty', async function() {
    const productId = $(this).data('id');
    const input = $(this).siblings('.item-quantity');
    let quantity = parseInt(input.val()) - 1;
    
    if (quantity < 1) {
        if (confirm('Remove this item from cart?')) {
            await removeItem(productId);
        }
    } else {
        await updateQuantity(productId, quantity);
    }
});

// Increase quantity
$(document).on('click', '.increase-qty', async function() {
    const productId = $(this).data('id');
    const input = $(this).siblings('.item-quantity');
    let quantity = parseInt(input.val()) + 1;
    
    // Check if you exceed inventory
    const item = cartData.items.find(i => i.productId === productId);
    if (item && item.stock !== undefined && quantity > item.stock) {
        Utils.showToast(`Cannot exceed stock limit (${item.stock})`, 'warning');
        return;
    }
    
    await updateQuantity(productId, quantity);
});

// Input quantity change
$(document).on('change', '.item-quantity', async function() {
    const productId = $(this).data('id');
    let quantity = parseInt($(this).val()) || 1;
    if (quantity < 1) quantity = 1;
    
    // Check if you exceed inventory
    const item = cartData.items.find(i => i.productId === productId);
    if (item && item.stock !== undefined && quantity > item.stock) {
        Utils.showToast(`Cannot exceed stock limit (${item.stock})`, 'warning');
        $(this).val(item.stock);
        quantity = item.stock;
    }
    
    await updateQuantity(productId, quantity);
});

// Update quantity
async function updateQuantity(productId, quantity) {
    const result = await API.updateCartItem(productId, quantity);
    if (result.success) {
        loadCart();
        Auth.updateCartCount();
    } else {
        Utils.showToast(result.message || 'Update failed', 'error');
    }
}

// Remove item
$(document).on('click', '.remove-item', async function() {
    const productId = $(this).data('id');
    if (confirm('Remove this item from cart?')) {
        await removeItem(productId);
    }
});

async function removeItem(productId) {
    const result = await API.removeFromCart(productId);
    if (result.success) {
        Utils.showToast('Item removed', 'success');
        selectedItems.delete(productId);
        loadCart();
        Auth.updateCartCount();
    } else {
        Utils.showToast(result.message || 'Failed to remove', 'error');
    }
}
