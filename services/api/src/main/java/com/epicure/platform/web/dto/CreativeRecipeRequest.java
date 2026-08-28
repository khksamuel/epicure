package com.epicure.platform.web.dto;

import com.epicure.platform.application.recipe.CreativeRecipeCommand;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotBlank;

import java.util.List;

public record CreativeRecipeRequest(
        @NotBlank String title,
        @NotEmpty List<@NotBlank String> ingredients,
        String cuisine,
        String dietaryNotes,
        @Min(1) @Max(20) Integer suggestionsPerStyle
) {
    public CreativeRecipeRequest {
        if (suggestionsPerStyle == null) {
            suggestionsPerStyle = 5;
        }
    }

    public CreativeRecipeCommand toCommand() {
        return new CreativeRecipeCommand(
                title, ingredients, cuisine, dietaryNotes, suggestionsPerStyle
        );
    }
}
