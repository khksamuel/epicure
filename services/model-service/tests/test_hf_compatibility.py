from __future__ import annotations

import importlib.util
import os
import sys

import numpy as np
import pytest
from huggingface_hub import hf_hub_download

from epicure import Epicure

RUN_NETWORK = os.getenv("RUN_HF_COMPAT") == "1"


@pytest.mark.network
@pytest.mark.skipif(not RUN_NETWORK, reason="set RUN_HF_COMPAT=1 to validate released models")
@pytest.mark.parametrize("sibling", ["cooc", "core", "chem"])
def test_matches_official_loader(sibling):
    repo_id = f"Kaikaku/epicure-{sibling}"
    official_path = hf_hub_download(repo_id, "epicure.py")
    module_name = f"official_epicure_{sibling}"
    spec = importlib.util.spec_from_file_location(module_name, official_path)
    official_module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    sys.modules[module_name] = official_module
    spec.loader.exec_module(official_module)

    expected = official_module.Epicure.from_pretrained(repo_id)
    actual = Epicure.from_pretrained(repo_id)

    assert actual.vocab == expected.vocab
    assert actual.config == expected.config
    assert np.array_equal(actual.E_raw, expected.E_raw)
    assert actual.neighbors("chicken", k=10) == expected.neighbors("chicken", k=10)
    assert actual.closest_mode("miso", kind="factor", k=10) == expected.closest_mode(
        "miso", kind="factor", k=10
    )

    shared_poles = sorted(set(actual.supervised_poles) & set(expected.supervised_poles))
    assert shared_poles
    pole = shared_poles[0]
    assert actual.slerp("rice", pole, theta_deg=30, k=10) == expected.slerp(
        "rice", pole, theta_deg=30, k=10
    )
