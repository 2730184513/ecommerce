package com.furniture.model;

/**
 * 购物车项实体类
 */
public class CartItem {
    private String productId;
    private String productName;
    private double price;        // 原价
    private double discount;     // 折扣率
    private int quantity;
    private String imageUrl;
    private int stock;           // 库存

    public CartItem() {}

    public CartItem(String productId, String productName, double price, double discount, 
                    int quantity, String imageUrl, int stock) {
        this.productId = productId;
        this.productName = productName;
        this.price = price;
        this.discount = discount;
        this.quantity = quantity;
        this.imageUrl = imageUrl;
        this.stock = stock;
    }

    // Getters and Setters
    public String getProductId() { return productId; }
    public void setProductId(String productId) { this.productId = productId; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public double getDiscount() { return discount; }
    public void setDiscount(double discount) { this.discount = discount; }

    public int getStock() { return stock; }
    public void setStock(int stock) { this.stock = stock; }

    // 获取折后单价
    public double getDiscountedPrice() {
        return price * (1 - discount);
    }

    public double getSubtotal() {
        return price * quantity;
    }

    // 获取折后小计
    public double getDiscountedSubtotal() {
        return getDiscountedPrice() * quantity;
    }

    // 获取节省金额
    public double getSavings() {
        return getSubtotal() - getDiscountedSubtotal();
    }
}
