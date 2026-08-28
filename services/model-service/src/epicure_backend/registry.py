from __future__ import annotations

from threading import Lock

from epicure import Epicure

from .settings import ModelSource, configured_sources


class ModelRegistry:
    """Thread-safe lazy loader for replaceable Epicure-compatible checkpoints."""

    def __init__(self, sources: dict[str, ModelSource] | None = None):
        self.sources = sources or configured_sources()
        self._models: dict[str, Epicure] = {}
        self._locks = {name: Lock() for name in self.sources}

    def names(self) -> list[str]:
        return list(self.sources)

    def get(self, name: str) -> Epicure:
        if name not in self.sources:
            raise KeyError(name)
        if name not in self._models:
            with self._locks[name]:
                if name not in self._models:
                    source = self.sources[name]
                    self._models[name] = Epicure.from_pretrained(
                        source.source,
                        revision=source.revision,
                    )
        return self._models[name]

    def is_loaded(self, name: str) -> bool:
        return name in self._models
