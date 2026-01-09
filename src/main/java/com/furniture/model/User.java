package com.furniture.model;

import java.util.ArrayList;
import java.util.List;

/**
* User entity class
 */
public class User {
    private String id;
    private String username;
    private String password;
    private String email;
    private String phone;
    private String address; // Keep the old fields compatible
    private List<Address> addresses; // Multi-address support
    private String createdAt;

    public User() {
        this.addresses = new ArrayList<>();
    }

    public User(String id, String username, String password, String email, 
                String phone, String address, String createdAt) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.email = email;
        this.phone = phone;
        this.address = address;
        this.createdAt = createdAt;
        this.addresses = new ArrayList<>();
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public List<Address> getAddresses() { 
        if (addresses == null) {
	        addresses = new ArrayList<>();
        }
        return addresses; 
    }
    public void setAddresses(List<Address> addresses) { this.addresses = addresses; }

    public void addAddress(Address addr) {
        if (addresses == null) {
	        addresses = new ArrayList<>();
        }
//        Generate an address ID
        if (addr.getId() == null || addr.getId().isEmpty()) {
            addr.setId("ADDR" + System.currentTimeMillis());
        }
        // If it is the default address, cancel the other defaults
        if (addr.isDefault()) {
            for (Address a : addresses) {
                a.setDefault(false);
            }
        }
        // If it is the first address, it is set as the default
        if (addresses.isEmpty()) {
            addr.setDefault(true);
        }
        addresses.add(addr);
    }

    public boolean removeAddress(String addressId) {
        if (addresses != null) {
            int sizeBefore = addresses.size();
            addresses.removeIf(a -> a.getId().equals(addressId));
            return addresses.size() < sizeBefore;
        }
        return false;
    }

    public Address getDefaultAddress() {
        if (addresses == null || addresses.isEmpty()) {
	        return null;
        }
        return addresses.stream().filter(Address::isDefault).findFirst().orElse(addresses.get(0));
    }
}
