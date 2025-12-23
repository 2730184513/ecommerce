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
 * 用户API控制器
 */
public class UserController {
    private final DataStore dataStore;
    private final Gson gson;
    // 简单的会话存储（实际应用应使用更安全的方案）
    private static final Map<String, String> sessions = new HashMap<>();

    public UserController() {
        this.dataStore = DataStore.getInstance();
        this.gson = new GsonBuilder().create();
    }

    public void registerRoutes() {
        // 用户登录
        post("/api/auth/login", (req, res) -> {
            res.type("application/json");
            Map<String, String> body = gson.fromJson(req.body(), Map.class);
            String username = body.get("username");
            String password = body.get("password");

            User user = dataStore.login(username, password);
            if (user != null) {
                // 生成简单的会话token
                String token = generateToken();
                sessions.put(token, user.getId());
                
                Map<String, Object> result = new HashMap<>();
                result.put("token", token);
                result.put("user", sanitizeUser(user));
                return gson.toJson(ApiResponse.success("登录成功", result));
            } else {
                res.status(401);
                return gson.toJson(ApiResponse.error("用户名或密码错误"));
            }
        });

        // 用户注册
        post("/api/auth/register", (req, res) -> {
            res.type("application/json");
            User newUser = gson.fromJson(req.body(), User.class);
            
            if (newUser.getUsername() == null || newUser.getPassword() == null) {
                res.status(400);
                return gson.toJson(ApiResponse.error("用户名和密码不能为空"));
            }

            User user = dataStore.register(newUser);
            if (user != null) {
                String token = generateToken();
                sessions.put(token, user.getId());
                
                Map<String, Object> result = new HashMap<>();
                result.put("token", token);
                result.put("user", sanitizeUser(user));
                return gson.toJson(ApiResponse.success("注册成功", result));
            } else {
                res.status(400);
                return gson.toJson(ApiResponse.error("用户名已存在"));
            }
        });

        // 退出登录
        post("/api/auth/logout", (req, res) -> {
            res.type("application/json");
            String token = req.headers("Authorization");
            if (token != null && token.startsWith("Bearer ")) {
                token = token.substring(7);
                sessions.remove(token);
            }
            return gson.toJson(ApiResponse.success("退出成功", null));
        });

        // 获取当前用户信息
        get("/api/auth/me", (req, res) -> {
            res.type("application/json");
            String userId = getCurrentUserId(req.headers("Authorization"));
            if (userId == null) {
                res.status(401);
                return gson.toJson(ApiResponse.error("请先登录"));
            }
            
            User user = dataStore.getUserById(userId);
            if (user != null) {
                return gson.toJson(ApiResponse.success(sanitizeUser(user)));
            } else {
                res.status(404);
                return gson.toJson(ApiResponse.error("用户不存在"));
            }
        });

        // 更新用户信息
        put("/api/auth/me", (req, res) -> {
            res.type("application/json");
            String userId = getCurrentUserId(req.headers("Authorization"));
            if (userId == null) {
                res.status(401);
                return gson.toJson(ApiResponse.error("请先登录"));
            }
            
            User user = dataStore.getUserById(userId);
            if (user == null) {
                res.status(404);
                return gson.toJson(ApiResponse.error("用户不存在"));
            }
            
            Map<String, String> updates = gson.fromJson(req.body(), Map.class);
            if (updates.containsKey("email")) user.setEmail(updates.get("email"));
            if (updates.containsKey("phone")) user.setPhone(updates.get("phone"));
            if (updates.containsKey("address")) user.setAddress(updates.get("address"));
            
            dataStore.updateUser(user);
            return gson.toJson(ApiResponse.success("更新成功", sanitizeUser(user)));
        });
        
        // 获取用户地址列表
        get("/api/addresses", (req, res) -> {
            res.type("application/json");
            String userId = getCurrentUserId(req.headers("Authorization"));
            if (userId == null) {
                res.status(401);
                return gson.toJson(ApiResponse.error("请先登录"));
            }
            
            User user = dataStore.getUserById(userId);
            if (user == null) {
                res.status(404);
                return gson.toJson(ApiResponse.error("用户不存在"));
            }
            
            List<Address> addresses = user.getAddresses();
            return gson.toJson(ApiResponse.success(addresses));
        });
        
        // 添加新地址
        post("/api/addresses", (req, res) -> {
            res.type("application/json");
            String userId = getCurrentUserId(req.headers("Authorization"));
            if (userId == null) {
                res.status(401);
                return gson.toJson(ApiResponse.error("请先登录"));
            }
            
            User user = dataStore.getUserById(userId);
            if (user == null) {
                res.status(404);
                return gson.toJson(ApiResponse.error("用户不存在"));
            }
            
            Address newAddress = gson.fromJson(req.body(), Address.class);
            if (newAddress.getFullName() == null || newAddress.getAddress() == null) {
                res.status(400);
                return gson.toJson(ApiResponse.error("收货人姓名和地址不能为空"));
            }
            
            user.addAddress(newAddress);
            dataStore.updateUser(user);
            return gson.toJson(ApiResponse.success("地址添加成功", newAddress));
        });
        
        // 更新地址
        put("/api/addresses/:id", (req, res) -> {
            res.type("application/json");
            String userId = getCurrentUserId(req.headers("Authorization"));
            if (userId == null) {
                res.status(401);
                return gson.toJson(ApiResponse.error("请先登录"));
            }
            
            User user = dataStore.getUserById(userId);
            if (user == null) {
                res.status(404);
                return gson.toJson(ApiResponse.error("用户不存在"));
            }
            
            String addressId = req.params(":id");
            Address updatedAddress = gson.fromJson(req.body(), Address.class);
            updatedAddress.setId(addressId);
            
            List<Address> addresses = user.getAddresses();
            boolean found = false;
            for (int i = 0; i < addresses.size(); i++) {
                if (addresses.get(i).getId().equals(addressId)) {
                    // 如果设为默认，取消其他默认
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
                return gson.toJson(ApiResponse.error("地址不存在"));
            }
            
            dataStore.updateUser(user);
            return gson.toJson(ApiResponse.success("地址更新成功", updatedAddress));
        });
        
        // 删除地址
        delete("/api/addresses/:id", (req, res) -> {
            res.type("application/json");
            String userId = getCurrentUserId(req.headers("Authorization"));
            if (userId == null) {
                res.status(401);
                return gson.toJson(ApiResponse.error("请先登录"));
            }
            
            User user = dataStore.getUserById(userId);
            if (user == null) {
                res.status(404);
                return gson.toJson(ApiResponse.error("用户不存在"));
            }
            
            String addressId = req.params(":id");
            boolean removed = user.removeAddress(addressId);
            
            if (!removed) {
                res.status(404);
                return gson.toJson(ApiResponse.error("地址不存在"));
            }
            
            dataStore.updateUser(user);
            return gson.toJson(ApiResponse.success("地址删除成功", null));
        });
        
        // 设置默认地址
        put("/api/addresses/:id/default", (req, res) -> {
            res.type("application/json");
            String userId = getCurrentUserId(req.headers("Authorization"));
            if (userId == null) {
                res.status(401);
                return gson.toJson(ApiResponse.error("请先登录"));
            }
            
            User user = dataStore.getUserById(userId);
            if (user == null) {
                res.status(404);
                return gson.toJson(ApiResponse.error("用户不存在"));
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
                return gson.toJson(ApiResponse.error("地址不存在"));
            }
            
            dataStore.updateUser(user);
            return gson.toJson(ApiResponse.success("已设为默认地址", null));
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
