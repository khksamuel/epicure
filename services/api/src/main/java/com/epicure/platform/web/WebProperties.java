package com.epicure.platform.web;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

@ConfigurationProperties(prefix = "epicure.web")
public record WebProperties(List<String> allowedOrigins) {
    public WebProperties {
        if (allowedOrigins == null || allowedOrigins.isEmpty()) {
            allowedOrigins = List.of("http://127.0.0.1:5173", "http://localhost:5173");
        }
    }
}
