package com.epicure.platform.application;

import com.epicure.platform.application.port.ModelInferencePort;
import com.epicure.platform.domain.model.ModeMatch;
import com.epicure.platform.domain.model.ModeSummary;
import com.epicure.platform.domain.model.ModelHealth;
import com.epicure.platform.domain.model.ModelInfo;
import com.epicure.platform.domain.model.ModelSibling;
import com.epicure.platform.domain.model.ScoredIngredient;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class ModelQueryService {

    private final ModelInferencePort inference;

    public ModelQueryService(ModelInferencePort inference) {
        this.inference = inference;
    }

    public ModelHealth health() {
        return inference.health();
    }

    public List<ModelInfo> models() {
        return inference.models();
    }

    public List<String> ingredients(String model, String query, Integer limit) {
        return inference.ingredients(ModelSibling.fromPath(model), query, limit);
    }

    public List<ScoredIngredient> neighbors(
            String model,
            String ingredient,
            int k,
            boolean excludeSelf
    ) {
        return inference.neighbors(ModelSibling.fromPath(model), ingredient, k, excludeSelf);
    }

    public List<ScoredIngredient> slerp(String model, SlerpCommand command) {
        return inference.slerp(
                ModelSibling.fromPath(model),
                command.seed(),
                command.direction(),
                command.thetaDeg(),
                command.k(),
                command.excludeSeed()
        );
    }

    public List<ModeMatch> closestModes(String model, String ingredient, String kind, int k) {
        return inference.closestModes(ModelSibling.fromPath(model), ingredient, kind, k);
    }

    public List<ModeSummary> modes(String model, String kind) {
        return inference.modes(ModelSibling.fromPath(model), kind);
    }

    public List<String> modeMembers(String model, String modeId, Integer k) {
        return inference.modeMembers(ModelSibling.fromPath(model), modeId, k);
    }

    public List<String> poles(String model, String prefix) {
        return inference.poles(ModelSibling.fromPath(model), prefix);
    }

    public Map<String, List<ScoredIngredient>> compareNeighbors(
            String ingredient,
            int k,
            List<String> models
    ) {
        Map<String, List<ScoredIngredient>> result = new LinkedHashMap<>();
        models.forEach(model -> result.put(model, neighbors(model, ingredient, k, true)));
        return result;
    }

    public Map<String, List<ScoredIngredient>> compareSlerp(
            SlerpCommand command,
            List<String> models
    ) {
        Map<String, List<ScoredIngredient>> result = new LinkedHashMap<>();
        models.forEach(model -> result.put(model, slerp(model, command)));
        return result;
    }

    public record SlerpCommand(
            String seed,
            String direction,
            double thetaDeg,
            int k,
            boolean excludeSeed
    ) {
    }
}
