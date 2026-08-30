package com.epicure.platform.web.dto;

import com.epicure.platform.application.recipe.CreativeRecipeCommand;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

public record CreativeRecipeRequest(
        @NotBlank @Size(max = 200) String title,
        @NotEmpty @Size(max = 50) List<@NotBlank @Size(max = 200) String> ingredients,
        @Size(max = 100) String cuisine,
        @Size(max = 1_000) String dietaryNotes,
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
