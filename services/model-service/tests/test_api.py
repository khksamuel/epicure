from __future__ import annotations

from fastapi.testclient import TestClient

from epicure_backend.app import create_app


def test_api_and_compare_contract(sample_registry):
    with TestClient(create_app(sample_registry)) as client:
        health = client.get("/health")
        assert health.status_code == 200
        assert health.json()["models"]["cooc"]["loaded"] is False

        neighbors = client.get("/v1/models/cooc/neighbors/apple?k=2")
        assert neighbors.status_code == 200
        assert neighbors.json()[0]["ingredient"] == "pear"

        compared = client.post(
            "/v1/compare/neighbors",
            json={"ingredient": "apple", "k": 1},
        )
        assert compared.status_code == 200
        assert set(compared.json()) == {"cooc", "core", "chem"}

        slerp = client.post(
            "/v1/models/core/slerp",
            json={
                "seed": "apple",
                "direction": "taste:savoury",
                "theta_deg": 90,
                "k": 1,
            },
        )
        assert slerp.status_code == 200
        assert slerp.json()[0]["ingredient"] == "onion"


def test_unknown_model_and_ingredient_are_404(sample_registry):
    with TestClient(create_app(sample_registry)) as client:
        assert client.get("/v1/models/missing/neighbors/apple").status_code == 404
        assert client.get("/v1/models/cooc/neighbors/missing").status_code == 404
