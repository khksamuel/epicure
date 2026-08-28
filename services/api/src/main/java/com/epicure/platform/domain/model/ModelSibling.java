package com.epicure.platform.domain.model;

import java.util.Locale;

public enum ModelSibling {
    COOC,
    CORE,
    CHEM;

    public static ModelSibling fromPath(String value) {
        try {
            return valueOf(value.toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException exception) {
            throw new UnknownModelException(value);
        }
    }

    public String pathValue() {
        return name().toLowerCase(Locale.ROOT);
    }
}

