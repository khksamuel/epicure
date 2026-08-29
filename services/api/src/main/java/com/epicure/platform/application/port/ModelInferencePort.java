package com.epicure.platform.application.port;

import com.epicure.platform.domain.model.ModeMatch;
import com.epicure.platform.domain.model.ModeSummary;
import com.epicure.platform.domain.model.ModelHealth;
import com.epicure.platform.domain.model.ModelInfo;
import com.epicure.platform.domain.model.ModelSibling;
import com.epicure.platform.domain.model.ScoredIngredient;

import java.util.List;

public interface ModelInferencePort {

    ModelHealth health();

    List<ModelInfo> models();

    List<String> ingredients(ModelSibling model, String query, Integer limit);

    List<ScoredIngredient> neighbors(ModelSibling model, String ingredient, int k, boolean excludeSelf);

    List<ScoredIngredient> slerp(
            ModelSibling model,
            String seed,
            String direction,
            double thetaDeg,
            int k,
            boolean excludeSeed
    );

    List<ModeMatch> closestModes(ModelSibling model, String ingredient, String kind, int k);

    List<ModeSummary> modes(ModelSibling model, String kind);

    List<String> modeMembers(ModelSibling model, String modeId, Integer k);

    List<String> poles(ModelSibling model, String prefix);
}
