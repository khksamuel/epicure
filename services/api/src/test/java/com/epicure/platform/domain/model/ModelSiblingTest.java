package com.epicure.platform.domain.model;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ModelSiblingTest {

    @Test
    void acceptsTheThreePublicModelNames() {
        assertThat(ModelSibling.fromPath("cooc")).isEqualTo(ModelSibling.COOC);
        assertThat(ModelSibling.fromPath("CORE")).isEqualTo(ModelSibling.CORE);
        assertThat(ModelSibling.fromPath("chem")).isEqualTo(ModelSibling.CHEM);
    }

    @Test
    void rejectsUnknownModels() {
        assertThatThrownBy(() -> ModelSibling.fromPath("other"))
                .isInstanceOf(UnknownModelException.class);
    }
}

