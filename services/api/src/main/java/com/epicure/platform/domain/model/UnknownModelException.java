package com.epicure.platform.domain.model;

public class UnknownModelException extends RuntimeException {

    public UnknownModelException(String model) {
        super("Unknown model '" + model + "'. Expected cooc, core, or chem.");
    }
}

