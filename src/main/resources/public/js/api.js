/**
 * API Module - Handles all API calls to backend
 */
const API = {
    baseUrl: '/api',

    // HTTP request helper
    async request(url, options = {}) {
        const token = Auth.getToken();
        
        const config = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        };
        
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        
        try {
            const response = await fetch(this.baseUrl + url, config);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('API Error:', error);
            return { success: false, message: 'Network error, please try again' };
        }
    },

    // GET request
    async get(url) {
        return this.request(url, { method: 'GET' });
    },

    // POST request
    async post(url, body) {
        return this.request(url, {
            method: 'POST',
            body: JSON.stringify(body)
        });
    },

    // PUT request
    async put(url, body) {
        return this.request(url, {
            method: 'PUT',
            body: JSON.stringify(body)
        });
    },

    // DELETE request
    async delete(url) {
        return this.request(url, { method: 'DELETE' });
    },

    // ==================== Product APIs ====================
    
    // Get all products with optional filters
    async getProducts(params = {}) {
        let url = '/products';
        const queryParams = new URLSearchParams();
        
        if (params.category) queryParams.append('category', params.category);
        if (params.keyword) queryParams.append('keyword', params.keyword);
        if (params.minPrice) queryParams.append('minPrice', params.minPrice);
        if (params.maxPrice) queryParams.append('maxPrice', params.maxPrice);
        if (params.sortBy) queryParams.append('sortBy', params.sortBy);
        
        const queryString = queryParams.toString();
        if (queryString) url += '?' + queryString;
        
        return this.get(url);
    },

    // Get single product
    async getProduct(id) {
        return this.get(`/products/${id}`);
    },

    // Get all categories
    async getCategories() {
        return this.get('/categories');
    },

    // ==================== User APIs ====================
    
    // Login
    async login(username, password) {
        return this.post('/auth/login', { username, password });
    },

    // Register
    async register(userData) {
        return this.post('/auth/register', userData);
    },

    // Get current user info
    async getCurrentUser() {
        return this.get('/auth/me');
    },

    // ==================== Cart APIs ====================
    
    // Get cart
    async getCart() {
        return this.get('/cart');
    },

    // Add to cart
    async addToCart(productId, quantity = 1) {
        return this.post('/cart', { productId, quantity });
    },

    // Update cart item quantity
    async updateCartItem(productId, quantity) {
        return this.put(`/cart/${productId}`, { quantity });
    },

    // Remove from cart
    async removeFromCart(productId) {
        return this.delete(`/cart/${productId}`);
    },

    // Clear cart
    async clearCart() {
        return this.delete('/cart');
    },

    // ==================== Order APIs ====================
    
    // Create order
    async createOrder(orderData) {
        return this.post('/orders', orderData);
    },

    // Get user orders
    async getOrders() {
        return this.get('/orders');
    },

    // Get single order
    async getOrder(id) {
        return this.get(`/orders/${id}`);
    },
    
    // Check stock for items
    async checkStock(items) {
        return this.post('/cart/check-stock', items);
    },
    
    // ==================== Address APIs ====================
    
    // Get user addresses
    async getAddresses() {
        return this.get('/addresses');
    },
    
    // Add new address
    async addAddress(addressData) {
        return this.post('/addresses', addressData);
    },
    
    // Update address
    async updateAddress(id, addressData) {
        return this.put(`/addresses/${id}`, addressData);
    },
    
    // Delete address
    async deleteAddress(id) {
        return this.delete(`/addresses/${id}`);
    },
    
    // Set default address
    async setDefaultAddress(id) {
        return this.put(`/addresses/${id}/default`, {});
    }
};

/**
 * Authentication Module
 */
const Auth = {
    tokenKey: 'furniture_token',
    userKey: 'furniture_user',

    // Save login info
    saveLogin(token, user) {
        localStorage.setItem(this.tokenKey, token);
        localStorage.setItem(this.userKey, JSON.stringify(user));
    },

    // Get token
    getToken() {
        return localStorage.getItem(this.tokenKey);
    },

    // Get user
    getUser() {
        const userStr = localStorage.getItem(this.userKey);
        return userStr ? JSON.parse(userStr) : null;
    },

    // Check if logged in
    isLoggedIn() {
        return !!this.getToken();
    },

    // Logout
    logout() {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);
    },

    // Update cart count in navbar
    async updateCartCount() {
        if (!this.isLoggedIn()) {
            $('.cart-count').hide();
            return;
        }
        
        const result = await API.getCart();
        if (result.success && result.data) {
            const count = result.data.items.reduce((sum, item) => sum + item.quantity, 0);
            if (count > 0) {
                $('.cart-count').text(count).show();
            } else {
                $('.cart-count').hide();
            }
        }
    }
};

/**
 * Utility Functions
 */
const Utils = {
    // Format price
    formatPrice(price) {
        return parseFloat(price).toFixed(2);
    },

    // Generate star rating HTML
    generateStars(rating) {
        let html = '';
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        
        for (let i = 0; i < fullStars; i++) {
            html += '<i class="bi bi-star-fill"></i>';
        }
        if (hasHalfStar) {
            html += '<i class="bi bi-star-half"></i>';
        }
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        for (let i = 0; i < emptyStars; i++) {
            html += '<i class="bi bi-star"></i>';
        }
        
        return html;
    },

    // Get URL parameter
    getUrlParam(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    },

    // Show toast notification
    showToast(message, type = 'info') {
        const toastHtml = `
            <div class="toast align-items-center text-white bg-${type === 'error' ? 'danger' : type === 'success' ? 'success' : 'warning'} border-0" role="alert">
                <div class="d-flex">
                    <div class="toast-body">${message}</div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
                </div>
            </div>
        `;
        
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container position-fixed top-0 end-0 p-3';
            document.body.appendChild(container);
        }
        
        container.insertAdjacentHTML('beforeend', toastHtml);
        const toastElement = container.lastElementChild;
        const toast = new bootstrap.Toast(toastElement, { autohide: true, delay: 3000 });
        toast.show();
        
        toastElement.addEventListener('hidden.bs.toast', () => {
            toastElement.remove();
        });
    }
};
