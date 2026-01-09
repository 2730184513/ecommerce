package com.furniture.data;

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
import java.util.stream.Collectors;

/**
 * Product Data Manager
 */
public class ProductManager {
    private final Gson gson;
    private final String dataPath;
    private List<Product> products;

    public ProductManager(String dataPath) {
        this.gson = new GsonBuilder().setPrettyPrinting().create();
        this.dataPath = dataPath;
        loadProducts();
    }

    private void loadProducts() {
        try {
            String json = new String(Files.readAllBytes(Paths.get(dataPath + "products.json")), StandardCharsets.UTF_8);
            Type type = new TypeToken<Map<String, List<Product>>>(){}.getType();
            Map<String, List<Product>> data = gson.fromJson(json, type);
            this.products = data != null && data.get("products") != null ? data.get("products") : new ArrayList<>();
        } catch (Exception e) {
            this.products = new ArrayList<>();
            System.err.println("Failed to load product data: " + e.getMessage());
        }
    }

    public void saveProducts() {
        try {
            Map<String, List<Product>> data = new HashMap<>();
            data.put("products", products);
            Files.write(Paths.get(dataPath + "products.json"), gson.toJson(data).getBytes(StandardCharsets.UTF_8));
        } catch (IOException e) {
            System.err.println("Failed to save product data: " + e.getMessage());
        }
    }

    public List<Product> getAllProducts() {
        return new ArrayList<>(products);
    }

    public Product getProductById(String id) {
        return products.stream()
                .filter(p -> p.getId().equals(id))
                .findFirst()
                .orElse(null);
    }

    public List<Product> searchProducts(String keyword, String category, 
                                         Double minPrice, Double maxPrice, String sortBy) {
        List<Product> result = products.stream()
                .filter(p -> {
                    boolean match = true;
                    if (keyword != null && !keyword.isEmpty()) {
                        match = p.getName().toLowerCase().contains(keyword.toLowerCase()) ||
                                p.getDescription().toLowerCase().contains(keyword.toLowerCase());
                    }
                    if (category != null && !category.isEmpty()) {
                        match = match && p.getCategory().equals(category);
                    }
                    if (minPrice != null) {
                        match = match && p.getPrice() >= minPrice;
                    }
                    if (maxPrice != null) {
                        match = match && p.getPrice() <= maxPrice;
                    }
                    return match;
                })
                .collect(Collectors.toList());

        // Sort
        if (sortBy != null) {
            switch (sortBy) {
                case "price_asc":
                    result.sort(Comparator.comparingDouble(Product::getPrice));
                    break;
                case "price_desc":
                    result.sort(Comparator.comparingDouble(Product::getPrice).reversed());
                    break;
                case "rating":
                    result.sort(Comparator.comparingDouble(Product::getRating).reversed());
                    break;
                case "sales":
                    result.sort(Comparator.comparingInt(Product::getReviewCount).reversed());
                    break;
            }
        }
        return result;
    }

    public List<String> getAllCategories() {
        return products.stream()
                .map(Product::getCategory)
                .distinct()
                .sorted()
                .collect(Collectors.toList());
    }

    public boolean updateStock(String productId, int quantityToReduce) {
        Product product = getProductById(productId);
        if (product == null) {
	        return false;
        }
        
        int newStock = product.getStock() - quantityToReduce;
        if (newStock < 0) {
	        return false;
        }
        
        product.setStock(newStock);
        saveProducts();
        return true;
    }

    public boolean checkStock(String productId, int quantity) {
        Product product = getProductById(productId);
        return product != null && product.getStock() >= quantity;
    }
}
