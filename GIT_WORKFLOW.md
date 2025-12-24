# Git Collaborative Development Workflow

## ⚠️ IMPORTANT: Before You Start

### Project Directory Structure

This workflow assumes your project has the following structure:
```
your-project-root/
├── src/
│   └── main/
│       ├── java/
│       │   └── com/
│       │       └── furniture/
│       └── resources/
├── pom.xml
└── README.md
```

### Prerequisites

1. **Navigate to your project root directory** where `src/` folder exists:
   ```bash
   cd /path/to/your/project
   ```

2. **Verify you're in the correct directory**:
   ```bash
   # Check if src directory exists
   ls src/
   
   # Or use Test-Path in PowerShell
   Test-Path "src/main/java"
   ```

3. **If files don't exist yet**, you need to create them first before running git commands, or modify the workflow to match your actual file locations.

### Path Adjustment for Your Setup

Based on your directory structure:
- If your project is at: `D:\programming\projects\frontend_project\新建文件夹`
- Make sure to `cd` into that directory before running any git commands

```bash
# Example: Navigate to your project
cd "D:\programming\projects\frontend_project\新建文件夹"

# Verify structure
ls src/main/java/com/furniture/
```

---

## 👥 Team Members and Responsibilities

### Member A - Team Lead (Core Architecture)
- Data storage layer and backend core architecture
- Product module API
- User authentication API
- Frontend API wrapper and utilities
- Code review and merge

### Member B - Frontend Developer
- Shopping cart API
- Homepage functionality
- Product pages
- Cart page

### Member C - Full-stack Developer
- Order module API
- Login and registration pages
- Order pages
- User profile
- UI style components

---

## 🌳 Branch Strategy

