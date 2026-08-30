from __future__ import annotations

from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.responses import JSONResponse

from .registry import ModelRegistry
from .schemas import (
    CompareNeighborsRequest,
    CompareSlerpRequest,
    ModeMatch,
    ScoredIngredient,
    SlerpRequest,
)

MAX_INGREDIENT_RESULTS = 100_000


def _scored(items: list[tuple[str, float]]) -> list[ScoredIngredient]:
    return [ScoredIngredient(ingredient=name, score=score) for name, score in items]


def create_app(registry: ModelRegistry | None = None) -> FastAPI:
    models = registry or ModelRegistry()
    app = FastAPI(
        title="Epicure Platform API",
        version="0.1.0",
        description=(
            "A multi-model backend preserving the public Epicure model operations "
            "across Cooc, Core, Chem, and compatible future checkpoints."
        ),
    )
    app.state.models = models

    def model_or_404(name: str):
        if name not in models.sources:
            raise HTTPException(status_code=404, detail=f"Unknown model '{name}'")
        try:
            return models.get(name)
        except Exception as exc:
            raise HTTPException(
                status_code=503,
                detail=f"Model '{name}' could not be loaded: {exc}",
            ) from exc

    @app.exception_handler(KeyError)
    async def key_error_handler(_request: Request, exc: KeyError) -> JSONResponse:
        missing = exc.args[0] if exc.args else "unknown"
        return JSONResponse(status_code=404, content={"detail": f"Unknown key '{missing}'"})

    @app.get("/health")
    def health() -> dict:
        return {
            "status": "ok",
            "models": {
                name: {
                    "source": source.source,
                    "revision": source.revision,
                    "loaded": models.is_loaded(name),
                }
                for name, source in models.sources.items()
            },
        }

    @app.get("/v1/models")
    def list_models() -> list[dict]:
        result = []
        for name, source in models.sources.items():
            item = {
                "name": name,
                "source": source.source,
                "revision": source.revision,
                "loaded": models.is_loaded(name),
            }
            if models.is_loaded(name):
                model = models.get(name)
                item.update(
                    vocab_size=len(model.vocab),
                    d_model=int(model.E.shape[1]),
                    modes=len(model.modes),
                    supervised_poles=len(model.supervised_poles),
                    schema=model.config.get("schema"),
                )
            result.append(item)
        return result

    @app.get("/v1/models/{model_name}/ingredients")
    def ingredients(
        model_name: str,
        query: str | None = Query(default=None, max_length=200),
        limit: int | None = Query(default=None, ge=1, le=MAX_INGREDIENT_RESULTS),
    ) -> list[str]:
        model = model_or_404(model_name)
        names = sorted(model.vocab)
        if query:
            needle = query.casefold().replace(" ", "_")
            names = [name for name in names if needle in name.casefold()]
        if limit is None and len(names) > MAX_INGREDIENT_RESULTS:
            raise HTTPException(
                status_code=422,
                detail="Too many ingredients matched; refine the query.",
            )
        return names if limit is None else names[:limit]

    @app.get(
        "/v1/models/{model_name}/neighbors/{ingredient}",
        response_model=list[ScoredIngredient],
    )
    def neighbors(
        model_name: str,
        ingredient: str,
        k: int = Query(default=5, ge=1, le=100),
        exclude_self: bool = True,
    ) -> list[ScoredIngredient]:
        return _scored(model_or_404(model_name).neighbors(ingredient, k, exclude_self))

    @app.post(
        "/v1/models/{model_name}/slerp",
        response_model=list[ScoredIngredient],
    )
    def slerp(model_name: str, body: SlerpRequest) -> list[ScoredIngredient]:
        model = model_or_404(model_name)
        return _scored(
            model.slerp(
                body.seed,
                body.direction,
                body.theta_deg,
                body.k,
                body.exclude_seed,
            )
        )

    @app.get(
        "/v1/models/{model_name}/modes/closest/{ingredient}",
        response_model=list[ModeMatch],
    )
    def closest_mode(
        model_name: str,
        ingredient: str,
        kind: str | None = None,
        k: int = Query(default=3, ge=1, le=100),
    ) -> list[ModeMatch]:
        items = model_or_404(model_name).closest_mode(ingredient, kind, k)
        return [
            ModeMatch(mode_id=mode_id, label=label, score=score) for mode_id, label, score in items
        ]

    @app.get("/v1/models/{model_name}/modes")
    def list_modes(model_name: str, kind: str | None = None) -> list[dict[str, str]]:
        return [
            {"mode_id": mode_id, "label": label}
            for mode_id, label in model_or_404(model_name).list_modes(kind)
        ]

    @app.get("/v1/models/{model_name}/modes/{mode_id:path}/members")
    def mode_members(
        model_name: str,
        mode_id: str,
        k: int | None = Query(default=None, ge=1, le=500),
    ) -> list[str]:
        return model_or_404(model_name).mode_members(mode_id, k)

    @app.get("/v1/models/{model_name}/poles")
    def list_poles(model_name: str, prefix: str | None = None) -> list[str]:
        return model_or_404(model_name).list_supervised_poles(prefix)

    @app.post("/v1/compare/neighbors")
    def compare_neighbors(body: CompareNeighborsRequest) -> dict[str, list[ScoredIngredient]]:
        return {
            name: _scored(model_or_404(name).neighbors(body.ingredient, body.k))
            for name in body.models
        }

    @app.post("/v1/compare/slerp")
    def compare_slerp(body: CompareSlerpRequest) -> dict[str, list[ScoredIngredient]]:
        return {
            name: _scored(
                model_or_404(name).slerp(
                    body.seed,
                    body.direction,
                    body.theta_deg,
                    body.k,
                    body.exclude_seed,
                )
            )
            for name in body.models
        }

    return app


app = create_app()
