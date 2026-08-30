package com.epicure.platform.web;

import com.epicure.platform.domain.model.UnknownModelException;
import com.epicure.platform.infrastructure.model.ModelServiceException;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.servlet.config.annotation.CorsRegistry;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class WebConfigurationAndExceptionHandlerTest {

    @Test
    void usesSensibleCorsDefaults_andAcceptsConfiguredOrigins() {
        assertThat(new WebProperties(null).allowedOrigins())
                .containsExactly("http://127.0.0.1:5173", "http://localhost:5173");
        WebProperties configured = new WebProperties(List.of("https://epicure.example"));
        assertThat(configured.allowedOrigins()).containsExactly("https://epicure.example");

        new WebCorsConfiguration(configured).addCorsMappings(new CorsRegistry());
    }

    @Test
    void turnsDomainService_andValidationErrorsIntoApiResponses() {
        ApiExceptionHandler handler = new ApiExceptionHandler();

        assertThat(handler.unknownModel(new UnknownModelException("unknown")).getStatusCode())
                .isEqualTo(HttpStatus.NOT_FOUND);
        var downstream = handler.modelService(new ModelServiceException(
                HttpStatus.BAD_GATEWAY, "backend failed", null
        ));
        assertThat(downstream.getStatusCode()).isEqualTo(HttpStatus.BAD_GATEWAY);
        assertThat(downstream.getBody())
                .containsEntry("detail", "The model service could not complete the request.")
                .doesNotContainValue("backend failed");
        assertThat(handler.validation(new IllegalArgumentException("invalid input")).getStatusCode())
                .isEqualTo(HttpStatus.BAD_REQUEST);
    }
}
