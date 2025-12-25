package com.furniture;

import com.furniture.controller.*;
import static spark.Spark.*;

/**
 * 主应用程序入口
 */
public class Application {
    public static void main(String[] args) {
        // 配置端口
        port(8080);
        
        // 配置静态文件目录
        staticFiles.location("/public");
        
        // 配置CORS
        before((req, res) -> {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
            res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
        });
        
        // 处理OPTIONS请求
        options("/*", (req, res) -> {
            res.status(200);
            return "";
        });
        
        // 注册各模块路由
        new ProductController().registerRoutes();
        new UserController().registerRoutes();
        new CartController().registerRoutes();
        new OrderController().registerRoutes();
        
        // 首页重定向
        get("/", (req, res) -> {
            res.redirect("/index.html");
            return null;
        });
        
        // 全局异常处理
        exception(Exception.class, (e, req, res) -> {
            res.status(500);
            res.type("application/json");
            res.body("{\"success\":false,\"message\":\"服务器内部错误: " + e.getMessage() + "\"}");
        });
        
        // 404处理
        notFound((req, res) -> {
            res.type("application/json");
            return "{\"success\":false,\"message\":\"接口不存在\"}";
        });
        
        System.out.println("=================================");
        System.out.println("  家具电商平台启动成功！");
        System.out.println("  访问地址: http://localhost:8080");
        System.out.println("=================================");
        
        // 等待 Spark 服务器启动并保持运行
        awaitInitialization();
    }
}
