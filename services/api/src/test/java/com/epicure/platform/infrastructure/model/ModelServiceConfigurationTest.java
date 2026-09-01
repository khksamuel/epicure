package com.epicure.platform.infrastructure.model;

import org.junit.jupiter.api.Test;

import java.time.Duration;

import static org.assertj.core.api.Assertions.assertThat;

class ModelServiceConfigurationTest {

    @Test
    void suppliesDefaults_andBuildsTheConfiguredRestClient() {
        ModelServiceProperties defaults = new ModelServiceProperties(null, null, null);
        assertThat(defaults.baseUrl()).isEqualTo("http://127.0.0.1:8000");
        assertThat(defaults.connectTimeout()).isEqualTo(Duration.ofSeconds(3));
        assertThat(defaults.readTimeout()).isEqualTo(Duration.ofSeconds(30));

        assertThat(new ModelServiceProperties("", Duration.ofSeconds(1), Duration.ofSeconds(2)).baseUrl())
                .isEqualTo("http://127.0.0.1:8000");

        ModelServiceProperties configured = new ModelServiceProperties(
                "http://model-service", Duration.ofSeconds(1), Duration.ofSeconds(2)
        );
        assertThat(new ModelClientConfiguration().modelServiceRestClient(configured)).isNotNull();
    }
}
