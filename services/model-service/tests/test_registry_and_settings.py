from __future__ import annotations

import pytest

from epicure import Epicure
from epicure_backend.registry import ModelRegistry
from epicure_backend.settings import ModelSource, configured_sources


def test_registry_loads_once_and_rejects_unknown_names(monkeypatch):
    source = ModelSource(name="cooc", source="fixture", revision="v1")
    loaded = object()
    calls = []

    def load(path, revision=None):
        calls.append((path, revision))
        return loaded

    monkeypatch.setattr(Epicure, "from_pretrained", load)
    registry = ModelRegistry({"cooc": source})

    assert registry.names() == ["cooc"]
    assert registry.is_loaded("cooc") is False
    assert registry.get("cooc") is loaded
    assert registry.get("cooc") is loaded
    assert calls == [("fixture", "v1")]
    assert registry.is_loaded("cooc") is True
    with pytest.raises(KeyError, match="missing"):
        registry.get("missing")


def test_configured_sources_read_environment_overrides(monkeypatch):
    monkeypatch.setenv("EPICURE_MODEL_COOC", "local-cooc")
    monkeypatch.setenv("EPICURE_MODEL_CHEM_REVISION", "abc123")

    sources = configured_sources()

    assert sources["cooc"].source == "local-cooc"
    assert sources["core"].source == "Kaikaku/epicure-core"
    assert sources["chem"].revision == "abc123"
