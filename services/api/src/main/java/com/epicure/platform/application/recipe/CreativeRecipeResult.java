package com.epicure.platform.application.recipe;

import java.util.List;

public record CreativeRecipeResult(
        String title,
        List<String> ingredients,
        String cuisine,
        String dietaryNotes,
        List<CreativeSuggestion> familiarIdeas,
        List<CreativeSuggestion> balancedIdeas,
        List<CreativeSuggestion> surprisingIdeas
) {
    public record CreativeSuggestion(
            String ingredient,
            double score,
            String reason,
            List<String> modelViews
    ) {
    }
}
