package com.epicure.platform.web;

import com.epicure.platform.application.ModelQueryService;
import com.epicure.platform.domain.model.ModeMatch;
import com.epicure.platform.domain.model.ModeSummary;
import com.epicure.platform.domain.model.ModelHealth;
import com.epicure.platform.domain.model.ModelInfo;
import com.epicure.platform.domain.model.ScoredIngredient;
import com.epicure.platform.web.dto.CompareNeighborsRequest;
import com.epicure.platform.web.dto.CompareSlerpRequest;
import com.epicure.platform.web.dto.SlerpRequest;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ModelAndComparisonControllerTest {

    @Test
    void modelControllerDelegatesEveryPublishedOperation() {
        ModelQueryService service = mock(ModelQueryService.class);
        ModelController controller = new ModelController(service);
        List<ScoredIngredient> scored = List.of(new ScoredIngredient("pear", 0.8));
        List<ModeMatch> matches = List.of(new ModeMatch("F_0/M1", "Fruit", 0.9));
        List<ModeSummary> modes = List.of(new ModeSummary("F_0/M1", "Fruit"));
        when(service.ingredients("cooc", "app", null)).thenReturn(List.of("apple"));
        when(service.neighbors("cooc", "apple", 2, false)).thenReturn(scored);
        when(service.slerp(eq("core"), any())).thenReturn(scored);
        when(service.closestModes("chem", "apple", "factor", 1)).thenReturn(matches);
        when(service.modes("cooc", null)).thenReturn(modes);
        when(service.modeMembers("core", "F_0/M1", 2)).thenReturn(List.of("apple", "pear"));
        when(service.poles("chem", "taste:")).thenReturn(List.of("taste:savoury"));

        assertThat(controller.ingredients("cooc", "app", null)).containsExactly("apple");
        assertThat(controller.neighbors("cooc", "apple", 2, false)).isEqualTo(scored);
        assertThat(controller.slerp("core", new SlerpRequest("apple", "taste:savoury", 20, 2, true)))
                .isEqualTo(scored);
        assertThat(controller.closestModes("chem", "apple", "factor", 1)).isEqualTo(matches);
        assertThat(controller.modes("cooc", null)).isEqualTo(modes);
        assertThat(controller.modeMembers("core", "F_0/M1", 2)).containsExactly("apple", "pear");
        assertThat(controller.poles("chem", "taste:")).containsExactly("taste:savoury");
        controller.listModels();

        verify(service).models();
        verify(service).ingredients("cooc", "app", null);
        verify(service).neighbors("cooc", "apple", 2, false);
        verify(service).slerp("core", new ModelQueryService.SlerpCommand(
                "apple", "taste:savoury", 20, 2, true
        ));
        verify(service).closestModes("chem", "apple", "factor", 1);
        verify(service).modes("cooc", null);
        verify(service).modeMembers("core", "F_0/M1", 2);
        verify(service).poles("chem", "taste:");
    }

    @Test
    void comparisonAndHealthControllersReturnServiceResults() {
        ModelQueryService service = mock(ModelQueryService.class);
        ComparisonController comparison = new ComparisonController(service);
        HealthController health = new HealthController(service);
        Map<String, List<ScoredIngredient>> compared = Map.of(
                "cooc", List.of(new ScoredIngredient("pear", 0.8))
        );
        ModelHealth modelHealth = new ModelHealth("ok", Map.of());
        when(service.compareNeighbors("apple", 2, List.of("cooc"))).thenReturn(compared);
        when(service.compareSlerp(any(), eq(List.of("chem")))).thenReturn(compared);
        when(service.health()).thenReturn(modelHealth);

        assertThat(comparison.neighbors(new CompareNeighborsRequest("apple", 2, List.of("cooc"))))
                .isEqualTo(compared);
        assertThat(comparison.slerp(new CompareSlerpRequest(
                "apple", "taste:savoury", 30, 1, true, List.of("chem")
        ))).isEqualTo(compared);
        assertThat(health.health()).isEqualTo(new HealthController.HealthResponse("ok", modelHealth));

        verify(service).compareNeighbors("apple", 2, List.of("cooc"));
        verify(service).compareSlerp(new ModelQueryService.SlerpCommand(
                "apple", "taste:savoury", 30, 1, true
        ), List.of("chem"));
        verify(service).health();
    }
}
