package com.furniture.model;

/**
 * 商品实体类
 */
public class Product {
    private String id;
    private String name;
    private String description;
    private double price;
    private double discount; // 折扣率 0-1, 例如 0.2 表示 20% 折扣
    private String category;
    private String imageUrl;
    private int stock;
    private String material;
    private String dimensions;
    private double rating;
    private int reviewCount;

    public Product() {}

    public Product(String id, String name, String description, double price, 
                   String category, String imageUrl, int stock, String material, 
                   String dimensions, double rating, int reviewCount) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.price = price;
        this.category = category;
        this.imageUrl = imageUrl;
        this.stock = stock;
        this.material = material;
        this.dimensions = dimensions;
        this.rating = rating;
        this.reviewCount = reviewCount;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public int getStock() { return stock; }
    public void setStock(int stock) { this.stock = stock; }

    public String getMaterial() { return material; }
    public void setMaterial(String material) { this.material = material; }

    public String getDimensions() { return dimensions; }
    public void setDimensions(String dimensions) { this.dimensions = dimensions; }

    public double getRating() { return rating; }
    public void setRating(double rating) { this.rating = rating; }

    public int getReviewCount() { return reviewCount; }
    public void setReviewCount(int reviewCount) { this.reviewCount = reviewCount; }

    public double getDiscount() { return discount; }
    public void setDiscount(double discount) { this.discount = discount; }

    // 获取折后价
    public double getDiscountedPrice() {
        return price * (1 - discount);
    }
}
