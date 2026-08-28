package com.epicure.platform.web;

import com.epicure.platform.application.ModelQueryService;
import com.epicure.platform.domain.model.ModeMatch;
import com.epicure.platform.domain.model.ModeSummary;
import com.epicure.platform.domain.model.ModelInfo;
import com.epicure.platform.domain.model.ScoredIngredient;
import com.epicure.platform.web.dto.SlerpRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@Validated
@RestController
@RequestMapping("/v1/models")
public class ModelController {

    private final ModelQueryService models;

    public ModelController(ModelQueryService models) {
        this.models = models;
    }

    @GetMapping
    public List<ModelInfo> listModels() {
        return models.models();
    }

    @GetMapping("/{model}/ingredients")
    public List<String> ingredients(
            @PathVariable String model,
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "50") @Min(1) @Max(500) int limit
    ) {
        return models.ingredients(model, query, limit);
    }

    @GetMapping("/{model}/neighbors/{ingredient}")
    public List<ScoredIngredient> neighbors(
            @PathVariable String model,
            @PathVariable String ingredient,
            @RequestParam(defaultValue = "5") @Min(1) @Max(100) int k,
            @RequestParam(name = "exclude_self", defaultValue = "true") boolean excludeSelf
    ) {
        return models.neighbors(model, ingredient, k, excludeSelf);
    }

    @PostMapping("/{model}/slerp")
    public List<ScoredIngredient> slerp(
            @PathVariable String model,
            @Valid @RequestBody SlerpRequest body
    ) {
        return models.slerp(model, new ModelQueryService.SlerpCommand(
                body.seed(), body.direction(), body.thetaDeg(), body.k(), body.excludeSeed()
        ));
    }

    @GetMapping("/{model}/modes/closest/{ingredient}")
    public List<ModeMatch> closestModes(
            @PathVariable String model,
            @PathVariable String ingredient,
            @RequestParam(required = false) String kind,
            @RequestParam(defaultValue = "3") @Min(1) @Max(100) int k
    ) {
        return models.closestModes(model, ingredient, kind, k);
    }

    @GetMapping("/{model}/modes")
    public List<ModeSummary> modes(
            @PathVariable String model,
            @RequestParam(required = false) String kind
    ) {
        return models.modes(model, kind);
    }

    @GetMapping("/{model}/mode-members")
    public List<String> modeMembers(
            @PathVariable String model,
            @RequestParam(name = "mode_id") String modeId,
            @RequestParam(required = false) @Min(1) @Max(500) Integer k
    ) {
        return models.modeMembers(model, modeId, k);
    }

    @GetMapping("/{model}/poles")
    public List<String> poles(
            @PathVariable String model,
            @RequestParam(required = false) String prefix
    ) {
        return models.poles(model, prefix);
    }
}
