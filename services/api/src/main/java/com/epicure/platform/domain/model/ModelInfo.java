package com.epicure.platform.domain.model;

import com.fasterxml.jackson.annotation.JsonProperty;

public record ModelInfo(
        String name,
        String source,
        String revision,
        boolean loaded,
        @JsonProperty("vocab_size") Integer vocabSize,
        @JsonProperty("d_model") Integer dimensions,
        Integer modes,
        @JsonProperty("supervised_poles") Integer supervisedPoles,
        String schema
) {
}
