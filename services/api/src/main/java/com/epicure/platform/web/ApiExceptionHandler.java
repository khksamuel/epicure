package com.epicure.platform.web;

import com.epicure.platform.domain.model.UnknownModelException;
import com.epicure.platform.infrastructure.model.ModelServiceException;
import jakarta.validation.ConstraintViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.time.Instant;
import java.util.Map;

@RestControllerAdvice
public class ApiExceptionHandler {

    private static final String MODEL_SERVICE_ERROR =
            "The model service could not complete the request.";
    private static final String VALIDATION_ERROR = "Request validation failed.";

    @ExceptionHandler(UnknownModelException.class)
    ResponseEntity<Map<String, Object>> unknownModel(UnknownModelException exception) {
        return error(HttpStatus.NOT_FOUND, exception.getMessage());
    }

    @ExceptionHandler(ModelServiceException.class)
    ResponseEntity<Map<String, Object>> modelService(ModelServiceException exception) {
        return ResponseEntity.status(exception.status()).body(payload(
                exception.status().value(),
                MODEL_SERVICE_ERROR
        ));
    }

    @ExceptionHandler({
            MethodArgumentNotValidException.class,
            HandlerMethodValidationException.class,
            ConstraintViolationException.class,
            HttpMessageNotReadableException.class,
            MethodArgumentTypeMismatchException.class
    })
    ResponseEntity<Map<String, Object>> validation(Exception ignored) {
        return error(HttpStatus.BAD_REQUEST, VALIDATION_ERROR);
    }

    private ResponseEntity<Map<String, Object>> error(HttpStatus status, String message) {
        return ResponseEntity.status(status).body(payload(status.value(), message));
    }

    private Map<String, Object> payload(int status, String message) {
        return Map.of(
                "timestamp", Instant.now().toString(),
                "status", status,
                "detail", message
        );
    }
}
