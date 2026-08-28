from __future__ import annotations

from pydantic import BaseModel, Field, field_validator


class ScoredIngredient(BaseModel):
    ingredient: str
    score: float


class ModeMatch(BaseModel):
    mode_id: str
    label: str
    score: float


class SlerpRequest(BaseModel):
    seed: str
    direction: str
    theta_deg: float = Field(ge=-180, le=180)
    k: int = Field(default=5, ge=1, le=100)
    exclude_seed: bool = True


class CompareNeighborsRequest(BaseModel):
    ingredient: str
    k: int = Field(default=5, ge=1, le=100)
    models: list[str] = Field(default_factory=lambda: ["cooc", "core", "chem"])

    @field_validator("models")
    @classmethod
    def models_are_unique(cls, value: list[str]) -> list[str]:
        return list(dict.fromkeys(value))


class CompareSlerpRequest(SlerpRequest):
    models: list[str] = Field(default_factory=lambda: ["cooc", "core", "chem"])

    @field_validator("models")
    @classmethod
    def models_are_unique(cls, value: list[str]) -> list[str]:
        return list(dict.fromkeys(value))
