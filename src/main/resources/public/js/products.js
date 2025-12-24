/**
 * Products Page Script
 */

// Pagination state
let currentPage = 1;
const itemsPerPage = 9;
let allProducts = [];
let filteredProducts = [];

$(document).ready(function() {
    // Get URL parameters
    const keyword = Utils.getUrlParam('keyword');
    const category = Utils.getUrlParam('category');
    
    // Set search input value
    if (keyword) {
        $('#searchInput').val(keyword);
    }
    
    // Load category filter options
    loadCategoryFilter();
    
    // Load products
    loadProducts();
    
    // Sort change event
    $('#sortSelect').on('change', function() {
        currentPage = 1;
        applyFiltersAndSort();
    });
    
    // Apply filter
    $('#applyFilter').on('click', function() {
        currentPage = 1;
        applyFiltersAndSort();
    });
    
    // Reset filter
    $('#resetFilter').on('click', function() {
        $('#categoryFilter input[value=""]').prop('checked', true);
        $('#minPrice').val('');
        $('#maxPrice').val('');
        $('#sortSelect').val('');
        $('#searchInput').val('');
        currentPage = 1;
        // Remove URL parameters
        if (window.history.replaceState) {
            window.history.replaceState({}, document.title, window.location.pathname);
        }
        applyFiltersAndSort();
    });
    
    // Search input change event - refresh when cleared
    $('#searchInput').on('input', function() {
        const val = $(this).val().trim();
        if (val === '') {
            currentPage = 1;
            // Remove URL parameters when search is cleared
            if (window.history.replaceState) {
                window.history.replaceState({}, document.title, window.location.pathname);
            }
            applyFiltersAndSort();
        }
    });
    
    // Category radio change event
    $(document).on('change', 'input[name="category"]', function() {
        currentPage = 1;
        applyFiltersAndSort();
    });
});

// Load category filter options
async function loadCategoryFilter() {
    const result = await API.getCategories();
    if (result.success && result.data) {
        const container = $('#categoryFilter');
        const currentCategory = Utils.getUrlParam('category');
        
        // Clear existing options except "All Categories"
        container.find('.form-check:not(:first)').remove();
        
        result.data.forEach((category, index) => {
            const checked = currentCategory === category ? 'checked' : '';
            container.append(`
                <div class="form-check">
                    <input class="form-check-input" type="radio" name="category" 
                           id="cat${index}" value="${category}" ${checked}>
                    <label class="form-check-label" for="cat${index}">${category}</label>
                </div>
            `);
        });
        
        // Uncheck "All Categories" if URL has category param
        if (currentCategory) {
            $('#catAll').prop('checked', false);
        }
    }
}

// Load all products
async function loadProducts() {
    // Show loading
    $('#loadingSpinner').show();
    $('#productGrid').hide();
    $('#emptyState').hide();
    $('#paginationContainer').hide();
    
    const result = await API.getProducts({});
    
    $('#loadingSpinner').hide();
    
    if (result.success && result.data) {
        allProducts = result.data;
        applyFiltersAndSort();
    } else {
        Utils.showToast(result.message || 'Failed to load', 'error');
        $('#emptyState').show();
    }
}

// Apply filters and sorting
function applyFiltersAndSort() {
    // Start with all products
    filteredProducts = [...allProducts];
    
    // Search keyword filter - get from URL or input, convert to lowercase for case-insensitive matching
    const urlKeyword = Utils.getUrlParam('keyword');
    const inputKeyword = $('#searchInput').val().trim();
    const keyword = (urlKeyword || inputKeyword).toLowerCase();
    
    if (keyword) {
        filteredProducts = filteredProducts.filter(p => 
            p.name.toLowerCase().includes(keyword) || 
            p.description.toLowerCase().includes(keyword) ||
            p.category.toLowerCase().includes(keyword)
        );
    }
    
    // Category filter
    const category = $('input[name="category"]:checked').val();
    if (category) {
        filteredProducts = filteredProducts.filter(p => p.category === category);
    }
    
    // Price range filter
    const minPrice = parseFloat($('#minPrice').val());
    const maxPrice = parseFloat($('#maxPrice').val());
    if (!isNaN(minPrice)) {
        filteredProducts = filteredProducts.filter(p => p.price >= minPrice);
    }
    if (!isNaN(maxPrice)) {
        filteredProducts = filteredProducts.filter(p => p.price <= maxPrice);
    }
    
    // Sorting
    const sortBy = $('#sortSelect').val();
    if (sortBy) {
        switch (sortBy) {
            case 'price_asc':
                filteredProducts.sort((a, b) => a.price - b.price);
                break;
            case 'price_desc':
                filteredProducts.sort((a, b) => b.price - a.price);
                break;
            case 'rating':
                filteredProducts.sort((a, b) => b.rating - a.rating);
                break;
            case 'sales':
                filteredProducts.sort((a, b) => b.reviewCount - a.reviewCount);
                break;
        }
    }
    
    // Update total count
    $('#totalCount').text(filteredProducts.length);
    
    // Display products with pagination
    displayProducts();
}

