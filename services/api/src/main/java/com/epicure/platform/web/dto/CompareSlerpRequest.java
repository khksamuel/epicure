package com.epicure.platform.web.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

public record CompareSlerpRequest(
        @NotBlank @Size(max = 200) String seed,
        @NotBlank @Size(max = 200) String direction,
        @JsonProperty("theta_deg") @DecimalMin("-180") @DecimalMax("180") double thetaDeg,
        @Min(1) @Max(100) int k,
        @JsonProperty("exclude_seed") Boolean excludeSeed,
        @Size(min = 1, max = 3) List<@NotBlank @Size(max = 32) String> models
) {
    public CompareSlerpRequest {
        if (k == 0) {
            k = 5;
        }
        if (models == null) {
            models = List.of("cooc", "core", "chem");
        }
        if (excludeSeed == null) {
            excludeSeed = true;
        }
    }

    public SlerpRequest slerp() {
        return new SlerpRequest(seed, direction, thetaDeg, k, excludeSeed);
    }
}
