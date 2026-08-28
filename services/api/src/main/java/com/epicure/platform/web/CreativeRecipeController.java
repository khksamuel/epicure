package com.epicure.platform.web;

import com.epicure.platform.application.CreativeRecipeService;
import com.epicure.platform.web.dto.CreativeRecipeRequest;
import com.epicure.platform.web.dto.CreativeRecipeResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/creative")
public class CreativeRecipeController {

    private final CreativeRecipeService creativeRecipes;

    public CreativeRecipeController(CreativeRecipeService creativeRecipes) {
        this.creativeRecipes = creativeRecipes;
    }

    @PostMapping("/recipe-ideas")
    public CreativeRecipeResponse recipeIdeas(@Valid @RequestBody CreativeRecipeRequest request) {
        return CreativeRecipeResponse.from(creativeRecipes.explore(request.toCommand()));
    }
}
