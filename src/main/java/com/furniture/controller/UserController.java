package com.furniture.controller;

import com.furniture.data.DataStore;
import com.furniture.model.*;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static spark.Spark.*;

/**
 * User API controller
 */
public class UserController {
    private final DataStore dataStore;
    private final Gson gson;
    // Simple session storage (more secure scenarios should be used for practical applications)
    private static final Map<String, String> sessions = new HashMap<>();

    public UserController() {
        this.dataStore = DataStore.getInstance();
        this.gson = new GsonBuilder().create();
    }

    public void registerRoutes() {
        // User login
        post("/api/auth/login", (req, res) -> {
            res.type("application/json");
            Map<String, String> body = gson.fromJson(req.body(), Map.class);
            String username = body.get("username");
            String password = body.get("password");

            User user = dataStore.login(username, password);
            if (user != null) {
                // Generate simple session tokens
                String token = generateToken();
                sessions.put(token, user.getId());
                
                Map<String, Object> result = new HashMap<>();
                result.put("token", token);
                result.put("user", sanitizeUser(user));
                return gson.toJson(ApiResponse.success("Login is successful", result));
            } else {
                res.status(401);
                return gson.toJson(ApiResponse.error("Incorrect username or password"));
            }
        });

        // User registration
        post("/api/auth/register", (req, res) -> {
            res.type("application/json");
            User newUser = gson.fromJson(req.body(), User.class);
            
            if (newUser.getUsername() == null || newUser.getPassword() == null) {
                res.status(400);
                return gson.toJson(ApiResponse.error("The username and password cannot be empty"));
            }

            User user = dataStore.register(newUser);
            if (user != null) {
                String token = generateToken();
                sessions.put(token, user.getId());
                
                Map<String, Object> result = new HashMap<>();
                result.put("token", token);
                result.put("user", sanitizeUser(user));
                return gson.toJson(ApiResponse.success("Registration is successful", result));
            } else {
                res.status(400);
                return gson.toJson(ApiResponse.error("The username already exists"));
            }
        });

        // Log out
        post("/api/auth/logout", (req, res) -> {
            res.type("application/json");
            String token = req.headers("Authorization");
            if (token != null && token.startsWith("Bearer ")) {
                token = token.substring(7);
                sessions.remove(token);
            }
            return gson.toJson(ApiResponse.success("Exit is successful", null));
        });

        // Get current user information
        get("/api/auth/me", (req, res) -> {
            res.type("application/json");
            String userId = getCurrentUserId(req.headers("Authorization"));
            if (userId == null) {
                res.status(401);
                return gson.toJson(ApiResponse.error("Please log in first"));
            }
            
            User user = dataStore.getUserById(userId);
            if (user != null) {
                return gson.toJson(ApiResponse.success(sanitizeUser(user)));
            } else {
                res.status(404);
                return gson.toJson(ApiResponse.error("The user does not exist"));
            }
        });

        // Update user information
        put("/api/auth/me", (req, res) -> {
            res.type("application/json");
            String userId = getCurrentUserId(req.headers("Authorization"));
            if (userId == null) {
                res.status(401);
                return gson.toJson(ApiResponse.error("Please log in first"));
            }
            
            User user = dataStore.getUserById(userId);
            if (user == null) {
                res.status(404);
                return gson.toJson(ApiResponse.error("The user does not exist"));
            }
            
            Map<String, String> updates = gson.fromJson(req.body(), Map.class);
            if (updates.containsKey("email")) user.setEmail(updates.get("email"));
            if (updates.containsKey("phone")) user.setPhone(updates.get("phone"));
            if (updates.containsKey("address")) user.setAddress(updates.get("address"));
            
            dataStore.updateUser(user);
            return gson.toJson(ApiResponse.success("The update was successful", sanitizeUser(user)));
        });
        
        // Get a list of user addresses
        get("/api/addresses", (req, res) -> {
            res.type("application/json");
            String userId = getCurrentUserId(req.headers("Authorization"));
            if (userId == null) {
                res.status(401);
                return gson.toJson(ApiResponse.error("Please log in first"));
            }
            
            User user = dataStore.getUserById(userId);
            if (user == null) {
                res.status(404);
                return gson.toJson(ApiResponse.error("The user does not exist"));
            }
            
            List<Address> addresses = user.getAddresses();
            return gson.toJson(ApiResponse.success(addresses));
        });
        
        // Add a new address
        post("/api/addresses", (req, res) -> {
            res.type("application/json");
            String userId = getCurrentUserId(req.headers("Authorization"));
            if (userId == null) {
                res.status(401);
                return gson.toJson(ApiResponse.error("Please log in first"));
            }
            
            User user = dataStore.getUserById(userId);
            if (user == null) {
                res.status(404);
                return gson.toJson(ApiResponse.error("The user does not exist"));
            }
            
            Address newAddress = gson.fromJson(req.body(), Address.class);
            if (newAddress.getFullName() == null || newAddress.getAddress() == null) {
                res.status(400);
                return gson.toJson(ApiResponse.error("The consignee's name and address cannot be blank"));
            }
            
            user.addAddress(newAddress);
            dataStore.updateUser(user);
            return gson.toJson(ApiResponse.success("The address was added successfully", newAddress));
        });
        
        // Update address
        put("/api/addresses/:id", (req, res) -> {
            res.type("application/json");
            String userId = getCurrentUserId(req.headers("Authorization"));
            if (userId == null) {
                res.status(401);
                return gson.toJson(ApiResponse.error("Please log in first"));
            }
            
            User user = dataStore.getUserById(userId);
            if (user == null) {
                res.status(404);
                return gson.toJson(ApiResponse.error("The user does not exist"));
            }
            
            String addressId = req.params(":id");
            Address updatedAddress = gson.fromJson(req.body(), Address.class);
            updatedAddress.setId(addressId);
            
            List<Address> addresses = user.getAddresses();
            boolean found = false;
            for (int i = 0; i < addresses.size(); i++) {
                if (addresses.get(i).getId().equals(addressId)) {
                    // If set to default, cancel the other defaults
                    if (updatedAddress.isDefault()) {
                        for (Address addr : addresses) {
                            addr.setDefault(false);
                        }
                    }
                    addresses.set(i, updatedAddress);
                    found = true;
                    break;
                }
            }
            
            if (!found) {
                res.status(404);
                return gson.toJson(ApiResponse.error("The address does not exist"));
            }
            
            dataStore.updateUser(user);
            return gson.toJson(ApiResponse.success("The address was successfully updated", updatedAddress));
        });
        
        // Delete address
        delete("/api/addresses/:id", (req, res) -> {
            res.type("application/json");
            String userId = getCurrentUserId(req.headers("Authorization"));
            if (userId == null) {
                res.status(401);
                return gson.toJson(ApiResponse.error("Please log in first"));
            }
            
            User user = dataStore.getUserById(userId);
            if (user == null) {
                res.status(404);
                return gson.toJson(ApiResponse.error("The user does not exist"));
            }
            
            String addressId = req.params(":id");
            boolean removed = user.removeAddress(addressId);
            
            if (!removed) {
                res.status(404);
                return gson.toJson(ApiResponse.error("The address does not exist"));
            }
            
            dataStore.updateUser(user);
            return gson.toJson(ApiResponse.success("The address was successfully deleted", null));
        });
        
        // Set the default address
        put("/api/addresses/:id/default", (req, res) -> {
            res.type("application/json");
            String userId = getCurrentUserId(req.headers("Authorization"));
            if (userId == null) {
                res.status(401);
                return gson.toJson(ApiResponse.error("Please log in first"));
            }
            
            User user = dataStore.getUserById(userId);
            if (user == null) {
                res.status(404);
                return gson.toJson(ApiResponse.error("The user does not exist"));
            }
            
            String addressId = req.params(":id");
            List<Address> addresses = user.getAddresses();
            boolean found = false;
            
            for (Address addr : addresses) {
                if (addr.getId().equals(addressId)) {
                    addr.setDefault(true);
                    found = true;
                } else {
                    addr.setDefault(false);
                }
            }
            
            if (!found) {
                res.status(404);
                return gson.toJson(ApiResponse.error("The address does not exist"));
            }
            
            dataStore.updateUser(user);
            return gson.toJson(ApiResponse.success("is set as the default address", null));
        });
    }

    private String generateToken() {
        return java.util.UUID.randomUUID().toString().replace("-", "");
    }

    public static String getCurrentUserId(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            return sessions.get(token);
        }
        return null;
    }

    private Map<String, Object> sanitizeUser(User user) {
        Map<String, Object> result = new HashMap<>();
        result.put("id", user.getId());
        result.put("username", user.getUsername());
        result.put("email", user.getEmail());
        result.put("phone", user.getPhone());
        result.put("address", user.getAddress());
        result.put("addresses", user.getAddresses());
        result.put("createdAt", user.getCreatedAt());
        return result;
    }
}
