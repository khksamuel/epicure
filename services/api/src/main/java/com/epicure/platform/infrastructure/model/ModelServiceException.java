package com.epicure.platform.infrastructure.model;

import org.springframework.http.HttpStatusCode;

public class ModelServiceException extends RuntimeException {

    private final HttpStatusCode status;

    public ModelServiceException(HttpStatusCode status, String message, Throwable cause) {
        super(message, cause);
        this.status = status;
    }

    public HttpStatusCode status() {
        return status;
    }
}

