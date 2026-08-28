from __future__ import annotations

import os
from dataclasses import dataclass


@dataclass(frozen=True)
class ModelSource:
    name: str
    source: str
    revision: str | None = None


def configured_sources() -> dict[str, ModelSource]:
    defaults = {
        "cooc": "Kaikaku/epicure-cooc",
        "core": "Kaikaku/epicure-core",
        "chem": "Kaikaku/epicure-chem",
    }
    sources: dict[str, ModelSource] = {}
    for name, default in defaults.items():
        upper = name.upper()
        sources[name] = ModelSource(
            name=name,
            source=os.getenv(f"EPICURE_MODEL_{upper}", default),
            revision=os.getenv(f"EPICURE_MODEL_{upper}_REVISION") or None,
        )
    return sources
