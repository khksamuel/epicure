from __future__ import annotations

from fastapi.testclient import TestClient

from epicure_backend.app import create_app


def test_ingredient_catalog_is_not_truncated_at_500(sample_registry):
    model = sample_registry.get("cooc")
    model.vocab.update({f"ingredient_{index:04d}": index + 4 for index in range(501)})

    with TestClient(create_app(sample_registry)) as client:
        response = client.get("/v1/models/cooc/ingredients")

    assert response.status_code == 200
    assert len(response.json()) == 505


def test_catalog_endpoints_and_loaded_model_metadata(sample_registry):
    with TestClient(create_app(sample_registry)) as client:
        assert client.get("/v1/models").json()[0]["loaded"] is False

        ingredients = client.get("/v1/models/cooc/ingredients?query=AP&limit=1")
        assert ingredients.json() == ["apple"]

        models = client.get("/v1/models").json()
        cooc = next(model for model in models if model["name"] == "cooc")
        assert cooc["vocab_size"] == 4
        assert cooc["d_model"] == 3
        assert cooc["modes"] == 2
        assert cooc["supervised_poles"] == 1
        assert cooc["loaded"] is True

        assert (
            client.get("/v1/models/cooc/modes/closest/apple?kind=factor&k=1").json()[0]["mode_id"]
            == "F_0/M1"
        )
        assert client.get("/v1/models/cooc/modes?kind=binary").json() == [
            {"mode_id": "food_group/M1", "label": "Aromatics"}
        ]
        assert client.get("/v1/models/cooc/modes/F_0/M1/members?k=1").json() == ["apple"]
        assert client.get("/v1/models/cooc/poles?prefix=taste:").json() == ["taste:savoury"]


def test_compare_slerp_deduplicates_models_and_validates_query_values(sample_registry):
    with TestClient(create_app(sample_registry)) as client:
        compared = client.post(
            "/v1/compare/slerp",
            json={
                "seed": "apple",
                "direction": "taste:savoury",
                "theta_deg": 90,
                "k": 1,
                "models": ["cooc", "cooc", "chem"],
            },
        )
        assert compared.status_code == 200
        assert set(compared.json()) == {"cooc", "chem"}

        invalid = client.get("/v1/models/cooc/ingredients?limit=0")
        assert invalid.status_code == 422

        excessive = client.get("/v1/models/cooc/ingredients?limit=100001")
        assert excessive.status_code == 422

        too_many_models = client.post(
            "/v1/compare/neighbors",
            json={"ingredient": "apple", "models": ["cooc", "core", "chem", "cooc"]},
        )
        assert too_many_models.status_code == 422

        excessive_seed = client.post(
            "/v1/models/cooc/slerp",
            json={"seed": "a" * 201, "direction": "taste:savoury", "theta_deg": 20},
        )
        assert excessive_seed.status_code == 422
