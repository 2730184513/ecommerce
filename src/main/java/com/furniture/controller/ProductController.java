package com.furniture.controller;

import com.furniture.data.DataStore;
import com.furniture.model.*;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import static spark.Spark.*;

/**
 * Product API controller
 */
public class ProductController {
    private final DataStore dataStore;
    private final Gson gson;

    public ProductController() {
        this.dataStore = DataStore.getInstance();
        this.gson = new GsonBuilder().create();
    }

    public void registerRoutes() {
        // Get all the goods
        get("/api/products", (req, res) -> {
            res.type("application/json");
            String keyword = req.queryParams("keyword");
            String category = req.queryParams("category");
            String minPriceStr = req.queryParams("minPrice");
            String maxPriceStr = req.queryParams("maxPrice");
            String sortBy = req.queryParams("sortBy");

            Double minPrice = minPriceStr != null ? Double.parseDouble(minPriceStr) : null;
            Double maxPrice = maxPriceStr != null ? Double.parseDouble(maxPriceStr) : null;

            return gson.toJson(ApiResponse.success(
                    dataStore.searchProducts(keyword, category, minPrice, maxPrice, sortBy)
            ));
        });

        // Get individual product listings
        get("/api/products/:id", (req, res) -> {
            res.type("application/json");
            String id = req.params(":id");
            Product product = dataStore.getProductById(id);
            if (product != null) {
                return gson.toJson(ApiResponse.success(product));
            } else {
                res.status(404);
                return gson.toJson(ApiResponse.error("The product does not exist"));
            }
        });

        // Get all categories
        get("/api/categories", (req, res) -> {
            res.type("application/json");
            return gson.toJson(ApiResponse.success(dataStore.getAllCategories()));
        });
    }
}
