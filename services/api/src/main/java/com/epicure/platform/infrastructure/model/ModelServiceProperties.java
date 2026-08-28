package com.epicure.platform.infrastructure.model;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.time.Duration;

@ConfigurationProperties(prefix = "epicure.model-service")
public record ModelServiceProperties(String baseUrl, Duration connectTimeout, Duration readTimeout) {

    public ModelServiceProperties {
        if (baseUrl == null || baseUrl.isBlank()) {
            baseUrl = "http://127.0.0.1:8000";
        }
        if (connectTimeout == null) {
            connectTimeout = Duration.ofSeconds(3);
        }
        if (readTimeout == null) {
            readTimeout = Duration.ofSeconds(30);
        }
    }
}
