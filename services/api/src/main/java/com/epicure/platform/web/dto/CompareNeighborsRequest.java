package com.epicure.platform.web.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

public record CompareNeighborsRequest(
        @NotBlank @Size(max = 200) String ingredient,
        @Min(1) @Max(100) int k,
        @Size(min = 1, max = 3) List<@NotBlank @Size(max = 32) String> models
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
