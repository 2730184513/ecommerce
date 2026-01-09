package com.furniture.controller;

import com.furniture.data.DataStore;
import com.furniture.model.*;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import java.util.List;

import static spark.Spark.*;

/**
 * Order API controller
 */
public class OrderController {
    private final DataStore dataStore;
    private final Gson gson;

    public OrderController() {
        this.dataStore = DataStore.getInstance();
        this.gson = new GsonBuilder().create();
    }

    public void registerRoutes() {
        // Create Order (Checkout) - Support selective billing
        post("/api/orders", (req, res) -> {
            res.type("application/json");
            String userId = UserController.getCurrentUserId(req.headers("Authorization"));
            if (userId == null) {
                res.status(401);
                return gson.toJson(ApiResponse.error("Please log in first"));
            }
            
            // Parse order information
            Order orderInfo = gson.fromJson(req.body(), Order.class);
            if (orderInfo.getShippingAddress() == null || orderInfo.getShippingAddress().isEmpty()) {
                res.status(400);
                return gson.toJson(ApiResponse.error("Please fill in the delivery address"));
            }
            
            // Get the item you want to settle (selected product from the front end)
            List<CartItem> selectedItems = orderInfo.getItems();
            if (selectedItems == null || selectedItems.isEmpty()) {
                // If not specified, the entire cart is settled
                selectedItems = dataStore.getCart(userId);
            }
            
            if (selectedItems.isEmpty()) {
                res.status(400);
                return gson.toJson(ApiResponse.error("Select the product you want to settle"));
            }
            
            // Check inventory
            for (CartItem item : selectedItems) {
                if (!dataStore.checkStock(item.getProductId(), item.getQuantity())) {
                    Product p = dataStore.getProductById(item.getProductId());
                    String stockInfo = p != null ? "(Stock: " + p.getStock() + ")" : "";
                    res.status(400);
                    return gson.toJson(ApiResponse.error("Goods " + item.getProductName() + " Insufficient stock" + stockInfo));
                }
            }
            
            // Create an order
            Order order = new Order();
            order.setUserId(userId);
            order.setItems(selectedItems);
            order.setShippingAddress(orderInfo.getShippingAddress());
            order.setPaymentMethod(orderInfo.getPaymentMethod() != null ? orderInfo.getPaymentMethod() : "Online payment");
            order.setContactName(orderInfo.getContactName());
            order.setContactPhone(orderInfo.getContactPhone());
            
            Order createdOrder = dataStore.createOrder(order);
            
            // Remove checked items from your cart
            for (CartItem item : selectedItems) {
                dataStore.removeFromCart(userId, item.getProductId());
            }
            
            return gson.toJson(ApiResponse.success("The order was successfully created", createdOrder));
        });

        // Get all orders from users
        get("/api/orders", (req, res) -> {
            res.type("application/json");
            String userId = UserController.getCurrentUserId(req.headers("Authorization"));
            if (userId == null) {
                res.status(401);
                return gson.toJson(ApiResponse.error("Please log in first"));
            }
            
            List<Order> orders = dataStore.getOrdersByUserId(userId);
            return gson.toJson(ApiResponse.success(orders));
        });

        // Get your order details
        get("/api/orders/:id", (req, res) -> {
            res.type("application/json");
            String userId = UserController.getCurrentUserId(req.headers("Authorization"));
            if (userId == null) {
                res.status(401);
                return gson.toJson(ApiResponse.error("Please log in first"));
            }
            
            String orderId = req.params(":id");
            Order order = dataStore.getOrderById(orderId);
            
            if (order == null) {
                res.status(404);
                return gson.toJson(ApiResponse.error("The order does not exist"));
            }
            
            // Verify the user to whom the order belongs
            if (!order.getUserId().equals(userId)) {
                res.status(403);
                return gson.toJson(ApiResponse.error("No access to view this order"));
            }
            
            return gson.toJson(ApiResponse.success(order));
        });
        
        // Check inventory
        post("/api/cart/check-stock", (req, res) -> {
            res.type("application/json");
            String userId = UserController.getCurrentUserId(req.headers("Authorization"));
            if (userId == null) {
                res.status(401);
                return gson.toJson(ApiResponse.error("Please log in first"));
            }
            
            // Parse the list of products to check
            CartItem[] items = gson.fromJson(req.body(), CartItem[].class);
            if (items == null || items.length == 0) {
                res.status(400);
                return gson.toJson(ApiResponse.error("Please provide the product to be checked"));
            }
            
            StringBuilder errorMsg = new StringBuilder();
            boolean hasError = false;
            
            for (CartItem item : items) {
                if (!dataStore.checkStock(item.getProductId(), item.getQuantity())) {
                    hasError = true;
                    Product p = dataStore.getProductById(item.getProductId());
                    if (p != null) {
                        errorMsg.append(item.getProductName())
                                .append(" Insufficient Inventory (Current Stock: ")
                                .append(p.getStock())
                                .append(", need: ")
                                .append(item.getQuantity())
                                .append(")\n");
                    }
                }
            }
            
            if (hasError) {
                res.status(400);
                return gson.toJson(ApiResponse.error(errorMsg.toString().trim()));
            }
            
            return gson.toJson(ApiResponse.success("Sufficient inventory"));
        });
    }
}
