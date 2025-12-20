package com.furniture.model;

/**
 * 地址实体类
 */
public class Address {
    private String id;
    private String name;       // 地址标签（如 "Home", "Office"）
    private String fullName;   // 收件人姓名
    private String phone;      // 联系电话
    private String address;    // 街道地址
    private String city;       // 城市
    private String state;      // 省/州
    private String zipCode;    // 邮编
    private boolean isDefault; // 是否默认地址

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

    // 获取完整地址字符串
    public String getFullAddress() {
        StringBuilder sb = new StringBuilder();
        if (address != null && !address.isEmpty()) sb.append(address);
        if (city != null && !city.isEmpty()) sb.append(", ").append(city);
        if (state != null && !state.isEmpty()) sb.append(", ").append(state);
        if (zipCode != null && !zipCode.isEmpty()) sb.append(" ").append(zipCode);
        return sb.toString();
    }
}
