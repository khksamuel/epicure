package com.epicure.platform.domain.model;

import java.util.Map;

public record ModelHealth(String status, Map<String, ModelStatus> models) {
    public record ModelStatus(String source, String revision, boolean loaded) {
    }
}
