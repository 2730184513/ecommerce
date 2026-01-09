package com.furniture.model;

/**
 * Address entity class
 */
public class Address {
    private String id;
    private String name;       // Address labels (e.g., "Home", "Office")
    private String fullName;   // Recipient's name
    private String phone;      // Contact number
    private String address;    // Street address
    private String city;       // city
    private String state;      // province/state
    private String zipCode;    // postcode
    private boolean isDefault; // Whether the default address is not

    public Address() {}

    public Address(String id, String name, String fullName, String phone,
                   String address, String city, String state, String zipCode, boolean isDefault) {
        this.id = id;
        this.name = name;
        this.fullName = fullName;
        this.phone = phone;
        this.address = address;
        this.city = city;
        this.state = state;
        this.zipCode = zipCode;
        this.isDefault = isDefault;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getZipCode() { return zipCode; }
    public void setZipCode(String zipCode) { this.zipCode = zipCode; }

    public boolean isDefault() { return isDefault; }
    public void setDefault(boolean aDefault) { isDefault = aDefault; }

    // Get the full address string
    public String getFullAddress() {
        StringBuilder sb = new StringBuilder();
        if (address != null && !address.isEmpty()) {
	        sb.append(address);
        }
        if (city != null && !city.isEmpty()) {
	        sb.append(", ").append(city);
        }
        if (state != null && !state.isEmpty()) {
	        sb.append(", ").append(state);
        }
        if (zipCode != null && !zipCode.isEmpty()) {
	        sb.append(" ").append(zipCode);
        }
        return sb.toString();
    }
}
