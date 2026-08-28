from __future__ import annotations

import numpy as np

from epicure import Epicure


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
