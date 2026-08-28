package com.epicure.platform.web;

import com.epicure.platform.application.ModelQueryService;
import com.epicure.platform.domain.model.ModelHealth;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {

    private final ModelQueryService models;

    public HealthController(ModelQueryService models) {
        this.models = models;
    }

    @GetMapping("/health")
    public HealthResponse health() {
        return new HealthResponse("ok", models.health());
    }

    public record HealthResponse(
            String status,
            @JsonProperty("model_service") ModelHealth modelService
    ) {
    }
}
