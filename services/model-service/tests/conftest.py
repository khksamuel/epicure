from __future__ import annotations

import json
from pathlib import Path

import numpy as np
import pytest
from safetensors.numpy import save_file

from epicure_backend.registry import ModelRegistry
from epicure_backend.settings import ModelSource


@pytest.fixture
def sample_model_dir(tmp_path: Path) -> Path:
    base = tmp_path / "sample-model"
    base.mkdir()
    embeddings = np.array(
        [
            [1.0, 0.0, 0.0],
            [0.9, 0.1, 0.0],
            [0.0, 1.0, 0.0],
            [0.0, 0.0, 1.0],
        ],
        dtype=np.float32,
    )
    save_file({"embeddings": embeddings}, str(base / "embeddings.safetensors"))
    (base / "vocab.json").write_text(
        json.dumps({"apple": 0, "pear": 1, "onion": 2, "salt": 3}),
        encoding="utf-8",
    )
    (base / "modes.json").write_text(
        json.dumps(
            [
                {
                    "mode_id": "F_0/M1",
                    "kind": "factor",
                    "property": "F_0",
                    "label": "Orchard fruit",
                    "n_members": 2,
                    "members": ["apple", "pear"],
                    "pole": [1.0, 0.0, 0.0],
                },
                {
                    "mode_id": "food_group/M1",
                    "kind": "binary",
                    "property": "food_group",
                    "label": "Aromatics",
                    "n_members": 1,
                    "members": ["onion"],
                    "pole": [0.0, 1.0, 0.0],
                },
            ]
        ),
        encoding="utf-8",
    )
    (base / "supervised_poles.json").write_text(
        json.dumps({"taste:savoury": [0.0, 1.0, 0.0]}),
        encoding="utf-8",
    )
    (base / "config.json").write_text(
        json.dumps({"schema": "epicure-test", "d_model": 3, "vocab_size": 4}),
        encoding="utf-8",
    )
    return base


@pytest.fixture
def sample_registry(sample_model_dir: Path) -> ModelRegistry:
    sources = {
        name: ModelSource(name=name, source=str(sample_model_dir))
        for name in ("cooc", "core", "chem")
    }
    return ModelRegistry(sources)
