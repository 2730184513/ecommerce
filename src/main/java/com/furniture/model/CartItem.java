package com.furniture.model;

/**
 * Shopping cart item entity class
 */
public class CartItem {
    private String productId;
    private String productName;
    private double price;        // original price
    private double discount;     // Discount rate
    private int quantity;
    private String imageUrl;
    private int stock;           // Stock

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

    // Get the discounted unit price
    public double getDiscountedPrice() {
        return price * (1 - discount);
    }

    public double getSubtotal() {
        return price * quantity;
    }

    // Get the subtotal after the discount
    public double getDiscountedSubtotal() {
        return getDiscountedPrice() * quantity;
    }

    // Get the amount saved
    public double getSavings() {
        return getSubtotal() - getDiscountedSubtotal();
    }
}
