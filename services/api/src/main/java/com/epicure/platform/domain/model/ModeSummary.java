package com.epicure.platform.domain.model;

import com.fasterxml.jackson.annotation.JsonProperty;

public record ModeSummary(@JsonProperty("mode_id") String modeId, String label) {
}
