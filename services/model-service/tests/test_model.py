from __future__ import annotations

import numpy as np
import pytest

from epicure import Epicure, ModeEntry
from epicure.model import _unit


def test_public_interface(sample_model_dir):
    model = Epicure.from_pretrained(str(sample_model_dir))

    assert model.neighbors("apple", k=2)[0][0] == "pear"
    assert model.closest_mode("apple", kind="factor", k=1)[0][:2] == (
        "F_0/M1",
        "Orchard fruit",
    )
    assert model.mode_members("F_0/M1") == ["apple", "pear"]
    assert model.list_supervised_poles("taste:") == ["taste:savoury"]
    assert model.list_modes("factor") == [("F_0/M1", "Orchard fruit")]
    assert np.isclose(np.linalg.norm(model.vec("apple")), 1.0)
    assert np.allclose(model.vec("pear", normalised=False), [0.9, 0.1, 0.0])


def test_slerp_rotates_toward_direction(sample_model_dir):
    model = Epicure.from_pretrained(str(sample_model_dir))
    at_zero = model.slerp("apple", "taste:savoury", theta_deg=0, k=1)
    at_ninety = model.slerp("apple", "taste:savoury", theta_deg=90, k=1)

    assert at_zero[0][0] == "pear"
    assert at_ninety[0][0] == "onion"


def test_model_handles_parallel_directions_and_catalog_edge_cases(sample_model_dir):
    model = Epicure.from_pretrained(str(sample_model_dir))

    assert model.neighbors("apple", k=1, exclude_self=False)[0][0] == "apple"
    assert model.slerp("apple", np.array([1.0, 0.0, 0.0]), theta_deg=20, k=1)[0][0] == "pear"
    assert model.list_supervised_poles() == ["taste:savoury"]
    assert model.list_modes() == [("F_0/M1", "Orchard fruit"), ("food_group/M1", "Aromatics")]
    assert "d_model=3" in repr(model)
    assert np.allclose(_unit(np.zeros(3)), np.zeros(3))
    with pytest.raises(KeyError, match="missing"):
        model.mode_members("missing")


def test_model_rejects_invalid_embedding_and_pole_shapes():
    with pytest.raises(ValueError, match="row count"):
        Epicure(np.ones((1, 2)), {"apple": 0, "pear": 1}, [], {}, {})

    mode = ModeEntry("mode", "factor", "factor", "Mode", 1, ["apple"], np.ones(3))
    with pytest.raises(ValueError, match="mode poles"):
        Epicure(np.ones((1, 2)), {"apple": 0}, [mode], {}, {})

    with pytest.raises(ValueError, match="supervised poles"):
        Epicure(np.ones((1, 2)), {"apple": 0}, [], {"taste:sweet": np.ones(3)}, {})
