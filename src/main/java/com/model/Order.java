package com.furniture.model;

import java.util.List;

/**
 * 订单实体类
 */
public class Order {
    private String id;
    private String userId;
    private List<CartItem> items;
    private double totalAmount;       // 折后总价
    private double originalTotal;     // 原价总额
    private double discountTotal;     // 折扣总额
    private String status;
    private String shippingAddress;
    private String paymentMethod;
    private String createdAt;
    private String contactName;
    private String contactPhone;

    public Order() {}

    public Order(String id, String userId, List<CartItem> items, double totalAmount,
                 String status, String shippingAddress, String paymentMethod, 
                 String createdAt, String contactName, String contactPhone) {
        this.id = id;
        this.userId = userId;
        this.items = items;
        this.totalAmount = totalAmount;
        this.status = status;
        this.shippingAddress = shippingAddress;
        this.paymentMethod = paymentMethod;
        this.createdAt = createdAt;
        this.contactName = contactName;
        this.contactPhone = contactPhone;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public List<CartItem> getItems() { return items; }
    public void setItems(List<CartItem> items) { this.items = items; }

    public double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(double totalAmount) { this.totalAmount = totalAmount; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getShippingAddress() { return shippingAddress; }
    public void setShippingAddress(String shippingAddress) { this.shippingAddress = shippingAddress; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getContactName() { return contactName; }
    public void setContactName(String contactName) { this.contactName = contactName; }

    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }

    public double getOriginalTotal() { return originalTotal; }
    public void setOriginalTotal(double originalTotal) { this.originalTotal = originalTotal; }

    public double getDiscountTotal() { return discountTotal; }
    public void setDiscountTotal(double discountTotal) { this.discountTotal = discountTotal; }
}
