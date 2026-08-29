package com.epicure.platform.application;

import com.epicure.platform.application.recipe.CreativeRecipeCommand;
import com.epicure.platform.domain.model.ScoredIngredient;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class CreativeRecipeServiceTest {

    @Test
    void normalisesIngredients_keepsBestSuggestions_andHonoursVegetarianNotes() {
        ModelQueryService models = mock(ModelQueryService.class);
        when(models.neighbors(anyString(), anyString(), eq(10), eq(true))).thenAnswer(call -> switch (
                call.getArgument(0, String.class)
        ) {
            case "cooc" -> List.of(
                    new ScoredIngredient("apple", 0.99),
                    new ScoredIngredient("chicken", 0.95),
                    new ScoredIngredient("basil", 0.55),
                    new ScoredIngredient("basil", 0.80)
            );
            case "core" -> List.of(new ScoredIngredient("cocoa", 0.70));
            case "chem" -> List.of(new ScoredIngredient("ginger", 0.60));
            default -> List.of();
        });
        CreativeRecipeService service = new CreativeRecipeService(models);

        var result = service.explore(new CreativeRecipeCommand(
                "  Weeknight dish  ", List.of(" Apple ", "tomato", "apple", "  "),
                "  Italian  ", "vegetarian", 2
        ));

        assertThat(result.title()).isEqualTo("Weeknight dish");
        assertThat(result.ingredients()).containsExactly("apple", "tomato");
        assertThat(result.cuisine()).isEqualTo("Italian");
        assertThat(result.familiarIdeas()).extracting(item -> item.ingredient()).containsExactly("basil");
        assertThat(result.familiarIdeas().getFirst().score()).isEqualTo(0.80);
        assertThat(result.familiarIdeas().getFirst().modelViews()).containsExactly("cooc");
        assertThat(result.balancedIdeas()).extracting(item -> item.ingredient()).containsExactly("cocoa");
        assertThat(result.surprisingIdeas()).extracting(item -> item.ingredient()).containsExactly("ginger");
        assertThat(result.familiarIdeas()).extracting(item -> item.ingredient()).doesNotContain("chicken");
    }

    @Test
    void acceptsMissingOptionalTextFields() {
        ModelQueryService models = mock(ModelQueryService.class);
        when(models.neighbors(anyString(), anyString(), eq(10), eq(true))).thenReturn(List.of());
        CreativeRecipeService service = new CreativeRecipeService(models);

        var result = service.explore(new CreativeRecipeCommand("Title", List.of("apple"), null, null, 3));

        assertThat(result.cuisine()).isEmpty();
        assertThat(result.dietaryNotes()).isEmpty();
        assertThat(result.familiarIdeas()).isEmpty();
        assertThat(result.balancedIdeas()).isEmpty();
        assertThat(result.surprisingIdeas()).isEmpty();
    }
}
