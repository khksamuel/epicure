package com.epicure.platform.web.dto;

import com.epicure.platform.application.recipe.CreativeRecipeResult;

import java.util.List;

public record CreativeRecipeResponse(
        String title,
        List<String> ingredients,
        String cuisine,
        String dietaryNotes,
        List<CreativeSuggestion> familiarIdeas,
        List<CreativeSuggestion> balancedIdeas,
        List<CreativeSuggestion> surprisingIdeas
) {
    public static CreativeRecipeResponse from(CreativeRecipeResult result) {
        return new CreativeRecipeResponse(
                result.title(),
                result.ingredients(),
                result.cuisine(),
                result.dietaryNotes(),
                result.familiarIdeas().stream().map(CreativeSuggestion::from).toList(),
                result.balancedIdeas().stream().map(CreativeSuggestion::from).toList(),
                result.surprisingIdeas().stream().map(CreativeSuggestion::from).toList()
        );
    }

    public record CreativeSuggestion(
            String ingredient,
            double score,
            String reason,
            List<String> modelViews
    ) {
        private static CreativeSuggestion from(CreativeRecipeResult.CreativeSuggestion suggestion) {
            return new CreativeSuggestion(
                    suggestion.ingredient(), suggestion.score(), suggestion.reason(), suggestion.modelViews()
            );
        }
    }
}
