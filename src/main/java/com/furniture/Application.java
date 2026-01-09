package com.furniture;

import com.furniture.controller.*;
import static spark.Spark.*;

/**
 * Main application entry
 */
public class Application {
    public static void main(String[] args) {
        // Configure ports
        port(8080);
        
        // Configure the static file directory
        staticFiles.location("/public");
        
        // Configure CORS
        before((req, res) -> {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
            res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
        });
        
        // Process OPTIONS requests
        options("/*", (req, res) -> {
            res.status(200);
            return "";
        });
        
        // Register the routes for each module
        new ProductController().registerRoutes();
        new UserController().registerRoutes();
        new CartController().registerRoutes();
        new OrderController().registerRoutes();
        
        // Home page redirect
        get("/", (req, res) -> {
            res.redirect("/index.html");
            return null;
        });
        
        // Global exception handling
        exception(Exception.class, (e, req, res) -> {
            res.status(500);
            res.type("application/json");
            res.body("{\"success\":false,\"message\":\"Server internal error: " + e.getMessage() + "\"}");
        });
        
        // 404 treatment
        notFound((req, res) -> {
            res.type("application/json");
            return "{\"success\":false,\"message\":\"The interface does not exist\"}";
        });
        
        System.out.println("=================================");
        System.out.println("  The furniture e-commerce platform was successfully launched!");
        System.out.println("  Access address: http://localhost:8080");
        System.out.println("=================================");
        
        // Wait for the Spark server to start and stay running
        awaitInitialization();
    }
}
