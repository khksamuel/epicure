package com.epicure.platform.web;

import com.epicure.platform.application.CreativeRecipeService;
import com.epicure.platform.application.recipe.CreativeRecipeResult;
import com.epicure.platform.web.dto.CreativeRecipeRequest;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class CreativeRecipeControllerTest {

    @Test
    void mapsTheRecipeServiceResultToThePublicResponse() {
        CreativeRecipeService service = mock(CreativeRecipeService.class);
        CreativeRecipeController controller = new CreativeRecipeController(service);
        CreativeRecipeResult.CreativeSuggestion suggestion = new CreativeRecipeResult.CreativeSuggestion(
                "basil", 0.8, "A familiar pairing", List.of("cooc")
        );
        when(service.explore(any())).thenReturn(new CreativeRecipeResult(
                "Soup", List.of("tomato"), "Italian", "vegetarian",
                List.of(suggestion), List.of(), List.of()
        ));

        var response = controller.recipeIdeas(new CreativeRecipeRequest(
                "Soup", List.of("tomato"), "Italian", "vegetarian", null
        ));

        assertThat(response.title()).isEqualTo("Soup");
        assertThat(response.familiarIdeas()).extracting(item -> item.ingredient()).containsExactly("basil");
        assertThat(response.familiarIdeas().getFirst().modelViews()).containsExactly("cooc");
    }
}
