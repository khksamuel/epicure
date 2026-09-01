# Epicure

[![CI](https://github.com/khksamuel/epicure/actions/workflows/ci.yml/badge.svg)](https://github.com/khksamuel/epicure/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/khksamuel/epicure/graph/badge.svg?token=ALMHYT0M0B)](https://codecov.io/gh/khksamuel/epicure)

Epicure is a full-stack cooking exploration platform. Its chef-facing React application, Spring Boot API, and internal Python model service help cooks explore ingredient pairings, develop recipe ideas, find swaps, and steer flavour through Epicure's three complementary embedding spaces:

- **Cooc** — pairings learned from recipe co-occurrence
- **Core** — a blend of recipe context and flavour chemistry
- **Chem** — pairings driven by shared flavour compounds

The public API is Spring Boot, while the released Python implementation runs as a small internal model service. Together they preserve identical `neighbors`, `slerp`, and `closest_mode` behaviour while keeping the product maintainable and independently scalable.

## Research basis

This platform builds on [_Epicure: Navigating the Emergent Geometry of Food Ingredient
Embeddings_](https://arxiv.org/abs/2605.22391) by Jakub Radzikowski and Josef Chen (2026).
The paper introduces the Cooc, Core, and Chem embedding spaces used throughout the
application. Many thanks to the authors for publishing the model checkpoints on
[Hugging Face](https://huggingface.co/Kaikaku), which this platform uses directly.

## Chef workspaces

The React application is organised into focused routes instead of one long page:

- `/` — field-book home and workspace chooser
- `/explore` — ingredient exploration and side-by-side comparison
- `/recipe-lab` — recipe remix, creative direction, and pantry-only suggestions
- `/swap` — ingredient alternatives through Cooc, Core, or Chem
- `/steer` — cuisine-direction steering with a creativity dial

Pantry filtering is currently applied in the frontend to the larger candidate
set returned by the recipe endpoint. Ingredient swapping uses flavour neighbours
as creative alternatives.

## Repository layout

```text
epicure-platform/
├── services/
│   ├── api/                 Spring Boot public API
│   └── model-service/       Python Epicure-compatible inference service
├── frontend/                React/Vite chef-facing application
├── docs/
│   ├── architecture.md      Service boundaries and scaling decisions
│   ├── development.md       Local setup, testing, and configuration
│   └── deployment.md        Container and production guidance
├── compose.yaml             Complete local/container deployment
├── test.cmd / test.ps1      Repository-wide quality gate
├── THIRD_PARTY_NOTICES.md   Epicure attribution
└── README.md
```

## Quick start

Docker is the default and recommended way to run the stack. From the repository
root:

```bash
docker compose up --build
```

The complete application is served at `http://127.0.0.1:5173/`; Spring and the
Python model service remain on the private Compose network.

### Manual start without Docker

If Docker is not available on your machine, start the services manually:

1. Set up and start the internal model service:

```powershell
cd services\model-service
python -m venv .venv
.\.venv\Scripts\python -m pip install -e ".[dev]"
.\.venv\Scripts\python -m uvicorn epicure_backend.app:app --host 127.0.0.1 --port 8000
```

2. In a second terminal, start the public Spring API:

```powershell
cd services\api
.\mvnw.cmd spring-boot:run
```

3. In a third terminal, start the React frontend:

```powershell
cd frontend
npm ci
npm run dev -- --host 127.0.0.1 --port 5173
```

The public API is available at `http://127.0.0.1:8080`. Health endpoints:

- Spring: `http://127.0.0.1:8080/actuator/health`
- Full dependency check: `http://127.0.0.1:8080/health`
- Internal model service: `http://127.0.0.1:8000/health`

## Main API operations

- `GET /v1/models`
- `GET /v1/models/{cooc|core|chem}/neighbors/{ingredient}`
- `POST /v1/models/{cooc|core|chem}/slerp`
- `GET /v1/models/{cooc|core|chem}/modes/closest/{ingredient}`
- `POST /v1/compare/neighbors`
- `POST /v1/compare/slerp`
- `POST /v1/creative/recipe-ideas` — generate familiar, balanced, and surprising additions for a recipe

Example comparison request:

```json
{
  "ingredient": "miso",
  "k": 5,
  "models": ["cooc", "core", "chem"]
}
```

Creative recipe request:

```json
{
  "title": "Mushroom rice",
  "ingredients": ["mushroom", "rice", "garlic"],
  "cuisine": "Italian",
  "dietaryNotes": "vegetarian",
  "suggestionsPerStyle": 5
}
```

## Model migration

Spring does not depend on Hugging Face or the Python package directly. Point the
model service at your future compatible repositories or local model directories:

```powershell
$env:EPICURE_MODEL_COOC = "your-name/community-cooc-v2"
$env:EPICURE_MODEL_CORE = "your-name/community-core-v2"
$env:EPICURE_MODEL_CHEM = "your-name/community-chem-v2"
```

Each model supplies `embeddings.safetensors`, `vocab.json`, `modes.json`,
`supervised_poles.json`, and `config.json`. No Spring code changes are required.

## Testing

Run the test profiles from the repository root for testing the components:

```bash
docker compose --profile test run --rm test-model-service
docker compose --profile test run --rm test-api
docker compose --profile test run --rm test-frontend
```

This mirrors the current non-network quality gate used in CI: Python Ruff and pytest,
Spring `mvn test`, and the frontend format/lint/test/build checks. Use the
non-Docker scripts only as a local fallback if you prefer the host environment.

## Documentation

- [Architecture](docs/architecture.md)
- [Development](docs/development.md)
- [Deployment](docs/deployment.md)
- [Spring API service](services/api/README.md)
- [Python model service](services/model-service/README.md)
