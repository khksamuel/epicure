from __future__ import annotations

from typing import Annotated

from pydantic import BaseModel, Field, field_validator

BoundedIngredient = Annotated[str, Field(min_length=1, max_length=200)]
ModelName = Annotated[str, Field(min_length=1, max_length=32)]


class ScoredIngredient(BaseModel):
    ingredient: str
    score: float


class ModeMatch(BaseModel):
    mode_id: str
    label: str
    score: float


class SlerpRequest(BaseModel):
    seed: BoundedIngredient
    direction: BoundedIngredient
    theta_deg: float = Field(ge=-180, le=180)
    k: int = Field(default=5, ge=1, le=100)
    exclude_seed: bool = True


class CompareNeighborsRequest(BaseModel):
    ingredient: BoundedIngredient
    k: int = Field(default=5, ge=1, le=100)
    models: list[ModelName] = Field(
        default_factory=lambda: ["cooc", "core", "chem"],
        min_length=1,
        max_length=3,
    )

    @field_validator("models")
    @classmethod
    def models_are_unique(cls, value: list[str]) -> list[str]:
        return list(dict.fromkeys(value))


class CompareSlerpRequest(SlerpRequest):
    models: list[ModelName] = Field(
        default_factory=lambda: ["cooc", "core", "chem"],
        min_length=1,
        max_length=3,
    )

    @field_validator("models")
    @classmethod
    def models_are_unique(cls, value: list[str]) -> list[str]:
        return list(dict.fromkeys(value))
