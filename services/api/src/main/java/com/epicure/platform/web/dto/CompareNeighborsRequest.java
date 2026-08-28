package com.epicure.platform.web.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record CompareNeighborsRequest(
        @NotBlank String ingredient,
        @Min(1) @Max(100) int k,
        @NotEmpty List<String> models
) {
    public CompareNeighborsRequest {
        if (k == 0) {
            k = 5;
        }
        if (models == null) {
            models = List.of("cooc", "core", "chem");
        }
    }
}

