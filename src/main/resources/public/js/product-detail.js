/**
 * Product Detail Page Script
 */
let currentProduct = null;

$(document).ready(function() {
    const productId = Utils.getUrlParam('id');
    
    if (!productId) {
        showNotFound();
        return;
    }
    
    loadProduct(productId);
    
    // Quantity controls
    $('#decreaseQty').on('click', function() {
        let qty = parseInt($('#quantity').val()) || 1;
        if (qty > 1) {
            $('#quantity').val(qty - 1);
        }
    });
    
    $('#increaseQty').on('click', function() {
        let qty = parseInt($('#quantity').val()) || 1;
        if (currentProduct && qty < currentProduct.stock) {
            $('#quantity').val(qty + 1);
        }
    });
    
    // Quantity input validation
    $('#quantity').on('change', function() {
        let qty = parseInt($(this).val()) || 1;
        if (qty < 1) qty = 1;
        if (currentProduct && qty > currentProduct.stock) qty = currentProduct.stock;
        $(this).val(qty);
    });
    
    // Add to cart
    $('#addToCartBtn').on('click', function() {
        addToCart();
    });
});

// Load product details
async function loadProduct(id) {
    const result = await API.getProduct(id);
    
    $('#loadingSpinner').hide();
    
    if (result.success && result.data) {
        currentProduct = result.data;
        displayProduct(currentProduct);
        loadRelatedProducts(currentProduct.category);
        $('#productDetail').show();
    } else {
        showNotFound();
    }
}

// Display product information
function displayProduct(product) {
    $('#breadcrumbName').text(product.name);
    $('#productImage').attr('src', product.imageUrl).attr('alt', product.name);
    $('#productName').text(product.name);
    $('#productCategory').text(product.category);
    
    // 显示价格（含折扣）
    const hasDiscount = product.discount && product.discount > 0;
    if (hasDiscount) {
        const discountedPrice = product.price * (1 - product.discount);
        $('#productPrice').html(`
            <span class="text-danger">$${Utils.formatPrice(discountedPrice)}</span>
            <del class="text-muted h5 ms-2">$${Utils.formatPrice(product.price)}</del>
            <span class="badge bg-danger ms-2">${Math.round(product.discount * 100)}% OFF</span>
        `);
    } else {
        $('#productPrice').text('$' + Utils.formatPrice(product.price));
    }
    
    $('#productDescription').text(product.description);
    $('#productMaterial').text(product.material || 'N/A');
    $('#productDimensions').text(product.dimensions || 'N/A');
    $('#reviewCount').text(product.reviewCount);
    
    // Generate stars
    $('#productRating').html(Utils.generateStars(product.rating));
    
    // Stock status
    if (product.stock > 0) {
        $('#stockStatus').text(`${product.stock} in stock`).removeClass('text-danger').addClass('text-success');
    } else {
        $('#stockStatus').text('Out of stock').removeClass('text-success').addClass('text-danger');
        $('#addToCartBtn').prop('disabled', true);
    }
    
    // Update page title
    document.title = product.name + ' - LuxeHome';
}

// Load related products
async function loadRelatedProducts(category) {
    const result = await API.getProducts({ category });
    
    if (result.success && result.data) {
        const container = $('#relatedProducts');
        container.empty();
        
        // Filter out current product and take first 4
        const related = result.data.filter(p => p.id !== currentProduct.id).slice(0, 4);
        
        related.forEach(product => {
            const hasDiscount = product.discount && product.discount > 0;
            const discountedPrice = hasDiscount ? product.price * (1 - product.discount) : product.price;
            const discountBadge = hasDiscount ? 
                `<span class="badge bg-danger position-absolute top-0 end-0 m-2">${Math.round(product.discount * 100)}% OFF</span>` : '';
            const priceHtml = hasDiscount ? `
                <del class="text-muted small">$${Utils.formatPrice(product.price)}</del>
                <span class="price text-danger">$${Utils.formatPrice(discountedPrice)}</span>
            ` : `<span class="price">$${Utils.formatPrice(product.price)}</span>`;
            
            container.append(`
                <div class="col-6 col-md-3">
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
                            </div>
                            ${priceHtml}
                        </div>
                    </div>
                </div>
            `);
        });
    }
}

// Show not found message
function showNotFound() {
    $('#loadingSpinner').hide();
    $('#productDetail').hide();
    $('#notFound').show();
}

// Add to cart
async function addToCart() {
    if (!Auth.isLoggedIn()) {
        Utils.showToast('Please login first', 'warning');
        setTimeout(() => {
            window.location.href = '/login.html?redirect=' + encodeURIComponent(window.location.href);
        }, 1000);
        return;
    }
    
    if (!currentProduct) return;
    
    const quantity = parseInt($('#quantity').val()) || 1;
    
    $('#addToCartBtn').prop('disabled', true).html('<span class="spinner-border spinner-border-sm me-2"></span>Adding...');
    
    const result = await API.addToCart(currentProduct.id, quantity);
    
    if (result.success) {
        // Show toast
        $('#toastMessage').text('Added to cart successfully!');
        const toast = new bootstrap.Toast(document.getElementById('successToast'));
        toast.show();
        Auth.updateCartCount();
    } else {
        Utils.showToast(result.message || 'Failed to add', 'error');
    }
    
    $('#addToCartBtn').prop('disabled', false).html('<i class="bi bi-cart-plus me-2"></i>Add to Cart');
}
