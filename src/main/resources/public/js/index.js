/**
 * Home Page Script
 */
$(document).ready(function() {
    // Load categories
    loadCategories();
    // Load featured products
    loadHotProducts();
});

// Category icon mapping
const categoryIcons = {
    'Sofas': 'bi-lamp',
    'Dining': 'bi-table',
    'Mattresses': 'bi-grid-3x3',
    'Beds': 'bi-house-heart',
    'Chairs': 'bi-person-workspace',
    'Desks': 'bi-book',
    'Wardrobes': 'bi-archive',
    'TV Stands': 'bi-tv',
    'Storage': 'bi-box',
    'Tables': 'bi-cup-hot',
    'Nightstands': 'bi-lamp-fill',
    'Lighting': 'bi-lightbulb'
};

// Load categories
async function loadCategories() {
    const result = await API.getCategories();
    if (result.success && result.data) {
        const container = $('#categoryList');
        container.empty();
        
        result.data.forEach(category => {
            const icon = categoryIcons[category] || 'bi-box-seam';
            container.append(`
                <div class="col-6 col-md-4 col-lg-2">
                    <a href="/products.html?category=${encodeURIComponent(category)}" class="text-decoration-none">
                        <div class="card category-card text-center p-3">
                            <div class="category-icon mx-auto">
                                <i class="bi ${icon}"></i>
                            </div>
                            <h6 class="card-title mb-0">${category}</h6>
                        </div>
                    </a>
                </div>
            `);
        });
    }
}

// Load featured products
async function loadHotProducts() {
    const result = await API.getProducts({ sortBy: 'sales' });
    if (result.success && result.data) {
        const container = $('#hotProducts');
        container.empty();
        
        // Show only first 8
        const products = result.data.slice(0, 8);
        
        products.forEach(product => {
            container.append(createProductCard(product));
        });
    }
}

// Create product card
function createProductCard(product) {
    const hasDiscount = product.discount && product.discount > 0;
    const discountedPrice = hasDiscount ? product.price * (1 - product.discount) : product.price;
    const discountBadge = hasDiscount ? 
        `<span class="badge bg-danger position-absolute top-0 end-0 m-2">${Math.round(product.discount * 100)}% OFF</span>` : '';
    
    const priceHtml = hasDiscount ? `
        <div>
            <span class="price text-danger">$${Utils.formatPrice(discountedPrice)}</span>
            <del class="text-muted small ms-1">$${Utils.formatPrice(product.price)}</del>
        </div>
    ` : `<span class="price">$${Utils.formatPrice(product.price)}</span>`;
    
    return `
        <div class="col-6 col-md-4 col-lg-3">
            <div class="card product-card h-100">
                <div class="position-relative">
                    <a href="/product-detail.html?id=${product.id}">
                        <img src="${product.imageUrl}" class="card-img-top" alt="${product.name}">
                    </a>
                    ${discountBadge}
                </div>
                <div class="card-body">
                    <h6 class="card-title text-truncate">
                        <a href="/product-detail.html?id=${product.id}" class="text-decoration-none text-dark">
                            ${product.name}
                        </a>
                    </h6>
                    <div class="rating mb-2">
                        ${Utils.generateStars(product.rating)}
                        <small class="text-muted">(${product.reviewCount})</small>
                    </div>
                    <div class="d-flex justify-content-between align-items-center">
                        ${priceHtml}
                        <button class="btn btn-sm btn-outline-elegant add-to-cart" data-id="${product.id}">
                            <i class="bi bi-cart-plus"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Add to cart click event
$(document).on('click', '.add-to-cart', async function(e) {
    e.preventDefault();
    
    if (!Auth.isLoggedIn()) {
        Utils.showToast('Please login first', 'warning');
        setTimeout(() => {
            window.location.href = '/login.html';
        }, 1000);
        return;
    }
    
    const productId = $(this).data('id');
    const btn = $(this);
    
    btn.prop('disabled', true);
    
    const result = await API.addToCart(productId, 1);
    
    if (result.success) {
        Utils.showToast('Added to cart', 'success');
        Auth.updateCartCount();
    } else {
        Utils.showToast(result.message || 'Failed to add', 'error');
    }
    
    btn.prop('disabled', false);
});
