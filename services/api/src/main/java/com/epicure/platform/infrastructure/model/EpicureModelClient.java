package com.epicure.platform.infrastructure.model;

import com.epicure.platform.application.port.ModelInferencePort;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.epicure.platform.domain.model.ModeMatch;
import com.epicure.platform.domain.model.ModeSummary;
import com.epicure.platform.domain.model.ModelHealth;
import com.epicure.platform.domain.model.ModelInfo;
import com.epicure.platform.domain.model.ModelSibling;
import com.epicure.platform.domain.model.ScoredIngredient;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClientResponseException;

import java.util.List;

@Component
public class EpicureModelClient implements ModelInferencePort {

    private static final ParameterizedTypeReference<List<ModelInfo>> MODEL_LIST = new ParameterizedTypeReference<>() {};
    private static final ParameterizedTypeReference<List<ModeSummary>> MODE_SUMMARY_LIST = new ParameterizedTypeReference<>() {};
    private static final ParameterizedTypeReference<List<String>> STRING_LIST = new ParameterizedTypeReference<>() {};
    private static final ParameterizedTypeReference<List<ScoredIngredient>> SCORED_LIST = new ParameterizedTypeReference<>() {};
    private static final ParameterizedTypeReference<List<ModeMatch>> MODE_LIST = new ParameterizedTypeReference<>() {};

    private final RestClient client;

    public EpicureModelClient(RestClient modelServiceRestClient) {
        this.client = modelServiceRestClient;
    }

    @Override
    public ModelHealth health() {
        return execute(() -> client.get().uri("/health").retrieve().body(ModelHealth.class));
    }

    @Override
    public List<ModelInfo> models() {
        return execute(() -> client.get().uri("/v1/models").retrieve().body(MODEL_LIST));
    }

    @Override
    public List<String> ingredients(ModelSibling model, String query, int limit) {
        return execute(() -> client.get()
                .uri(builder -> builder
                        .path("/v1/models/{model}/ingredients")
                        .queryParamIfPresent("query", java.util.Optional.ofNullable(query))
                        .queryParam("limit", limit)
                        .build(model.pathValue()))
                .retrieve()
                .body(STRING_LIST));
    }

    @Override
    public List<ScoredIngredient> neighbors(
            ModelSibling model,
            String ingredient,
            int k,
            boolean excludeSelf
    ) {
        return execute(() -> client.get()
                .uri(builder -> builder
                        .path("/v1/models/{model}/neighbors/{ingredient}")
                        .queryParam("k", k)
                        .queryParam("exclude_self", excludeSelf)
                        .build(model.pathValue(), ingredient))
                .retrieve()
                .body(SCORED_LIST));
    }

    @Override
    public List<ScoredIngredient> slerp(
            ModelSibling model,
            String seed,
            String direction,
            double thetaDeg,
            int k,
        boolean excludeSeed
    ) {
        return execute(() -> client.post()
                .uri("/v1/models/{model}/slerp", model.pathValue())
                .body(new SlerpPayload(seed, direction, thetaDeg, k, excludeSeed))
                .retrieve()
                .body(SCORED_LIST));
    }

    @Override
    public List<ModeMatch> closestModes(ModelSibling model, String ingredient, String kind, int k) {
        return execute(() -> client.get()
                .uri(builder -> builder
                        .path("/v1/models/{model}/modes/closest/{ingredient}")
                        .queryParamIfPresent("kind", java.util.Optional.ofNullable(kind))
                        .queryParam("k", k)
                        .build(model.pathValue(), ingredient))
                .retrieve()
                .body(MODE_LIST));
    }

    @Override
    public List<ModeSummary> modes(ModelSibling model, String kind) {
        return execute(() -> client.get()
                .uri(builder -> builder
                        .path("/v1/models/{model}/modes")
                        .queryParamIfPresent("kind", java.util.Optional.ofNullable(kind))
                        .build(model.pathValue()))
                .retrieve()
                .body(MODE_SUMMARY_LIST));
    }

    @Override
    public List<String> modeMembers(ModelSibling model, String modeId, Integer k) {
        return execute(() -> client.get()
                .uri(builder -> builder
                        .path("/v1/models/{model}/modes/{modeId}/members")
                        .queryParamIfPresent("k", java.util.Optional.ofNullable(k))
                        .build(model.pathValue(), modeId))
                .retrieve()
                .body(STRING_LIST));
    }

    @Override
    public List<String> poles(ModelSibling model, String prefix) {
        return execute(() -> client.get()
                .uri(builder -> builder
                        .path("/v1/models/{model}/poles")
                        .queryParamIfPresent("prefix", java.util.Optional.ofNullable(prefix))
                        .build(model.pathValue()))
                .retrieve()
                .body(STRING_LIST));
    }

    private <T> T execute(BackendCall<T> call) {
        try {
            T response = call.execute();
            if (response == null) {
                throw new ModelServiceException(
                        org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE,
                        "The model service returned an empty response.",
                        null
                );
            }
            return response;
        } catch (RestClientResponseException exception) {
            throw new ModelServiceException(
                    exception.getStatusCode(),
                    exception.getResponseBodyAsString(),
                    exception
            );
        } catch (ResourceAccessException exception) {
            throw new ModelServiceException(
                    org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE,
                    "Could not reach the model service within the configured timeout.",
                    exception
            );
        }
    }

    private record SlerpPayload(
            String seed,
            String direction,
            @JsonProperty("theta_deg") double thetaDeg,
            int k,
            @JsonProperty("exclude_seed") boolean excludeSeed
    ) {
    }

    @FunctionalInterface
    private interface BackendCall<T> {
        T execute();
    }
}
