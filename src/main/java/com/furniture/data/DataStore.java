package com.furniture.data;

import com.furniture.model.*;

import java.io.File;
import java.util.List;

/**
 * Data storage class - Unified data access portal
 * Hold and coordinate ProductManager, UserManager, CartManager, and OrderManager
 */
public class DataStore {
    private static DataStore instance;
    private final String dataPath;
    
    private final ProductManager productManager;
    private final UserManager userManager;
    private final CartManager cartManager;
    private final OrderManager orderManager;

    private DataStore() {
        this.dataPath = getDataPath();
        
        // Initialize the individual managers
        this.productManager = new ProductManager(dataPath);
        this.userManager = new UserManager(dataPath);
        this.cartManager = new CartManager(dataPath, productManager);
        this.orderManager = new OrderManager(dataPath, productManager, cartManager);
    }

    public static synchronized DataStore getInstance() {
        if (instance == null) {
            instance = new DataStore();
        }
        return instance;
    }

    private String getDataPath() {
        String path = System.getProperty("user.dir") + "/src/main/resources/data/";
        File dir = new File(path);
        if (!dir.exists()) {
            dir.mkdirs();
        }
        return path;
    }

    // Actions related to the product

    public List<Product> getAllProducts() {
        return productManager.getAllProducts();
    }

    public Product getProductById(String id) {
        return productManager.getProductById(id);
    }

    public List<Product> searchProducts(String keyword, String category, 
                                         Double minPrice, Double maxPrice, String sortBy) {
        return productManager.searchProducts(keyword, category, minPrice, maxPrice, sortBy);
    }

    public List<String> getAllCategories() {
        return productManager.getAllCategories();
    }

    public boolean updateProductStock(String productId, int quantityToReduce) {
        return productManager.updateStock(productId, quantityToReduce);
    }

    public boolean checkStock(String productId, int quantity) {
        return productManager.checkStock(productId, quantity);
    }

    // User-related actions

    public User getUserById(String id) {
        return userManager.getUserById(id);
    }

    public User getUserByUsername(String username) {
        return userManager.getUserByUsername(username);
    }

    public User login(String username, String password) {
        return userManager.login(username, password);
    }

    public User register(User newUser) {
        return userManager.register(newUser);
    }

    public void updateUser(User user) {
        userManager.updateUser(user);
    }

    // Address management
    public List<Address> getAddresses(String userId) {
        return userManager.getAddresses(userId);
    }

    public Address addAddress(String userId, Address address) {
        return userManager.addAddress(userId, address);
    }

    public boolean removeAddress(String userId, String addressId) {
        return userManager.removeAddress(userId, addressId);
    }

    public boolean setDefaultAddress(String userId, String addressId) {
        return userManager.setDefaultAddress(userId, addressId);
    }

    // Shopping cart-related actions

    public List<CartItem> getCart(String userId) {
        return cartManager.getCart(userId);
    }

    public boolean addToCart(String userId, CartItem item) {
        return cartManager.addToCart(userId, item.getProductId(), item.getQuantity());
    }

    public boolean updateCartItem(String userId, String productId, int quantity) {
        return cartManager.updateCartItem(userId, productId, quantity);
    }

    public boolean removeFromCart(String userId, String productId) {
        return cartManager.removeFromCart(userId, productId);
    }

    public boolean clearCart(String userId) {
        return cartManager.clearCart(userId);
    }

    public double getCartTotal(String userId) {
        return cartManager.getCartTotal(userId);
    }

    // Order-related operations

    public Order createOrder(Order order) {
        return orderManager.createOrder(order);
    }

    public List<Order> getOrdersByUserId(String userId) {
        return orderManager.getOrdersByUserId(userId);
    }

    public Order getOrderById(String orderId) {
        return orderManager.getOrderById(orderId);
    }
}
