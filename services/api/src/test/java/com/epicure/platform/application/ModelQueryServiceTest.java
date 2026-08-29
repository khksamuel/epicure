package com.epicure.platform.application;

import com.epicure.platform.application.port.ModelInferencePort;
import com.epicure.platform.domain.model.ModelSibling;
import com.epicure.platform.domain.model.ScoredIngredient;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.anyDouble;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ModelQueryServiceTest {

    @Test
    void delegatesEveryModelOperation_usingThePublicModelName() {
        ModelInferencePort inference = mock(ModelInferencePort.class);
        ModelQueryService service = new ModelQueryService(inference);
        List<ScoredIngredient> suggestions = List.of(new ScoredIngredient("pear", 0.8));
        when(inference.neighbors(any(), eq("apple"), eq(2), eq(false))).thenReturn(suggestions);
        when(inference.slerp(any(), any(), any(), anyDouble(), anyInt(), anyBoolean()))
                .thenReturn(suggestions);

        service.health();
        service.models();
        service.ingredients("cooc", "app", null);
        assertThat(service.neighbors("core", "apple", 2, false)).isEqualTo(suggestions);
        assertThat(service.slerp("chem", new ModelQueryService.SlerpCommand(
                "apple", "taste:savoury", 25, 3, true
        ))).isEqualTo(suggestions);
        service.closestModes("cooc", "apple", "factor", 1);
        service.modes("core", null);
        service.modeMembers("chem", "F_0/M1", 4);
        service.poles("cooc", "taste:");

        verify(inference).health();
        verify(inference).models();
        verify(inference).ingredients(ModelSibling.COOC, "app", null);
        verify(inference).neighbors(ModelSibling.CORE, "apple", 2, false);
        verify(inference).slerp(ModelSibling.CHEM, "apple", "taste:savoury", 25, 3, true);
        verify(inference).closestModes(ModelSibling.COOC, "apple", "factor", 1);
        verify(inference).modes(ModelSibling.CORE, null);
        verify(inference).modeMembers(ModelSibling.CHEM, "F_0/M1", 4);
        verify(inference).poles(ModelSibling.COOC, "taste:");
    }

    @Test
    void comparesEachRequestedModel_inTheRequestedOrder() {
        ModelInferencePort inference = mock(ModelInferencePort.class);
        ModelQueryService service = new ModelQueryService(inference);
        List<ScoredIngredient> suggestions = List.of(new ScoredIngredient("pear", 0.8));
        when(inference.neighbors(any(), eq("apple"), eq(1), eq(true))).thenReturn(suggestions);
        when(inference.slerp(any(), eq("apple"), eq("taste:savoury"), eq(30.0), eq(1), eq(true)))
                .thenReturn(suggestions);

        assertThat(service.compareNeighbors("apple", 1, List.of("chem", "cooc")))
                .containsOnlyKeys("chem", "cooc");
        assertThat(service.compareSlerp(new ModelQueryService.SlerpCommand(
                "apple", "taste:savoury", 30, 1, true
        ), List.of("core", "chem"))).containsOnlyKeys("core", "chem");

        verify(inference).neighbors(ModelSibling.CHEM, "apple", 1, true);
        verify(inference).neighbors(ModelSibling.COOC, "apple", 1, true);
        verify(inference).slerp(ModelSibling.CORE, "apple", "taste:savoury", 30, 1, true);
        verify(inference).slerp(ModelSibling.CHEM, "apple", "taste:savoury", 30, 1, true);
    }
}
