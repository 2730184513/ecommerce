package com.furniture.data;

import com.furniture.model.CartItem;
import com.furniture.model.Product;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.reflect.TypeToken;

import java.io.IOException;
import java.lang.reflect.Type;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.*;

/**
 * 购物车数据管理器
 * 购物车数据独立存储，格式为: { "userId": [CartItem, ...], ... }
 */
public class CartManager {
    private final Gson gson;
    private final String dataPath;
    private Map<String, List<CartItem>> carts;
    private final ProductManager productManager;

    public CartManager(String dataPath, ProductManager productManager) {
        this.gson = new GsonBuilder().setPrettyPrinting().create();
        this.dataPath = dataPath;
        this.productManager = productManager;
        loadCarts();
    }

    private void loadCarts() {
        try {
            String json = new String(Files.readAllBytes(Paths.get(dataPath + "carts.json")), StandardCharsets.UTF_8);
            Type type = new TypeToken<Map<String, List<CartItem>>>(){}.getType();
            this.carts = gson.fromJson(json, type);
            if (this.carts == null) {
                this.carts = new HashMap<>();
            }
        } catch (Exception e) {
            this.carts = new HashMap<>();
            System.err.println("加载购物车数据失败，创建新的购物车存储: " + e.getMessage());
            saveCarts();
        }
    }

    public void saveCarts() {
        try {
            Files.write(Paths.get(dataPath + "carts.json"), gson.toJson(carts).getBytes(StandardCharsets.UTF_8));
        } catch (IOException e) {
            System.err.println("保存购物车数据失败: " + e.getMessage());
        }
    }

    public List<CartItem> getCart(String userId) {
        List<CartItem> cart = carts.get(userId);
        return cart != null ? new ArrayList<>(cart) : new ArrayList<>();
    }

    public boolean addToCart(String userId, String productId, int quantity) {
        // 获取商品信息
        Product product = productManager.getProductById(productId);
        if (product == null) return false;

        List<CartItem> cart = carts.computeIfAbsent(userId, k -> new ArrayList<>());
        
        // 检查商品是否已在购物车中
        for (CartItem item : cart) {
            if (item.getProductId().equals(productId)) {
                // 更新数量
                item.setQuantity(item.getQuantity() + quantity);
                // 同步更新商品信息
                updateCartItemFromProduct(item, product);
                saveCarts();
                return true;
            }
        }
        
        // 添加新商品
        CartItem newItem = new CartItem();
        newItem.setProductId(productId);
        newItem.setQuantity(quantity);
        updateCartItemFromProduct(newItem, product);
        cart.add(newItem);
        saveCarts();
        return true;
    }

    private void updateCartItemFromProduct(CartItem item, Product product) {
        item.setProductName(product.getName());
        item.setPrice(product.getPrice());
        item.setDiscount(product.getDiscount());
        item.setImageUrl(product.getImageUrl());
        item.setStock(product.getStock());
    }

    public boolean updateCartItem(String userId, String productId, int quantity) {
        List<CartItem> cart = carts.get(userId);
        if (cart == null) return false;

        for (CartItem item : cart) {
            if (item.getProductId().equals(productId)) {
                if (quantity <= 0) {
                    cart.remove(item);
                } else {
                    item.setQuantity(quantity);
                }
                saveCarts();
                return true;
            }
        }
        return false;
    }

    public boolean removeFromCart(String userId, String productId) {
        List<CartItem> cart = carts.get(userId);
        if (cart == null) return false;

        boolean removed = cart.removeIf(item -> item.getProductId().equals(productId));
        if (removed) {
            saveCarts();
        }
        return removed;
    }

    public boolean clearCart(String userId) {
        if (carts.containsKey(userId)) {
            carts.put(userId, new ArrayList<>());
            saveCarts();
            return true;
        }
        return false;
    }

    // 清除指定商品（用于订单创建后）
    public void removeItems(String userId, List<CartItem> items) {
        List<CartItem> cart = carts.get(userId);
        if (cart == null) return;

        Set<String> productIdsToRemove = new HashSet<>();
        for (CartItem item : items) {
            productIdsToRemove.add(item.getProductId());
        }

        cart.removeIf(item -> productIdsToRemove.contains(item.getProductId()));
        saveCarts();
    }

    // 计算购物车总额
    public double getCartTotal(String userId) {
        List<CartItem> cart = getCart(userId);
        return cart.stream()
                .mapToDouble(item -> item.getPrice() * (1 - item.getDiscount()) * item.getQuantity())
                .sum();
    }
}
