package com.epicure.platform.web;

import com.epicure.platform.application.ModelQueryService;
import com.epicure.platform.domain.model.ScoredIngredient;
import com.epicure.platform.web.dto.CompareNeighborsRequest;
import com.epicure.platform.web.dto.CompareSlerpRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/v1/compare")
public class ComparisonController {

    private final ModelQueryService models;

    public ComparisonController(ModelQueryService models) {
        this.models = models;
    }

    @PostMapping("/neighbors")
    public Map<String, List<ScoredIngredient>> neighbors(
            @Valid @RequestBody CompareNeighborsRequest body
    ) {
        return models.compareNeighbors(body.ingredient(), body.k(), body.models());
    }

    @PostMapping("/slerp")
    public Map<String, List<ScoredIngredient>> slerp(
            @Valid @RequestBody CompareSlerpRequest body
    ) {
        return models.compareSlerp(
                new ModelQueryService.SlerpCommand(
                        body.seed(), body.direction(), body.thetaDeg(), body.k(), body.excludeSeed()
                ),
                body.models()
        );
    }
}

