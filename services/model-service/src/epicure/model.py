"""Epicure-compatible model loader and geometric operators.

The public interface intentionally matches the loader distributed with the
Kaikaku Epicure model repositories. Models may be Hugging Face repository IDs
or local directories following the same artifact contract.
"""

from __future__ import annotations

import json
import os
from dataclasses import dataclass
from pathlib import Path

import numpy as np


def _try_hf_download(repo_id: str, filename: str, revision: str | None = None) -> str:
    try:
        from huggingface_hub import hf_hub_download
    except ImportError as exc:  # pragma: no cover - dependency declared by package
        raise ImportError(
            "huggingface_hub is required for from_pretrained(). "
            "Install with: pip install huggingface_hub safetensors numpy"
        ) from exc
    return hf_hub_download(repo_id=repo_id, filename=filename, revision=revision)


def _load_safetensors(path: str | os.PathLike[str]) -> np.ndarray:
    try:
        from safetensors.numpy import load_file
    except ImportError as exc:  # pragma: no cover - dependency declared by package
        raise ImportError("safetensors required. pip install safetensors") from exc
    tensors = load_file(str(path))
    if "embeddings" not in tensors:
        raise ValueError("embeddings.safetensors must contain an 'embeddings' tensor")
    return tensors["embeddings"]


def _unit(v: np.ndarray, axis: int = -1, eps: float = 1e-9) -> np.ndarray:
    n = np.linalg.norm(v, axis=axis, keepdims=True)
    return v / np.maximum(n, eps)


@dataclass
class ModeEntry:
    mode_id: str
    kind: str
    property: str
    label: str
    n_members: int
    members: list[str]
    pole: np.ndarray


