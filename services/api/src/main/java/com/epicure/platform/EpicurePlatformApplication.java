package com.epicure.platform;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class EpicurePlatformApplication {

    public static void main(String[] args) {
        SpringApplication.run(EpicurePlatformApplication.class, args);
    }
}
