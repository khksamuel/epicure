package com.epicure.platform.application;

import com.epicure.platform.domain.model.ScoredIngredient;
import com.epicure.platform.application.recipe.CreativeRecipeCommand;
import com.epicure.platform.application.recipe.CreativeRecipeResult;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@Service
public class CreativeRecipeService {

    private static final List<String> MODELS = List.of("cooc", "core", "chem");

    private final ModelQueryService models;

    public CreativeRecipeService(ModelQueryService models) {
        this.models = models;
    }

    public CreativeRecipeResult explore(CreativeRecipeCommand request) {
        List<String> ingredients = request.ingredients().stream()
                .map(this::normalise)
                .filter(value -> !value.isBlank())
                .distinct()
                .toList();
        Set<String> existing = new LinkedHashSet<>(ingredients);
        Map<String, Candidate> candidates = new LinkedHashMap<>();

        for (String model : MODELS) {
            for (String ingredient : ingredients) {
                for (ScoredIngredient suggestion : models.neighbors(model, ingredient, 10, true)) {
                    String name = normalise(suggestion.ingredient());
                    if (name.isBlank() || existing.contains(name) || isExcluded(name, request.dietaryNotes())) {
                        continue;
                    }
                    candidates.computeIfAbsent(name, ignored -> new Candidate())
                            .add(model, suggestion.score());
                }
            }
        }

        return new CreativeRecipeResult(
                request.title().trim(),
                ingredients,
                clean(request.cuisine()),
                clean(request.dietaryNotes()),
                select(candidates, "cooc", request.suggestionsPerStyle(),
                        "A familiar pairing that appears often in recipe patterns."),
                select(candidates, "core", request.suggestionsPerStyle(),
                        "A balanced idea sitting between recipe patterns and flavour chemistry."),
                select(candidates, "chem", request.suggestionsPerStyle(),
                        "A more unusual idea suggested by a related flavour-compound profile.")
        );
    }

    private List<CreativeRecipeResult.CreativeSuggestion> select(
            Map<String, Candidate> candidates,
            String preferredModel,
            int limit,
            String reason
    ) {
        return candidates.entrySet().stream()
                .filter(entry -> entry.getValue().scores.containsKey(preferredModel))
                .sorted(Map.Entry.<String, Candidate>comparingByValue(
                        Comparator.comparingDouble(candidate -> candidate.scores.get(preferredModel))
                ).reversed())
                .limit(limit)
                .map(entry -> new CreativeRecipeResult.CreativeSuggestion(
                        entry.getKey(),
                        entry.getValue().scores.get(preferredModel),
                        reason,
                        new ArrayList<>(entry.getValue().models)
                ))
                .toList();
    }

    private boolean isExcluded(String ingredient, String dietaryNotes) {
        if (dietaryNotes == null) {
            return false;
        }
        if (dietaryNotes.isBlank()) {
            return false;
        }
        String notes = dietaryNotes.toLowerCase(Locale.ROOT);
        return notes.contains("vegetarian") && Set.of("chicken", "beef", "pork", "lamb", "fish", "shrimp")
                .stream().anyMatch(ingredient::contains);
    }

    private String normalise(String value) {
        return value == null ? "" : value.trim().toLowerCase(Locale.ROOT).replace(' ', '_');
    }

    private String clean(String value) {
        return value == null ? "" : value.trim();
    }

    private static final class Candidate {
        private final Map<String, Double> scores = new LinkedHashMap<>();
        private final Set<String> models = new LinkedHashSet<>();

        private void add(String model, double score) {
            scores.merge(model, score, Math::max);
            models.add(model);
        }
    }
}