// Display products for current page
function displayProducts() {
    const container = $('#productGrid');
    container.empty();
    
    if (filteredProducts.length === 0) {
        $('#emptyState').show();
        $('#paginationContainer').hide();
        container.hide();
        return;
    }
    
    $('#emptyState').hide();
    
    // Calculate pagination
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filteredProducts.length);
    const pageProducts = filteredProducts.slice(startIndex, endIndex);
    
    // Display products
    pageProducts.forEach(product => {
        container.append(createProductCard(product));
    });
    
    container.show();
    
    // Render pagination
    renderPagination(totalPages);
}

// Render pagination
function renderPagination(totalPages) {
    const container = $('#paginationContainer');
    
    if (totalPages <= 1) {
        container.hide();
        return;
    }
    
    let html = `
        <nav aria-label="Product pagination">
            <ul class="pagination justify-content-center mb-0">
                <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                    <a class="page-link" href="#" data-page="${currentPage - 1}">
                        <i class="bi bi-chevron-left"></i>
                    </a>
                </li>
    `;
    
    // Calculate page range to show
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);
    
    // Ensure we show at least 5 pages if available
    if (endPage - startPage < 4) {
        if (startPage === 1) {
            endPage = Math.min(5, totalPages);
        } else if (endPage === totalPages) {
            startPage = Math.max(1, totalPages - 4);
        }
    }
    
    if (startPage > 1) {
        html += `
            <li class="page-item">
                <a class="page-link" href="#" data-page="1">1</a>
            </li>
        `;
        if (startPage > 2) {
            html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }
    }
    
    for (let i = startPage; i <= endPage; i++) {
        html += `
            <li class="page-item ${i === currentPage ? 'active' : ''}">
                <a class="page-link" href="#" data-page="${i}">${i}</a>
            </li>
        `;
    }
    
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }
        html += `
            <li class="page-item">
                <a class="page-link" href="#" data-page="${totalPages}">${totalPages}</a>
            </li>
        `;
    }
    
    html += `
                <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                    <a class="page-link" href="#" data-page="${currentPage + 1}">
                        <i class="bi bi-chevron-right"></i>
                    </a>
                </li>
            </ul>
        </nav>
        <p class="pagination-info">
            Showing ${(currentPage - 1) * itemsPerPage + 1}-${Math.min(currentPage * itemsPerPage, filteredProducts.length)} of ${filteredProducts.length} products
        </p>
    `;
    
    container.html(html).show();
}

// Pagination click handler
$(document).on('click', '.pagination .page-link', function(e) {
    e.preventDefault();
    const page = parseInt($(this).data('page'));
    if (page && page !== currentPage && page >= 1) {
        currentPage = page;
        displayProducts();
        // Scroll to top of product grid
        $('html, body').animate({
            scrollTop: $('#productGrid').offset().top - 100
        }, 300);
    }
});

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
        <div class="col-6 col-md-4">
            <div class="card product-card h-100">
                <div class="position-relative">
                    <a href="/product-detail.html?id=${product.id}">
                        <img src="${product.imageUrl}" class="card-img-top" alt="${product.name}">
                    </a>
                    ${discountBadge}
                </div>
                <div class="card-body">
                    <span class="badge bg-secondary mb-2">${product.category}</span>
                    <h6 class="card-title">
                        <a href="/product-detail.html?id=${product.id}" class="text-decoration-none text-dark">
                            ${product.name}
                        </a>
                    </h6>
                    <p class="card-text text-muted small text-truncate">${product.description}</p>
                    <div class="rating mb-2">
                        ${Utils.generateStars(product.rating)}
                        <small class="text-muted">(${product.reviewCount})</small>
                    </div>
                    <div class="d-flex justify-content-between align-items-center">
                        ${priceHtml}
                        <button class="btn btn-sm btn-outline-elegant add-to-cart" data-id="${product.id}">
                            <i class="bi bi-cart-plus"></i> Add
                        </button>
                    </div>
                </div>
                <div class="card-footer bg-white">
                    <small class="text-muted">
                        <i class="bi bi-box-seam me-1"></i>Stock: ${product.stock}
                    </small>
                </div>
            </div>
        </div>
    `;
}

// Add to cart click event
$(document).on('click', '.add-to-cart', async function(e) {
    e.preventDefault();
    e.stopPropagation();
    
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
