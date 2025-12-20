package com.furniture.data;

import com.furniture.model.CartItem;
import com.furniture.model.Order;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.reflect.TypeToken;

import java.io.IOException;
import java.lang.reflect.Type;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 订单数据管理器
 */
public class OrderManager {
    private final Gson gson;
    private final String dataPath;
    private List<Order> orders;
    private final ProductManager productManager;
    private final CartManager cartManager;

    public OrderManager(String dataPath, ProductManager productManager, CartManager cartManager) {
        this.gson = new GsonBuilder().setPrettyPrinting().create();
        this.dataPath = dataPath;
        this.productManager = productManager;
        this.cartManager = cartManager;
        loadOrders();
    }

    private void loadOrders() {
        try {
            String json = new String(Files.readAllBytes(Paths.get(dataPath + "orders.json")), StandardCharsets.UTF_8);
            Type type = new TypeToken<Map<String, List<Order>>>(){}.getType();
            Map<String, List<Order>> data = gson.fromJson(json, type);
            this.orders = data != null && data.get("orders") != null ? data.get("orders") : new ArrayList<>();
        } catch (Exception e) {
            this.orders = new ArrayList<>();
            System.err.println("加载订单数据失败: " + e.getMessage());
        }
    }

    public void saveOrders() {
        try {
            Map<String, List<Order>> data = new HashMap<>();
            data.put("orders", orders);
            Files.write(Paths.get(dataPath + "orders.json"), gson.toJson(data).getBytes(StandardCharsets.UTF_8));
        } catch (IOException e) {
            System.err.println("保存订单数据失败: " + e.getMessage());
        }
    }

    public Order createOrder(Order order) {
        // 生成订单ID
        String orderId = "ORD" + System.currentTimeMillis();
        order.setId(orderId);
        order.setStatus("待支付");
        order.setCreatedAt(java.time.LocalDateTime.now().toString().replace("T", " ").substring(0, 19));
        
        // 计算总金额（折后）
        double total = order.getItems().stream()
                .mapToDouble(item -> item.getPrice() * (1 - item.getDiscount()) * item.getQuantity())
                .sum();
        order.setTotalAmount(total);
        
        // 计算原价总额和折扣总额
        double originalTotal = order.getItems().stream()
                .mapToDouble(item -> item.getPrice() * item.getQuantity())
                .sum();
        order.setOriginalTotal(originalTotal);
        order.setDiscountTotal(originalTotal - total);
        
        // 减少库存
        for (CartItem item : order.getItems()) {
            productManager.updateStock(item.getProductId(), item.getQuantity());
        }
        
        orders.add(order);
        saveOrders();
        
        // 从购物车中移除已购买的商品
        cartManager.removeItems(order.getUserId(), order.getItems());
        
        return order;
    }

    public List<Order> getOrdersByUserId(String userId) {
        return orders.stream()
                .filter(o -> o.getUserId().equals(userId))
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .collect(Collectors.toList());
    }

    public Order getOrderById(String orderId) {
        return orders.stream()
                .filter(o -> o.getId().equals(orderId))
                .findFirst()
                .orElse(null);
    }
}
