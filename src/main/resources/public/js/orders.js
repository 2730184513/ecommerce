/**
 * Orders Page Script
 */
$(document).ready(function() {
    if (!Auth.isLoggedIn()) {
        $('#loginAlert').show();
        $('#loadingSpinner').hide();
        return;
    }
    
    loadOrders();
});

// Load orders
async function loadOrders() {
    $('#loadingSpinner').show();
    $('#ordersContent').hide();
    $('#emptyOrders').hide();
    
    const result = await API.getOrders();
    
    $('#loadingSpinner').hide();
    
    if (result.success && result.data) {
        const orders = result.data;
        
        if (orders.length === 0) {
            $('#emptyOrders').show();
        } else {
            displayOrders(orders);
            $('#ordersContent').show();
        }
    } else {
        Utils.showToast(result.message || 'Failed to load', 'error');
        $('#emptyOrders').show();
    }
}

// Display orders
function displayOrders(orders) {
    const container = $('#ordersList');
    container.empty();
    
    orders.forEach(order => {
        const statusClass = getStatusClass(order.status);
        const statusText = getStatusText(order.status);
        
        let itemsHtml = '';
        order.items.forEach(item => {
            itemsHtml += `
                <div class="d-flex align-items-center py-2 border-bottom">
                    <img src="${item.imageUrl}" class="cart-item-image me-3" alt="${item.productName}">
                    <div class="flex-grow-1">
                        <div>${item.productName}</div>
                        <small class="text-muted">$${Utils.formatPrice(item.price)} × ${item.quantity}</small>
                    </div>
                    <div class="text-elegant fw-bold">$${Utils.formatPrice(item.price * item.quantity)}</div>
                </div>
            `;
        });
        
        container.append(`
            <div class="card order-card">
                <div class="order-header d-flex justify-content-between align-items-center">
                    <div>
                        <strong>Order #${order.id}</strong>
                        <span class="text-muted ms-3">${order.createdAt}</span>
                    </div>
                    <span class="order-status ${statusClass}">${statusText}</span>
                </div>
                <div class="card-body">
                    ${itemsHtml}
                    <div class="d-flex justify-content-between align-items-center mt-3">
                        <div class="text-muted">
                            <i class="bi bi-geo-alt me-1"></i>${order.shippingAddress}
                        </div>
                        <div>
                            <span class="text-muted">${order.items.reduce((sum, item) => sum + item.quantity, 0)} items, Total:</span>
                            <strong class="text-elegant h5">$${Utils.formatPrice(order.totalAmount)}</strong>
                        </div>
                    </div>
                </div>
                <div class="card-footer bg-white d-flex justify-content-between align-items-center">
                    <div class="text-muted">
                        <small>
                            <i class="bi bi-credit-card me-1"></i>${getPaymentText(order.paymentMethod)}
                            <span class="ms-3"><i class="bi bi-person me-1"></i>${order.contactName || '-'}</span>
                            <span class="ms-3"><i class="bi bi-telephone me-1"></i>${order.contactPhone || '-'}</span>
                        </small>
                    </div>
                    <div>
                        <a href="/products.html" class="btn btn-sm btn-outline-elegant">Shop Again</a>
                    </div>
                </div>
            </div>
        `);
    });
}

// Get status CSS class
function getStatusClass(status) {
    const map = {
        'pending': 'pending',
        'paid': 'paid',
        'shipped': 'shipped',
        'completed': 'completed'
    };
    return map[status] || 'pending';
}

// Get status text
function getStatusText(status) {
    const map = {
        'pending': 'Pending',
        'paid': 'Paid',
        'shipped': 'Shipped',
        'completed': 'Completed'
    };
    return map[status] || status;
}

// Get payment method text
function getPaymentText(method) {
    const map = {
        'credit_card': 'Credit Card',
        'paypal': 'PayPal',
        'bank_transfer': 'Bank Transfer',
        'cod': 'Cash on Delivery'
    };
    return map[method] || 'Online Payment';
}
