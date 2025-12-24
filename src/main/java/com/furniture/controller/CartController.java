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
                return gson.toJson(ApiResponse.error("参数错误"));
            }
            
            boolean success = dataStore.addToCart(userId, item);
            if (success) {
                return gson.toJson(ApiResponse.success("添加成功", dataStore.getCart(userId)));
            } else {
                res.status(400);
                return gson.toJson(ApiResponse.error("添加失败"));
            }
        });

        // 更新购物车商品数量
        put("/api/cart/:productId", (req, res) -> {
            res.type("application/json");
            String userId = UserController.getCurrentUserId(req.headers("Authorization"));
            if (userId == null) {
                res.status(401);
                return gson.toJson(ApiResponse.error("请先登录"));
            }
            
            String productId = req.params(":productId");
            Map<String, Double> body = gson.fromJson(req.body(), Map.class);
            int quantity = body.get("quantity").intValue();
            
            boolean success = dataStore.updateCartItem(userId, productId, quantity);
            if (success) {
                return gson.toJson(ApiResponse.success("更新成功", dataStore.getCart(userId)));
            } else {
                res.status(400);
                return gson.toJson(ApiResponse.error("更新失败"));
            }
        });

        // 删除购物车商品
        delete("/api/cart/:productId", (req, res) -> {
            res.type("application/json");
            String userId = UserController.getCurrentUserId(req.headers("Authorization"));
            if (userId == null) {
                res.status(401);
                return gson.toJson(ApiResponse.error("请先登录"));
            }
            
            String productId = req.params(":productId");
            boolean success = dataStore.removeFromCart(userId, productId);
            if (success) {
                return gson.toJson(ApiResponse.success("删除成功", dataStore.getCart(userId)));
            } else {
                res.status(400);
                return gson.toJson(ApiResponse.error("删除失败"));
            }
        });

        // 清空购物车
        delete("/api/cart", (req, res) -> {
            res.type("application/json");
            String userId = UserController.getCurrentUserId(req.headers("Authorization"));
            if (userId == null) {
                res.status(401);
                return gson.toJson(ApiResponse.error("请先登录"));
            }
            
            dataStore.clearCart(userId);
            return gson.toJson(ApiResponse.success("清空成功", null));
        });
    }

    // 购物车响应包装类
    private static class CartResponse {
        private List<CartItem> items;
        private double total;

        public CartResponse(List<CartItem> items, double total) {
            this.items = items;
            this.total = total;
        }
    }
}
