package com.epicure.platform;

import com.epicure.platform.domain.model.ModelHealth;
import com.epicure.platform.domain.model.ModelInfo;
import org.junit.jupiter.api.Test;
import org.springframework.boot.SpringApplication;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mockStatic;

class EpicurePlatformApplicationTest {

    @Test
    void startsTheSpringApplication() {
        try (var springApplication = mockStatic(SpringApplication.class)) {
            EpicurePlatformApplication.main(new String[]{"--spring.main.web-application-type=none"});

            springApplication.verify(() -> SpringApplication.run(
                    EpicurePlatformApplication.class, "--spring.main.web-application-type=none"
            ));
        }
    }

    @Test
    void exposesModelResponseRecords() {
        var status = new ModelHealth.ModelStatus("fixture", "v1", true);
        var health = new ModelHealth("ok", Map.of("cooc", status));
        var info = new ModelInfo("cooc", "fixture", "v1", true, 4, 3, 2, 1, "v1");

        assertThat(health.models().get("cooc").loaded()).isTrue();
        assertThat(info.vocabSize()).isEqualTo(4);
    }

    @Test
    void canBeConstructed() {
        assertThat(new EpicurePlatformApplication()).isNotNull();
    }
}
