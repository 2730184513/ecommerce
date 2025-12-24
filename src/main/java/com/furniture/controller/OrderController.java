package com.furniture.controller;

import com.furniture.data.DataStore;
import com.furniture.model.*;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import java.util.List;

import static spark.Spark.*;

/**
 * 订单API控制器
 */
public class OrderController {
    private final DataStore dataStore;
    private final Gson gson;

    public OrderController() {
        this.dataStore = DataStore.getInstance();
        this.gson = new GsonBuilder().create();
    }

    public void registerRoutes() {
        // 创建订单（结账）- 支持选择性结算
        post("/api/orders", (req, res) -> {
            res.type("application/json");
            String userId = UserController.getCurrentUserId(req.headers("Authorization"));
            if (userId == null) {
                res.status(401);
                return gson.toJson(ApiResponse.error("请先登录"));
            }
            
            // 解析订单信息
            Order orderInfo = gson.fromJson(req.body(), Order.class);
            if (orderInfo.getShippingAddress() == null || orderInfo.getShippingAddress().isEmpty()) {
                res.status(400);
                return gson.toJson(ApiResponse.error("请填写收货地址"));
            }
            
            // 获取要结算的商品（前端传来的选中商品）
            List<CartItem> selectedItems = orderInfo.getItems();
            if (selectedItems == null || selectedItems.isEmpty()) {
                // 如果没有指定，则结算全部购物车
                selectedItems = dataStore.getCart(userId);
            }
            
            if (selectedItems.isEmpty()) {
                res.status(400);
                return gson.toJson(ApiResponse.error("请选择要结算的商品"));
            }
            
            // 检查库存
            for (CartItem item : selectedItems) {
                if (!dataStore.checkStock(item.getProductId(), item.getQuantity())) {
                    Product p = dataStore.getProductById(item.getProductId());
                    String stockInfo = p != null ? "（库存: " + p.getStock() + "）" : "";
                    res.status(400);
                    return gson.toJson(ApiResponse.error("商品 " + item.getProductName() + " 库存不足" + stockInfo));
                }
            }
            
            // 创建订单
            Order order = new Order();
            order.setUserId(userId);
            order.setItems(selectedItems);
            order.setShippingAddress(orderInfo.getShippingAddress());
            order.setPaymentMethod(orderInfo.getPaymentMethod() != null ? orderInfo.getPaymentMethod() : "在线支付");
            order.setContactName(orderInfo.getContactName());
            order.setContactPhone(orderInfo.getContactPhone());
            
            Order createdOrder = dataStore.createOrder(order);
            
            // 从购物车中移除已结算的商品
            for (CartItem item : selectedItems) {
                dataStore.removeFromCart(userId, item.getProductId());
            }
            
            return gson.toJson(ApiResponse.success("订单创建成功", createdOrder));
        });

        // 获取用户所有订单
        get("/api/orders", (req, res) -> {
            res.type("application/json");
            String userId = UserController.getCurrentUserId(req.headers("Authorization"));
            if (userId == null) {
                res.status(401);
                return gson.toJson(ApiResponse.error("请先登录"));
            }
            
            List<Order> orders = dataStore.getOrdersByUserId(userId);
            return gson.toJson(ApiResponse.success(orders));
        });

        // 获取订单详情
        get("/api/orders/:id", (req, res) -> {
            res.type("application/json");
            String userId = UserController.getCurrentUserId(req.headers("Authorization"));
            if (userId == null) {
                res.status(401);
                return gson.toJson(ApiResponse.error("请先登录"));
            }
            
            String orderId = req.params(":id");
            Order order = dataStore.getOrderById(orderId);
            
            if (order == null) {
                res.status(404);
                return gson.toJson(ApiResponse.error("订单不存在"));
            }
            
            // 验证订单所属用户
            if (!order.getUserId().equals(userId)) {
                res.status(403);
                return gson.toJson(ApiResponse.error("无权查看此订单"));
            }
            
            return gson.toJson(ApiResponse.success(order));
        });
        
        // 检查库存
        post("/api/cart/check-stock", (req, res) -> {
            res.type("application/json");
            String userId = UserController.getCurrentUserId(req.headers("Authorization"));
            if (userId == null) {
                res.status(401);
                return gson.toJson(ApiResponse.error("请先登录"));
            }
            
            // 解析要检查的商品列表
            CartItem[] items = gson.fromJson(req.body(), CartItem[].class);
            if (items == null || items.length == 0) {
                res.status(400);
                return gson.toJson(ApiResponse.error("请提供要检查的商品"));
            }
            
            StringBuilder errorMsg = new StringBuilder();
            boolean hasError = false;
            
            for (CartItem item : items) {
                if (!dataStore.checkStock(item.getProductId(), item.getQuantity())) {
                    hasError = true;
                    Product p = dataStore.getProductById(item.getProductId());
                    if (p != null) {
                        errorMsg.append(item.getProductName())
                                .append(" 库存不足（当前库存: ")
                                .append(p.getStock())
                                .append("，需要: ")
                                .append(item.getQuantity())
                                .append("）\n");
                    }
                }
            }
            
            if (hasError) {
                res.status(400);
                return gson.toJson(ApiResponse.error(errorMsg.toString().trim()));
            }
            
            return gson.toJson(ApiResponse.success("库存充足"));
        });
    }
}