- **main** - Main branch (production)
- **develop** - Development branch (integration)
- **feature/*** - Feature branches (individual development)

---

## 📝 Detailed Commit Process

### Phase 1: Project Initialization

#### Step 0: Initialize Repository (Member A)

```bash
# IMPORTANT: Verify you're in the project root directory
pwd  # Should show your project root path
Test-Path "src/main/java/com/furniture/model"  # Should return True

# Initialize repository and commit base files
git init
git checkout -b main

# Add model files (verify they exist first)
git add src/main/java/com/furniture/model/*

# Add frontend libraries
git add src/main/resources/public/bootstrap/
git add src/main/resources/public/JQuery/

# Add base CSS
git add src/main/resources/public/css/components/base.css

# Commit changes
git commit -m "chore: initialize project with models and frontend libraries

- Add all business model classes (Product, User, Order, CartItem, etc.)
- Integrate Bootstrap 5 framework and components
- Integrate jQuery 3.7.1 library
- Add base.css for project initialization
- Set up basic project structure"

# Push to remote
git push origin main

# Create develop branch
git checkout -b develop
git push origin develop
```

---

### Phase 2: Backend Core Architecture (Member A)

#### Commit 1: Data Storage Layer

**Branch**: `feature/data-layer`  
**Base**: `develop`  
**Owner**: Member A

```bash
# IMPORTANT: Verify you're in the project root directory
pwd
Test-Path "src/main/java/com/furniture"  # Should return True

# Switch to develop and update
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/data-layer

# Verify files exist before adding (PowerShell)
# If files don't exist, you need to create them first or skip this commit
Test-Path "src/main/java/com/furniture/data/DataStore.java"
Test-Path "src/main/resources/data/products.json"

# Add data storage layer files (only add files that exist)
git add src/main/java/com/furniture/data/DataStore.java
git add src/main/java/com/furniture/data/ProductManager.java
git add src/main/java/com/furniture/data/UserManager.java
git add src/main/java/com/furniture/data/CartManager.java
git add src/main/java/com/furniture/data/OrderManager.java

# Check what will be committed
git status

# Commit changes
git commit -m "feat: add data storage layer and managers

This commit implements the core data access layer for the application:

- DataStore: Singleton pattern to manage all data repositories
  * Centralized data management
  * Thread-safe implementation
  * Lazy initialization
  
- ProductManager: Handle product data operations
  * CRUD operations for products
  * Search and filter functionality
  * Category management
  
- UserManager: Handle user data operations
  * User authentication
  * User profile management
  * Session management
  
- CartManager: Handle shopping cart operations
  * Cart item management
  * Cart persistence
  * User-cart association
  
- OrderManager: Handle order data operations
  * Order creation and retrieval
  * Order status management
  * Order history tracking"

# Push to remote
git push origin feature/data-layer

# Switch back to develop
git checkout develop

# Merge feature branch
git merge --no-ff feature/data-layer -m "Merge branch 'feature/data-layer' into develop"

# Push to remote
git push origin develop

# Delete local feature branch
git branch -d feature/data-layer

# Delete remote feature branch
git push origin --delete feature/data-layer
```

---

#### Commit 2: Product Module API

**Branch**: `feature/product-api`  
**Base**: `develop`  
**Owner**: Member A

```bash
# Switch to develop and update
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/product-api

# Verify files exist before adding
Test-Path "src/main/java/com/furniture/controller/ProductController.java"

# Add product controller
git add src/main/java/com/furniture/controller/ProductController.java

# Verify what will be committed
git status

# Commit changes
git commit -m "feat: implement product module API endpoints

This commit adds the ProductController with comprehensive product management APIs:

Endpoints implemented:
- GET /api/products
  * Retrieve product list with pagination
  * Support keyword search (name, description)
  * Filter by category
  * Filter by price range (minPrice, maxPrice)
  * Sort by multiple criteria (price_asc, price_desc, rating, sales)
  * Return JSON response with product array

- GET /api/products/:id
  * Get detailed product information by ID
  * Return 404 if product not found
  * Include all product fields (name, price, images, stock, etc.)

- GET /api/categories
  * Retrieve all unique product categories
  * Used for filter dropdowns and navigation

Features:
- RESTful API design following best practices
- Query parameter validation
- Error handling with appropriate HTTP status codes
- JSON response format standardization
- Integration with ProductManager for data access"

# Push to remote
git push origin feature/product-api

# Switch back to develop
git checkout develop

# Merge feature branch
git merge --no-ff feature/product-api -m "Merge branch 'feature/product-api' into develop"

# Push to remote
git push origin develop

# Delete local feature branch
git branch -d feature/product-api

# Delete remote feature branch
git push origin --delete feature/product-api
```

---

#### Commit 3: User Authentication API

**Branch**: `feature/auth-api`  
**Base**: `develop`  
**Owner**: Member A

```bash
# Switch to develop and update
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/auth-api

# Verify files exist before adding
Test-Path "src/main/java/com/furniture/controller/UserController.java"

# Add user controller
git add src/main/java/com/furniture/controller/UserController.java

# Verify what will be committed
git status

# Commit changes
git commit -m "feat: implement user authentication API endpoints

This commit adds the UserController with complete authentication and user management:

Endpoints implemented:
- POST /api/auth/register
  * User registration with validation
  * Check for duplicate username/email
  * Password validation (minimum length, complexity)
  * Create new user account
  * Return user info and session token

- POST /api/auth/login
  * User authentication with username/password
  * Session token generation
  * Login attempt tracking
  * Return user profile and auth token

- POST /api/auth/logout
  * Terminate user session
  * Clear authentication token
  * Session cleanup

- GET /api/auth/me
  * Get current authenticated user information
  * Require valid session token
  * Return user profile data

- PUT /api/auth/me
  * Update user profile information
  * Support partial updates
  * Validate updated fields
  * Return updated user data

Security features:
- Session-based authentication
- Token validation middleware
- Password security (should use hashing in production)
- Authorization checks for protected endpoints
- Input validation and sanitization

Integration:
- Uses UserManager for data operations
- Spark session management for auth state
- JSON request/response handling"

# Push to remote
git push origin feature/auth-api

# Switch back to develop
git checkout develop

# Merge feature branch
git merge --no-ff feature/auth-api -m "Merge branch 'feature/auth-api' into develop"

# Push to remote
git push origin develop

# Delete local feature branch
git branch -d feature/auth-api

# Delete remote feature branch
git push origin --delete feature/auth-api
```

---

### Phase 3: Cart and Order Backend (Members B and C - Parallel Development)

#### Commit 4: Shopping Cart API

**Branch**: `feature/cart-api`  
**Base**: `develop`  
**Owner**: Member B

```bash
# Switch to develop and update
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/cart-api

# Verify files exist before adding
Test-Path "src/main/java/com/furniture/controller/CartController.java"

# Add cart controller
git add src/main/java/com/furniture/controller/CartController.java

# Verify what will be committed
git status

# Commit changes
git commit -m "feat: implement shopping cart API endpoints

This commit adds the CartController with full shopping cart management:

Endpoints implemented:
- GET /api/cart
  * Retrieve current user's shopping cart
  * Require authentication
  * Return cart items with product details
  * Calculate total price and item count

- POST /api/cart
  * Add product to shopping cart
  * Request body: { productId, quantity }
  * Validate product existence
  * Check stock availability
  * Merge if product already in cart
  * Return updated cart

- PUT /api/cart/:productId
  * Update product quantity in cart
  * Request body: { quantity }
  * Validate quantity (positive integer)
  * Check stock availability
  * Return updated cart

- DELETE /api/cart/:productId
  * Remove specific product from cart
  * Require authentication
  * Return updated cart

- DELETE /api/cart
  * Clear entire shopping cart
  * Remove all items for current user
  * Return empty cart

Features:
- User-specific cart management
- Real-time stock validation
- Automatic price calculation
- Cart persistence across sessions
- Product detail enrichment

Business logic:
- Prevent adding out-of-stock items
- Quantity limits based on available stock
- Automatic cart cleanup on logout (optional)
- Integration with ProductManager for product data"

# Push to remote
git push origin feature/cart-api

# Switch back to develop
git checkout develop

# Merge feature branch
git merge --no-ff feature/cart-api -m "Merge branch 'feature/cart-api' into develop"

# Push to remote
git push origin develop

# Delete local feature branch
git branch -d feature/cart-api

# Delete remote feature branch
git push origin --delete feature/cart-api
```

---

#### Commit 5: Order Management API

**Branch**: `feature/order-api`  
**Base**: `develop`  
**Owner**: Member C

```bash
# Switch to develop and update
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/order-api

# Verify files exist before adding
Test-Path "src/main/java/com/furniture/controller/OrderController.java"

# Add order controller
git add src/main/java/com/furniture/controller/OrderController.java

# Verify what will be committed
git status

# Commit changes
git commit -m "feat: implement order management API endpoints

This commit adds the OrderController with comprehensive order operations:

Endpoints implemented:
- POST /api/orders
  * Create new order from shopping cart
  * Require authentication
  * Request body: { shippingAddress, paymentMethod, note }
  * Validate cart is not empty
  * Check product stock availability
  * Calculate order total with shipping
  * Generate unique order ID
  * Clear cart after successful order
  * Return created order details

- GET /api/orders
  * Retrieve user's order list
  * Require authentication
  * Support filtering by status (pending, paid, shipped, delivered, cancelled)
  * Sort by creation date (newest first)
  * Return order summaries

- GET /api/orders/:id
  * Get detailed order information
  * Require authentication
  * Verify order belongs to current user
  * Return complete order details including items
  * Return 404 if order not found or unauthorized

Order workflow:
- Status lifecycle: pending -> paid -> shipped -> delivered
- Support order cancellation (only for pending status)
- Automatic timestamp tracking (createdAt, updatedAt)
- Order number generation

Features:
- Order validation before creation
- Stock reservation on order placement
- Address validation
- Order history tracking
- Status management
- User authorization checks

Business rules:
- Minimum order amount validation
- Payment method validation
- Shipping address requirement
- Stock deduction on order confirmation"

# Push to remote
git push origin feature/order-api

# Switch back to develop
git checkout develop

# Merge feature branch
git merge --no-ff feature/order-api -m "Merge branch 'feature/order-api' into develop"

# Push to remote
git push origin develop

# Delete local feature branch
git branch -d feature/order-api

# Delete remote feature branch
git push origin --delete feature/order-api
```

---

#### Commit 6: Application Entry Point

**Branch**: `feature/application-main`  
**Base**: `develop`  
**Owner**: Member A

```bash
# Switch to develop and update
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/application-main

# Verify files exist before adding
Test-Path "src/main/java/com/furniture/Application.java"

# Add application main class
git add src/main/java/com/furniture/Application.java

# Verify what will be committed
git status

# Commit changes
git commit -m "feat: add application entry point and routing configuration

This commit adds the main Application class that bootstraps the entire backend:

Server configuration:
- Set server port to 8080
- Configure static file serving from /public directory
- Enable development mode for better error messages

CORS configuration:
- Allow all origins (*) for development
- Support methods: GET, POST, PUT, DELETE, OPTIONS
- Allow headers: Content-Type, Authorization
- Handle preflight OPTIONS requests

Route registration:
- Initialize and register ProductController
- Initialize and register UserController  
- Initialize and register CartController
- Initialize and register OrderController
- All controllers follow RESTful conventions

Additional features:
- Root path (/) redirects to /index.html
- Global exception handler for 500 errors
  * Catches all unhandled exceptions
  * Returns JSON error response
  * Logs error details for debugging
  
- 404 handler for undefined routes
  * Returns consistent JSON error format
  * Helps frontend handle missing endpoints

Application structure:
- Centralized server configuration
- Modular controller architecture
- Consistent error handling
- Production-ready setup

This completes the backend API development. The server can now:
- Serve static frontend files
- Handle all API requests through controllers
- Provide proper error responses
- Support cross-origin requests"

# Push to remote
git push origin feature/application-main

# Switch back to develop
git checkout develop

# Merge feature branch
git merge --no-ff feature/application-main -m "Merge branch 'feature/application-main' into develop"

# Push to remote
git push origin develop

# Delete local feature branch
git branch -d feature/application-main

# Delete remote feature branch
git push origin --delete feature/application-main

# 🎉 Backend development complete - Tag backend release
git checkout main
git pull origin main
git merge --no-ff develop -m "Release: Backend API v1.0.0-backend

Complete backend API implementation:
- Data storage layer with managers
- Product API (list, detail, categories)
- User authentication API (register, login, profile)
- Shopping cart API (CRUD operations)
- Order management API (create, list, detail)
- Application entry point with routing"

git tag -a v1.0.0-backend -m "Backend API Development Complete

Version: 1.0.0-backend
Date: December 21, 2025

Features:
- Complete RESTful API implementation
- Data persistence with JSON files
- Session-based authentication
- Shopping cart management
- Order processing system

API Endpoints: 20+
Controllers: 4
Data Managers: 5"

git push origin main --tags

# Switch back to develop
git checkout develop
```

---

### Phase 4: Frontend Utilities (Member A)

#### Commit 7: Frontend Utilities and API Wrapper

**Branch**: `feature/frontend-utils`  
**Base**: `develop`  
**Owner**: Member A

```bash
# Switch to develop and update
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/frontend-utils

# Verify files exist before adding
Test-Path "src/main/resources/public/js/api.js"
Test-Path "src/main/resources/public/js/auth.js"

# Add frontend utility files
git add src/main/resources/public/js/api.js
git add src/main/resources/public/js/auth.js

# Verify what will be committed
git status

# Commit changes
git commit -m "feat: add frontend utilities and API wrapper

This commit implements core frontend utilities for API communication and authentication:

api.js - HTTP Request Wrapper:
- request(url, options): Unified HTTP request method
  * Supports GET, POST, PUT, DELETE methods
  * Automatic JSON parsing
  * Error handling and status code validation
  * Loading state management
  * Request/response interceptors

- API endpoint methods:
  * getProducts(params): Fetch product list with filters
  * getProduct(id): Get product details
  * addToCart(productId, quantity): Add item to cart
  * getCart(): Retrieve shopping cart
  * updateCartItem(productId, quantity): Update cart quantity
  * removeCartItem(productId): Remove from cart
  * createOrder(orderData): Place order
  * getOrders(): Fetch order history

auth.js - Authentication Manager:
- Authentication state management:
  * isLoggedIn(): Check if user is authenticated
  * getCurrentUser(): Get current user info
  * login(username, password): User login
  * logout(): Clear session and logout
  * register(userData): New user registration

- Session management:
  * Token storage in localStorage
  * Automatic token injection in requests
  * Session expiration handling
  * Login redirect for protected pages

- Helper functions:
  * requireAuth(): Middleware for protected pages
  * updateNavbar(): Update UI based on auth state
  * redirectToLogin(): Redirect to login page

Features:
- Consistent error handling across all requests
- Automatic authentication header injection
- Promise-based async operations
- Toast notifications for user feedback
- DRY principle for API calls"

# Push to remote
git push origin feature/frontend-utils

# Switch back to develop
git checkout develop

# Merge feature branch
git merge --no-ff feature/frontend-utils -m "Merge branch 'feature/frontend-utils' into develop"

# Push to remote
git push origin develop

# Delete local feature branch
git branch -d feature/frontend-utils

# Delete remote feature branch
git push origin --delete feature/frontend-utils
```

---

### Phase 5: UI Components (Member C)

#### Commit 8: Common UI Component Styles

**Branch**: `feature/ui-components`  
**Base**: `develop`  
**Owner**: Member C

```bash
# Switch to develop and update
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/ui-components

# Verify files exist before adding (check a few key files)
Test-Path "src/main/resources/public/css/components"
Test-Path "src/main/resources/public/css/style.css"

# Add all style component files
git add src/main/resources/public/css/components/navbar.css
git add src/main/resources/public/css/components/footer.css
git add src/main/resources/public/css/components/buttons.css
git add src/main/resources/public/css/components/forms.css
git add src/main/resources/public/css/components/cards.css
git add src/main/resources/public/css/components/toast.css
git add src/main/resources/public/css/components/tables.css
git add src/main/resources/public/css/components/breadcrumb.css
git add src/main/resources/public/css/components/pagination.css
git add src/main/resources/public/css/style.css

# Verify what will be committed
git status

# Commit changes
git commit -m "style: add common UI component styles

This commit adds comprehensive styling for all reusable UI components:

navbar.css - Navigation Bar:
- Fixed top navigation with shadow
- Logo and brand styling
- Navigation links with hover effects
- User menu dropdown
- Shopping cart badge
- Mobile responsive hamburger menu
- Active link highlighting

footer.css - Page Footer:
- Multi-column footer layout
- Quick links section
- Contact information
- Social media icons
- Copyright notice
- Responsive grid layout

buttons.css - Button Components:
- Primary, secondary, success, danger variants
- Outline button styles
- Button sizes (sm, md, lg)
- Icon buttons
- Loading state animations
- Disabled state styling
- Hover and active effects

forms.css - Form Elements:
- Input field styling
- Textarea customization
- Select dropdown styles
- Checkbox and radio buttons
- Form validation states (error, success)
- Input group with icons
- Form layout utilities

cards.css - Card Components:
- Product card layout
- Card hover effects
- Card image styling
- Card header and footer
- Card actions
- Shadow and border utilities

toast.css - Toast Notifications:
- Toast container positioning
- Success, error, warning, info variants
- Slide-in animations
- Auto-dismiss timing
- Close button styling
- Z-index management

tables.css - Table Components:
- Striped table rows
- Hover row highlighting
- Bordered tables
- Responsive table wrapper
- Table header styling
- Cell padding and alignment

breadcrumb.css - Breadcrumb Navigation:
- Horizontal breadcrumb layout
- Separator styling (chevron)
- Active crumb highlighting
- Link hover effects

pagination.css - Pagination Controls:
- Page number buttons
- Previous/next arrows
- Active page highlighting
- Disabled state for edges
- Compact and expanded layouts

style.css - Global Styles:
- CSS variable definitions (colors, spacing)
- Typography settings
- Global layout utilities
- Container widths
- Spacing utilities
- Import all component styles

Design system:
- Consistent color palette
- Standardized spacing scale
- Typography hierarchy
- Responsive breakpoints
- Accessibility considerations (contrast, focus states)"

# Push to remote
git push origin feature/ui-components

# Switch back to develop
git checkout develop

# Merge feature branch
git merge --no-ff feature/ui-components -m "Merge branch 'feature/ui-components' into develop"

# Push to remote
git push origin develop

# Delete local feature branch
git branch -d feature/ui-components

# Delete remote feature branch
git push origin --delete feature/ui-components
```

---

### Phase 6: Frontend Pages Development (Members A, B, C - Parallel Development)

#### Commit 9: Homepage Module

**Branch**: `feature/home-page`  
**Base**: `develop`  
**Owner**: Member B

```bash
# Switch to develop and update
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/home-page

# Verify files exist before adding
Test-Path "src/main/resources/public/index.html"
Test-Path "src/main/resources/public/js/index.js"
Test-Path "src/main/resources/public/css/components/hero.css"

# Add homepage files
git add src/main/resources/public/index.html
git add src/main/resources/public/js/index.js
git add src/main/resources/public/css/components/hero.css

# Verify what will be committed
git status

# Commit changes
git commit -m "feat: implement homepage with featured products

This commit creates the main landing page with product showcase:

index.html - Homepage Structure:
- Hero section with welcome banner
- Category navigation section
- Featured products section
- Navigation and footer integration

index.js - Homepage Logic:
- loadFeaturedProducts(): Fetch and display hot items
- loadCategories(): Populate category navigation
- initSearchBar(): Setup search functionality
- Event handlers for search and navigation
- Dynamic product card rendering
- Quick add to cart functionality

hero.css - Hero Section Styling:
- Full-width hero banner
- Centered content layout
- Responsive typography scaling
- Background image with overlay
- Search bar integration
- Mobile-optimized layout

Features:
- Responsive design for all devices
- Fast loading with optimized images
- SEO-friendly structure
- Accessibility compliance
- Smooth animations and transitions"

# Push to remote
git push origin feature/home-page

# Switch back to develop
git checkout develop

# Merge feature branch
git merge --no-ff feature/home-page -m "Merge branch 'feature/home-page' into develop"

# Push to remote
git push origin develop

# Delete local feature branch
git branch -d feature/home-page

# Delete remote feature branch
git push origin --delete feature/home-page
```

---

#### Commit 10: Login and Registration Pages

**Branch**: `feature/auth-pages`  
**Base**: `develop`  
**Owner**: Member C

```bash
# Switch to develop and update
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/auth-pages

# Verify files exist before adding
Test-Path "src/main/resources/public/login.html"
Test-Path "src/main/resources/public/register.html"
Test-Path "src/main/resources/public/js/login.js"
Test-Path "src/main/resources/public/js/register.js"

# Add authentication page files
git add src/main/resources/public/login.html
git add src/main/resources/public/register.html
git add src/main/resources/public/js/login.js
git add src/main/resources/public/js/register.js

# Verify what will be committed
git status

# Commit changes
git commit -m "feat: implement user authentication pages

This commit adds complete login and registration functionality:

login.html - Login Page:
- Clean, centered login form
- Username/email and password inputs
- Remember me checkbox
- Links to registration and password recovery

login.js - Login Logic:
- Form validation with real-time feedback
- API integration with /api/auth/login
- Session token storage
- Redirect to intended page or homepage
- Error message display

register.html - Registration Page:
- Multi-field registration form
- Username, email, password fields
- Password confirmation
- Terms and conditions checkbox

register.js - Registration Logic:
- Comprehensive form validation
- Password strength meter
- Password match confirmation
- API integration with /api/auth/register
- Auto-login on success
- Field-level error messages

Security considerations:
- Password visibility toggle
- XSS prevention in error messages
- No password in URL or logs

Accessibility:
- Proper label associations
- Keyboard navigation support
- Screen reader friendly
- Focus management"

# Push to remote
git push origin feature/auth-pages

# Switch back to develop
git checkout develop

# Merge feature branch
git merge --no-ff feature/auth-pages -m "Merge branch 'feature/auth-pages' into develop"

# Push to remote
git push origin develop

# Delete local feature branch
git branch -d feature/auth-pages

# Delete remote feature branch
git push origin --delete feature/auth-pages
```

---

#### Commit 11: Products List Page

**Branch**: `feature/products-page`  
**Base**: `develop`  
**Owner**: Member B

```bash
# Switch to develop and update
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/products-page

# Verify files exist before adding
Test-Path "src/main/resources/public/products.html"
Test-Path "src/main/resources/public/js/products.js"
Test-Path "src/main/resources/public/css/components/products.css"

# Add product list page files
git add src/main/resources/public/products.html
git add src/main/resources/public/js/products.js
git add src/main/resources/public/css/components/products.css

# Verify what will be committed
git status

# Commit changes
git commit -m "feat: implement products listing with advanced filtering

This commit creates a comprehensive product browsing experience:

products.html - Product List Page:
- Breadcrumb navigation
- Filter sidebar (search, category, price)
- Product grid with responsive layout
- Sorting and pagination controls

products.js - Product List Logic:
- loadProducts(): Fetch products from API
- Filter management (search, category, price range)
- Sorting functionality (price, rating, sales)
- Pagination with page navigation
- Product card rendering
- Quick add to cart from list
- Debounced search input
- URL parameter management

products.css - Product Page Styling:
- Sidebar filter panel (sticky on scroll)
- Product card hover effects
- Responsive grid layout
- Mobile filter drawer
- Pagination controls

Features:
- Real-time filter application
- URL-based filter sharing
- Mobile-friendly filter drawer
- Fast product search with debouncing
- Smooth loading states
- Empty state messaging"

# Push to remote
git push origin feature/products-page

# Switch back to develop
git checkout develop

# Merge feature branch
git merge --no-ff feature/products-page -m "Merge branch 'feature/products-page' into develop"

# Push to remote
git push origin develop

# Delete local feature branch
git branch -d feature/products-page

# Delete remote feature branch
git push origin --delete feature/products-page
```

---

#### Commit 12: Product Detail Page

**Branch**: `feature/product-detail-page`  
**Base**: `develop`  
**Owner**: Member B

```bash
# Switch to develop and update
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/product-detail-page

# Verify files exist before adding
Test-Path "src/main/resources/public/product-detail.html"
Test-Path "src/main/resources/public/js/product-detail.js"

# Add product detail page files
git add src/main/resources/public/product-detail.html
git add src/main/resources/public/js/product-detail.js

# Verify what will be committed
git status

# Commit changes
git commit -m "feat: implement product detail page

This commit creates a comprehensive product detail view:

product-detail.html - Product Detail Page:
- Breadcrumb navigation
- Product image gallery with thumbnails
- Product information (name, price, rating, stock)
- Quantity selector
- Add to cart and buy now buttons
- Product details tabs (description, specs, reviews)
- Related products section

product-detail.js - Product Detail Logic:
- loadProductDetail(id): Fetch product data
- Image gallery with zoom functionality
- Quantity management with validation
- handleAddToCart(): Add to cart with validation
- handleBuyNow(): Direct checkout flow
- Related products recommendation
- Dynamic price calculation
- Stock availability check
- Tab navigation

Features:
- Image zoom and gallery navigation
- Real-time stock validation
- Quantity validation against stock
- Responsive layout
- Fast add-to-cart with feedback
- Related products recommendation
- SEO-friendly structure"

# Push to remote
git push origin feature/product-detail-page

# Switch back to develop
git checkout develop

# Merge feature branch
git merge --no-ff feature/product-detail-page -m "Merge branch 'feature/product-detail-page' into develop"

# Push to remote
git push origin develop

# Delete local feature branch
git branch -d feature/product-detail-page

# Delete remote feature branch
git push origin --delete feature/product-detail-page
```

---

#### Commit 13: Shopping Cart Page

**Branch**: `feature/cart-page`  
**Base**: `develop`  
**Owner**: Member B

```bash
# Switch to develop and update
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/cart-page

# Verify files exist before adding
Test-Path "src/main/resources/public/cart.html"
Test-Path "src/main/resources/public/js/cart.js"
Test-Path "src/main/resources/public/css/components/cart.css"

# Add shopping cart page files
git add src/main/resources/public/cart.html
git add src/main/resources/public/js/cart.js
git add src/main/resources/public/css/components/cart.css

# Verify what will be committed
git status

# Commit changes
git commit -m "feat: implement shopping cart management

This commit creates full shopping cart functionality:

cart.html - Shopping Cart Page:
- Cart items table/list
- Bulk operations (select all, delete selected)
- Cart summary sidebar with totals
- Empty cart state
- Responsive mobile layout

cart.js - Shopping Cart Logic:
- loadCart(): Fetch and render cart
- Quantity management with validation
- Item removal with confirmation
- Selection management (select all/individual)
- Bulk delete operations
- Price calculations (subtotal, shipping, tax, total)
- handleCheckout(): Navigate to checkout
- Real-time updates and optimistic UI

cart.css - Shopping Cart Styling:
- Responsive table/card layout
- Cart summary sidebar (sticky on desktop)
- Empty state styling
- Loading animations
- Mobile-optimized controls

Features:
- Persistent cart across sessions
- Real-time price updates
- Stock validation
- Bulk item management
- Mobile-optimized interface
- Optimistic UI updates"

# Push to remote
git push origin feature/cart-page

# Switch back to develop
git checkout develop

# Merge feature branch
git merge --no-ff feature/cart-page -m "Merge branch 'feature/cart-page' into develop"

# Push to remote
git push origin develop

# Delete local feature branch
git branch -d feature/cart-page

# Delete remote feature branch
git push origin --delete feature/cart-page
```

---

#### Commit 14: Checkout Page

**Branch**: `feature/checkout-page`  
**Base**: `develop`  
**Owner**: Member C

```bash
# Switch to develop and update
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/checkout-page

# Verify files exist before adding
Test-Path "src/main/resources/public/checkout.html"
Test-Path "src/main/resources/public/js/checkout.js"
Test-Path "src/main/resources/public/css/components/checkout.css"

# Add checkout page files
git add src/main/resources/public/checkout.html
git add src/main/resources/public/js/checkout.js
git add src/main/resources/public/css/components/checkout.css

# Verify what will be committed
git status

# Commit changes
git commit -m "feat: implement checkout and order placement

This commit creates a complete checkout flow:

checkout.html - Checkout Page:
- Progress indicator (shipping, payment, review)
- Shipping address section (saved addresses + new address form)
- Payment method section
- Order review section with item list
- Price breakdown (subtotal, shipping, tax, total)
- Terms and conditions checkbox
- Place order button

checkout.js - Checkout Logic:
- loadCartItems(): Get items for checkout
- loadSavedAddresses(): Fetch user addresses
- Address management (select, add, edit, delete)
- Address form validation
- Payment method selection and validation
- handlePlaceOrder(): Submit order
- Step navigation with validation
- Price calculation (subtotal, shipping, tax)
- Order notes handling
- Loading states and error recovery

checkout.css - Checkout Page Styling:
- Progress steps indicator
- Collapsible form sections
- Address cards with selection
- Order summary sidebar (sticky)
- Mobile-responsive layout
- Form validation styling

Features:
- Multi-step checkout process
- Address management (save, select, edit)
- Multiple payment methods
- Order review before submission
- Real-time price calculation
- Form validation with feedback
- Mobile-responsive design
- Order confirmation"

# Push to remote
git push origin feature/checkout-page

# Switch back to develop
git checkout develop

# Merge feature branch
git merge --no-ff feature/checkout-page -m "Merge branch 'feature/checkout-page' into develop"

# Push to remote
git push origin develop

# Delete local feature branch
git branch -d feature/checkout-page

# Delete remote feature branch
git push origin --delete feature/checkout-page
```

---

#### Commit 15: Orders Page

**Branch**: `feature/orders-page`  
**Base**: `develop`  
**Owner**: Member C

```bash
# Switch to develop and update
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/orders-page

# Verify files exist before adding
Test-Path "src/main/resources/public/orders.html"
Test-Path "src/main/resources/public/js/orders.js"
Test-Path "src/main/resources/public/css/components/orders.css"

# Add orders page files
git add src/main/resources/public/orders.html
git add src/main/resources/public/js/orders.js
git add src/main/resources/public/css/components/orders.css

# Verify what will be committed
git status

# Commit changes
git commit -m "feat: implement order history and tracking

This commit creates comprehensive order management interface:

orders.html - Orders Page:
- Filter tabs (All, Pending, Paid, Shipped, Delivered, Cancelled)
- Order cards with item summaries
- Order details modal
- Empty state display
- Pagination controls

orders.js - Orders Page Logic:
- loadOrders(): Fetch all user orders
- handleStatusFilter(): Filter by status
- renderOrderList(): Display order cards
- handleViewDetails(): Show order detail modal
- Order actions (pay, cancel, track, reorder, review)
- Order timeline visualization
- Pagination management
- Date and price formatting

orders.css - Orders Page Styling:
- Filter tabs with badges
- Order card layout
- Color-coded status badges
- Order details modal
- Timeline visualization
- Mobile-optimized layout

Features:
- Complete order history
- Status-based filtering
- Order detail view with timeline
- Multiple order actions
- Real-time status updates
- Responsive design
- Pagination
- Empty state handling"

# Push to remote
git push origin feature/orders-page

# Switch back to develop
git checkout develop

# Merge feature branch
git merge --no-ff feature/orders-page -m "Merge branch 'feature/orders-page' into develop"

# Push to remote
git push origin develop

# Delete local feature branch
git branch -d feature/orders-page

# Delete remote feature branch
git push origin --delete feature/orders-page
```

---

#### Commit 16: User Profile Page

**Branch**: `feature/profile-page`  
**Base**: `develop`  
**Owner**: Member C

```bash
# Switch to develop and update
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/profile-page

# Verify files exist before adding
Test-Path "src/main/resources/public/profile.html"
Test-Path "src/main/resources/public/js/profile.js"

# Add user profile page files
git add src/main/resources/public/profile.html
git add src/main/resources/public/js/profile.js

# Verify what will be committed
git status

# Commit changes
git commit -m "feat: implement user profile management

This commit adds complete user profile and account management:

profile.html - Profile Page:
- Sidebar navigation (Profile, Addresses, Password, Settings)
- Profile information section with avatar upload
- Address management section
- Change password section
- Account settings section
- Mobile-responsive tabs

profile.js - Profile Page Logic:
- loadUserProfile(): Fetch and display user data
- handleSaveProfile(): Update user information
- Avatar upload with validation
- Address management (add, edit, delete, set default)
- handleChangePassword(): Secure password update
- Notification settings management
- Account data export
- Account deletion with confirmation
- Tab navigation with URL sync
- Form validation for all sections

Features:
- Complete profile management
- Avatar upload and display
- Multiple address management
- Secure password change
- Notification preferences
- Account data export
- Account deletion option
- Form validation with feedback
- Responsive design
- Tab-based navigation"

# Push to remote
git push origin feature/profile-page

# Switch back to develop
git checkout develop

# Merge feature branch
git merge --no-ff feature/profile-page -m "Merge branch 'feature/profile-page' into develop"

# Push to remote
git push origin develop

# Delete local feature branch
git branch -d feature/profile-page

# Delete remote feature branch
git push origin --delete feature/profile-page
```

---

### Phase 7: Documentation and Release

#### Commit 17: Project Documentation

**Branch**: `feature/documentation`  
**Base**: `develop`  
**Owner**: Member A

```bash
# Switch to develop and update
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/documentation

# Verify files exist before adding
Test-Path "README.md"
Test-Path "pom.xml"

# Add documentation files
git add README.md
git add pom.xml

# Verify what will be committed
git status

# Commit changes
git commit -m "docs: add comprehensive project documentation

This commit adds complete project documentation and build configuration:

README.md - Project Documentation:
- Project overview and description
- Technology stack (Spark Java, Bootstrap, jQuery)
- Project structure with directory tree
- Setup and installation instructions
- API documentation with all endpoints
- Features list
- Test accounts
- Development notes
- Future enhancements roadmap
- Contributing guidelines
- License information

pom.xml - Maven Configuration:
- Project metadata (groupId, artifactId, version)
- Java 11 configuration
- Dependencies (Spark Core, Gson, SLF4J)
- Build plugins (compiler, exec, jar)
- Resource filtering
- Execution configuration

Documentation features:
- Comprehensive README covering all aspects
- Clear setup instructions
- Complete API reference
- Code examples
- Troubleshooting section
- Feature checklist
- Development roadmap
- Professional formatting"

# Push to remote
git push origin feature/documentation

# Switch back to develop
git checkout develop

# Merge feature branch
git merge --no-ff feature/documentation -m "Merge branch 'feature/documentation' into develop"

# Push to remote
git push origin develop

# Delete local feature branch
git branch -d feature/documentation

# Delete remote feature branch
git push origin --delete feature/documentation
```

---

### Phase 8: Official Release

#### Release v1.0.0

**Owner**: Member A

```bash
# Switch to develop and update
git checkout develop
git pull origin develop

# Create release branch
git checkout -b release/v1.0.0

# Perform final testing and bug fixes if needed
# If bugs found, commit fixes directly to release branch
# Example: git commit -m "fix: correct checkout validation logic"

# Merge to main
git checkout main
git pull origin main
git merge --no-ff release/v1.0.0 -m "Release: v1.0.0 - Furniture E-commerce Platform Official Launch

This is the official v1.0.0 release of the Furniture E-commerce Platform.

Complete feature set:
- Product browsing with advanced filtering
- User authentication and profile management
- Shopping cart with real-time updates
- Order placement and tracking
- Responsive design for all devices
- RESTful API backend
- JSON-based data persistence

Technology stack:
- Backend: Spark Java, Gson
- Frontend: Bootstrap 5, jQuery, Vanilla JS
- Storage: JSON files

Team: Member A (Lead), Member B (Frontend), Member C (Full-stack)
Development period: [Start Date] - December 21, 2025
Total commits: 17 feature branches + documentation"

# Create version tag
git tag -a v1.0.0 -m "Version 1.0.0 - Official Release

Furniture E-commerce Platform v1.0.0

Features:
- ✅ Product catalog with search and filters
- ✅ User registration and authentication
- ✅ Shopping cart management
- ✅ Order creation and history
- ✅ User profile and address management
- ✅ Responsive UI design
- ✅ RESTful API architecture

Endpoints: 20+ API endpoints
Pages: 9 frontend pages
Controllers: 4 backend controllers
Data Managers: 5 data access layers

Test Accounts:
- Username: zhangsan, Password: 123456
- Username: lisi, Password: 123456

Known Limitations:
- JSON file-based storage (not suitable for production scale)
- Simple token authentication (use JWT for production)
- Plain text passwords (implement encryption for production)
- No payment gateway integration

Future Roadmap:
- Database integration
- Enhanced security
- Admin dashboard
- Payment integration
- Product reviews
- Real-time notifications"

# Push to remote with tags
git push origin main
git push origin --tags

# Merge back to develop
git checkout develop
git merge --no-ff release/v1.0.0 -m "Merge branch 'release/v1.0.0' into develop"
git push origin develop

# Delete local release branch
git branch -d release/v1.0.0

# Delete remote release branch
git push origin --delete release/v1.0.0

# 🎉 Project officially released!
echo "✅ Version 1.0.0 released successfully!"
echo "📦 Tagged as v1.0.0"
echo "🚀 Deployed to main branch"
echo "🔄 Synced back to develop"
```

---

## 📊 Commit Statistics

| Member | Commits | Main Responsibilities |
|--------|---------|----------------------|
| A | 7 commits | Core architecture, API wrapper, code review |
| B | 6 commits | Cart API, homepage, product pages |
| C | 6 commits | Order API, auth pages, order pages, styles |

---

## 🔍 Best Practices

### 1. Branch Naming Conventions
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `hotfix/*` - Emergency fixes
- `release/*` - Release branches

### 2. Commit Message Format
```
<type>: <subject>

<body>

<footer>
```

**Type Options**:
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation updates
- `style` - Code formatting (no functional changes)
- `refactor` - Code refactoring
- `test` - Test-related changes
- `chore` - Build process or tooling changes

### 3. Merge Workflow
1. Member completes development on feature branch and pushes
2. Member switches to develop branch
3. Member merges feature branch into develop
4. Member pushes merged develop branch
5. Member deletes feature branch (local and remote)

### 4. Code Review Checklist
- [ ] Code follows project conventions
- [ ] Features implemented completely
- [ ] No obvious bugs
- [ ] Clear and sufficient comments
- [ ] No merge conflicts
- [ ] All tests pass

---

## 🚀 Quick Command Reference

```bash
# View all branches
git branch -a

# View commit history (graphical)
git log --graph --oneline --all --decorate

# View file commit history
git log --follow -- <filename>

# Undo uncommitted changes
git checkout -- <filename>

# View remote repository status
git remote -v

# Sync remote branches
git fetch origin

# Delete merged local branches
git branch --merged | grep -v "\*" | xargs -n 1 git branch -d
```

---

## ✅ Project Completion Checklist

- [x] All model classes committed
- [x] Bootstrap and jQuery integrated
- [x] Base CSS committed
- [ ] Data storage layer
- [ ] Backend API endpoints
- [ ] Frontend utilities
- [ ] UI component styles
- [ ] All page functionality
- [ ] Project documentation
- [ ] Official release

---

## 🛠️ Troubleshooting

### Issue: "pathspec did not match any files"

**Cause**: You're either:
1. Not in the correct project directory
2. The files don't exist yet
3. The file paths in the command don't match your actual structure

**Solution**:
```bash
# 1. Verify current directory
pwd
Get-Location

# 2. Check if src folder exists
Test-Path "src/main/java"

# 3. List what files actually exist
Get-ChildItem -Recurse src/

# 4. Navigate to correct directory if needed
cd "d:\programming\projects\frontend_project\新建文件夹"

# 5. Verify files exist before git add
Test-Path "src/main/java/com/furniture/data/DataStore.java"
```

### Issue: "nothing added to commit"

**Cause**: No files were staged because they don't exist or paths are wrong.

**Solution**:
```bash
# Check what files are available to commit
git status

# Only add files that actually exist
git add <actual-file-path>

# Or add all untracked files (be careful)
git add .
```

### Issue: Working in wrong project directory

**Your actual project structure**:
```
D:\programming\projects\frontend_project\
├── 新建文件夹\          ← Your actual project source
│   ├── src/
│   ├── target/
│   └── README.md
└── ecommerce\           ← Might be Git repository location
```

**Solution**:
```bash
# Make sure you're in the directory with src/ folder
cd "D:\programming\projects\frontend_project\新建文件夹"

# Verify
Test-Path "src/main/java/com/furniture"

# Then run git commands
```

### How to adapt this workflow to your structure

If your files are already created in "新建文件夹", do this:

```bash
# 1. Navigate to your project
cd "d:\programming\projects\frontend_project\新建文件夹"

# 2. Initialize git if not done
git init
git branch -M main

# 3. Add your existing files
git add src/main/java/com/furniture/data/
git add src/main/resources/data/

# 4. Check what will be committed
git status

# 5. Commit
git commit -m "feat: add data storage layer and managers"

# 6. Continue with workflow
```

### Alternative: Use wildcard patterns

Instead of adding files one by one:

```bash
# Add all Java data layer files
git add src/main/java/com/furniture/data/*.java

# Add all JSON files
git add src/main/resources/data/*.json

# Add all controller files
git add src/main/java/com/furniture/controller/*.java
```

---

**Created by Team ABC** 🎉  
**Project**: Furniture E-commerce Platform  
**Date**: December 21, 2025
