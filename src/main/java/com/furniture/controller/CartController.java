package com.furniture.controller;

import com.furniture.data.DataStore;
import com.furniture.model.*;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import java.util.List;
import java.util.Map;

import static spark.Spark.*;

/**
 * Shopping Cart API Controller
 */
public class CartController {
    private final DataStore dataStore;
    private final Gson gson;

    public CartController() {
        this.dataStore = DataStore.getInstance();
        this.gson = new GsonBuilder().create();
    }

    public void registerRoutes() {
        // Get shopping cart
        get("/api/cart", (req, res) -> {
            res.type("application/json");
            String userId = UserController.getCurrentUserId(req.headers("Authorization"));
            if (userId == null) {
                res.status(401);
                return gson.toJson(ApiResponse.error("Please log in first"));
            }
            
            List<CartItem> cart = dataStore.getCart(userId);
            // Calculate total using DataStore (taking into account discounts)
            double total = dataStore.getCartTotal(userId);
            
            CartResponse response = new CartResponse(cart, total);
            return gson.toJson(ApiResponse.success(response));
        });

        // Add items to cart
        post("/api/cart", (req, res) -> {
            res.type("application/json");
            String userId = UserController.getCurrentUserId(req.headers("Authorization"));
            if (userId == null) {
                res.status(401);
                return gson.toJson(ApiResponse.error("Please log in first"));
            }
            
            CartItem item = gson.fromJson(req.body(), CartItem.class);
            if (item.getProductId() == null || item.getQuantity() <= 0) {
                res.status(400);
                return gson.toJson(ApiResponse.error("Incorrect parameters"));
            }
            
            boolean success = dataStore.addToCart(userId, item);
            if (success) {
                return gson.toJson(ApiResponse.success("Add successfully", dataStore.getCart(userId)));
            } else {
                res.status(400);
                return gson.toJson(ApiResponse.error("Failed to add"));
            }
        });

        // Update the cart quantity
        put("/api/cart/:productId", (req, res) -> {
            res.type("application/json");
            String userId = UserController.getCurrentUserId(req.headers("Authorization"));
            if (userId == null) {
                res.status(401);
                return gson.toJson(ApiResponse.error("Please log in first"));
            }
            
            String productId = req.params(":productId");
            Map<String, Double> body = gson.fromJson(req.body(), Map.class);
            int quantity = body.get("quantity").intValue();
            
            boolean success = dataStore.updateCartItem(userId, productId, quantity);
            if (success) {
                return gson.toJson(ApiResponse.success("The update was successful", dataStore.getCart(userId)));
            } else {
                res.status(400);
                return gson.toJson(ApiResponse.error("Update failed"));
            }
        });

        // Delete cart items
        delete("/api/cart/:productId", (req, res) -> {
            res.type("application/json");
            String userId = UserController.getCurrentUserId(req.headers("Authorization"));
            if (userId == null) {
                res.status(401);
                return gson.toJson(ApiResponse.error("Please log in first"));
            }
            
            String productId = req.params(":productId");
            boolean success = dataStore.removeFromCart(userId, productId);
            if (success) {
                return gson.toJson(ApiResponse.success("Delete successful", dataStore.getCart(userId)));
            } else {
                res.status(400);
                return gson.toJson(ApiResponse.error("Delete failed"));
            }
        });

        // Empty your cart
        delete("/api/cart", (req, res) -> {
            res.type("application/json");
            String userId = UserController.getCurrentUserId(req.headers("Authorization"));
            if (userId == null) {
                res.status(401);
                return gson.toJson(ApiResponse.error("Please log in first"));
            }
            
            dataStore.clearCart(userId);
            return gson.toJson(ApiResponse.success("Emptying successfully", null));
        });
    }

    // Shopping cart response packaging
    private static class CartResponse {
        private List<CartItem> items;
        private double total;

        public CartResponse(List<CartItem> items, double total) {
            this.items = items;
            this.total = total;
        }
    }
}
