package com.furniture.data;

import com.furniture.model.Address;
import com.furniture.model.User;
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
 * User Data Manager
 */
public class UserManager {
    private final Gson gson;
    private final String dataPath;
    private List<User> users;

    public UserManager(String dataPath) {
        this.gson = new GsonBuilder().setPrettyPrinting().create();
        this.dataPath = dataPath;
        loadUsers();
    }

    private void loadUsers() {
        try {
            String json = new String(Files.readAllBytes(Paths.get(dataPath + "users.json")), StandardCharsets.UTF_8);
            Type type = new TypeToken<Map<String, List<User>>>(){}.getType();
            Map<String, List<User>> data = gson.fromJson(json, type);
            this.users = data != null && data.get("users") != null ? data.get("users") : new ArrayList<>();
        } catch (Exception e) {
            this.users = new ArrayList<>();
            System.err.println("Failed to load user data:" + e.getMessage());
        }
    }

    public void saveUsers() {
        try {
            Map<String, List<User>> data = new HashMap<>();
            data.put("users", users);
            Files.write(Paths.get(dataPath + "users.json"), gson.toJson(data).getBytes(StandardCharsets.UTF_8));
        } catch (IOException e) {
            System.err.println("Failed to save user data:" + e.getMessage());
        }
    }

    public User getUserById(String id) {
        return users.stream()
                .filter(u -> u.getId().equals(id))
                .findFirst()
                .orElse(null);
    }

    public User getUserByUsername(String username) {
        return users.stream()
                .filter(u -> u.getUsername().equals(username))
                .findFirst()
                .orElse(null);
    }

    public User login(String username, String password) {
        return users.stream()
                .filter(u -> u.getUsername().equals(username) && u.getPassword().equals(password))
                .findFirst()
                .orElse(null);
    }

    public User register(User newUser) {
        // Check if the username already exists
        if (getUserByUsername(newUser.getUsername()) != null) {
            return null;
        }
        // Generate a new ID
        String newId = "U" + String.format("%03d", users.size() + 1);
        newUser.setId(newId);
        newUser.setCreatedAt(java.time.LocalDateTime.now().toString().replace("T", " ").substring(0, 19));
        // Initialize the address list
        if (newUser.getAddresses() == null) {
            newUser.setAddresses(new ArrayList<>());
        }
        users.add(newUser);
        saveUsers();
        return newUser;
    }

    public void updateUser(User user) {
        for (int i = 0; i < users.size(); i++) {
            if (users.get(i).getId().equals(user.getId())) {
                users.set(i, user);
                saveUsers();
                return;
            }
        }
    }

    // Address management
    public List<Address> getAddresses(String userId) {
        User user = getUserById(userId);
        return user != null ? user.getAddresses() : new ArrayList<>();
    }

    public Address addAddress(String userId, Address address) {
        User user = getUserById(userId);
        if (user == null) {
	        return null;
        }
        
        user.addAddress(address);
        saveUsers();
        return address;
    }

    public boolean removeAddress(String userId, String addressId) {
        User user = getUserById(userId);
        if (user == null) {
	        return false;
        }
        
        boolean result = user.removeAddress(addressId);
        if (result) {
            saveUsers();
        }
        return result;
    }

    public boolean setDefaultAddress(String userId, String addressId) {
        User user = getUserById(userId);
        if (user == null) {
	        return false;
        }
        
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
        
        if (found) {
            saveUsers();
        }
        return found;
    }
}
