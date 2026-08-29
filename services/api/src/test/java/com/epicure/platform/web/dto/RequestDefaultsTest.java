package com.epicure.platform.web.dto;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class RequestDefaultsTest {

    @Test
    void appliesJsonRequestDefaults() {
        SlerpRequest slerp = new SlerpRequest("apple", "taste:savoury", 20, 0, null);
        CompareNeighborsRequest neighbors = new CompareNeighborsRequest("apple", 0, null);
        CompareSlerpRequest compare = new CompareSlerpRequest(
                "apple", "taste:savoury", 20, 0, null, null
        );

        assertThat(slerp.k()).isEqualTo(5);
        assertThat(slerp.excludeSeed()).isTrue();
        assertThat(neighbors.k()).isEqualTo(5);
        assertThat(neighbors.models()).containsExactly("cooc", "core", "chem");
        assertThat(compare.slerp()).isEqualTo(slerp);
        assertThat(compare.models()).containsExactly("cooc", "core", "chem");
    }
}