class Epicure:
    """Lookup-table embedding with neighbour, SLERP, and closest-mode operators."""

    REQUIRED_FILES = (
        "embeddings.safetensors",
        "vocab.json",
        "modes.json",
        "supervised_poles.json",
        "config.json",
    )

    def __init__(
        self,
        E: np.ndarray,
        vocab: dict[str, int],
        modes: list[ModeEntry],
        supervised_poles: dict[str, np.ndarray],
        config: dict,
    ):
        self.E_raw = E.astype(np.float32)
        self.E = _unit(self.E_raw)
        self.vocab = vocab
        self.itos = {i: n for n, i in vocab.items()}
        self.modes = modes
        self.supervised_poles = supervised_poles
        self.config = config
        self._validate()

    @classmethod
    def from_pretrained(cls, repo_id_or_path: str, revision: str | None = None) -> Epicure:
        if os.path.isdir(repo_id_or_path):
            base = Path(repo_id_or_path)

            def getp(filename: str) -> str:
                return str(base / filename)
        else:

            def getp(filename: str) -> str:
                return _try_hf_download(repo_id_or_path, filename, revision=revision)

        E = _load_safetensors(getp("embeddings.safetensors"))
        with open(getp("vocab.json"), encoding="utf-8") as handle:
            vocab = json.load(handle)
        with open(getp("modes.json"), encoding="utf-8") as handle:
            modes_raw = json.load(handle)
        with open(getp("supervised_poles.json"), encoding="utf-8") as handle:
            sup_raw = json.load(handle)
        with open(getp("config.json"), encoding="utf-8") as handle:
            config = json.load(handle)

        modes = [
            ModeEntry(
                mode_id=m["mode_id"],
                kind=m["kind"],
                property=m["property"],
                label=m["label"],
                n_members=m["n_members"],
                members=m["members"],
                pole=np.array(m["pole"], dtype=np.float32),
            )
            for m in modes_raw
        ]
        supervised_poles = {
            key: np.array(value, dtype=np.float32) for key, value in sup_raw.items()
        }
        return cls(E, vocab, modes, supervised_poles, config)

    def _validate(self) -> None:
        if self.E_raw.ndim != 2:
            raise ValueError(f"embeddings must be a 2-D matrix, got {self.E_raw.shape}")
        if self.E_raw.shape[0] != len(self.vocab):
            raise ValueError(
                "embedding row count must match vocabulary size: "
                f"{self.E_raw.shape[0]} != {len(self.vocab)}"
            )
        expected_ids = set(range(len(self.vocab)))
        if set(self.vocab.values()) != expected_ids:
            raise ValueError("vocabulary IDs must be unique and contiguous from zero")
        d_model = self.E_raw.shape[1]
        bad_modes = [m.mode_id for m in self.modes if np.asarray(m.pole).shape != (d_model,)]
        if bad_modes:
            raise ValueError(f"mode poles have incompatible dimensions: {bad_modes[:3]}")
        bad_poles = [
            key
            for key, pole in self.supervised_poles.items()
            if np.asarray(pole).shape != (d_model,)
        ]
        if bad_poles:
            raise ValueError(f"supervised poles have incompatible dimensions: {bad_poles[:3]}")

    def vec(self, name: str, normalised: bool = True) -> np.ndarray:
        i = self.vocab[name]
        return self.E[i] if normalised else self.E_raw[i]

    def neighbors(
        self,
        name: str,
        k: int = 5,
        exclude_self: bool = True,
    ) -> list[tuple[str, float]]:
        v = self.vec(name)
        sims = self.E @ v
        order = np.argsort(-sims)
        start = 1 if exclude_self else 0
        return [(self.itos[int(i)], float(sims[i])) for i in order[start : start + k]]

    def slerp(
        self,
        seed: str,
        direction: str | np.ndarray,
        theta_deg: float,
        k: int = 5,
        exclude_seed: bool = True,
    ) -> list[tuple[str, float]]:
        seed_idx = self.vocab[seed]
        v = self.E[seed_idx]
        d = self.supervised_poles[direction] if isinstance(direction, str) else direction
        d = _unit(np.asarray(d, dtype=np.float32))
        d_perp = d - (d @ v) * v
        n_perp = np.linalg.norm(d_perp)
        if n_perp < 1e-9:
            return self.neighbors(seed, k=k)
        d_perp = d_perp / n_perp
        theta = np.deg2rad(float(theta_deg))
        q = _unit(np.cos(theta) * v + np.sin(theta) * d_perp)
        sims = self.E @ q
        if exclude_seed:
            sims[seed_idx] = -np.inf
        order = np.argsort(-sims)
        return [(self.itos[int(i)], float(sims[i])) for i in order[:k]]

    def closest_mode(
        self,
        name: str,
        kind: str | None = None,
        k: int = 3,
    ) -> list[tuple[str, str, float]]:
        v = self.vec(name)
        scored = []
        for mode in self.modes:
            if kind is not None and mode.kind != kind:
                continue
            scored.append((mode.mode_id, mode.label, float(_unit(mode.pole) @ v)))
        scored.sort(key=lambda item: -item[2])
        return scored[:k]

    def mode_members(self, mode_id: str, k: int | None = None) -> list[str]:
        for mode in self.modes:
            if mode.mode_id == mode_id:
                return mode.members[:k] if k is not None else mode.members
        raise KeyError(mode_id)

    def list_supervised_poles(self, prefix: str | None = None) -> list[str]:
        if prefix is None:
            return list(self.supervised_poles.keys())
        return [key for key in self.supervised_poles if key.startswith(prefix)]

    def list_modes(self, kind: str | None = None) -> list[tuple[str, str]]:
        if kind is None:
            return [(mode.mode_id, mode.label) for mode in self.modes]
        return [(mode.mode_id, mode.label) for mode in self.modes if mode.kind == kind]

    def __repr__(self) -> str:
        return (
            f"Epicure(schema={self.config.get('schema')!r}, "
            f"d_model={self.config.get('d_model')}, "
            f"vocab_size={self.config.get('vocab_size')}, "
            f"modes={len(self.modes)}, "
            f"supervised_poles={len(self.supervised_poles)})"
        )
