package com.epicure.platform.application.recipe;

import java.util.List;

public record CreativeRecipeCommand(
        String title,
        List<String> ingredients,
        String cuisine,
        String dietaryNotes,
        int suggestionsPerStyle
) {
}
