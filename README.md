# Epicure

[![CI](https://github.com/khksamuel/epicure/actions/workflows/ci.yml/badge.svg)](https://github.com/khksamuel/epicure/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/khksamuel/epicure/graph/badge.svg?token=ALMHYT0M0B)](https://codecov.io/gh/khksamuel/epicure)

A backend foundation for a cooking application that lets users explore ingredient
pairings through Epicure's three complementary embedding spaces:

- **Cooc** — pairings learned from recipe co-occurrence
- **Core** — a blend of recipe context and flavour chemistry
- **Chem** — pairings driven by shared flavour compounds

The public backend is Spring Boot. The released Python implementation runs as a
small internal model service, preserving identical `neighbors`, `slerp`, and
`closest_mode` behavior while keeping the product backend maintainable and
independently scalable.

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
as creative alternatives; it does not claim physical or culinary equivalence.

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

Requirements: Java 21+, Python 3.11+, and Node.js 22.12+. The repository includes
its own pinned Maven Wrapper.

On Windows, double-click `run.cmd`. It starts both services, checks that they are
ready, and serves the React Epicure frontend at `http://127.0.0.1:5173/`.
Press Ctrl+C in the launcher window to stop all services. Use `run.ps1 -SkipBuild`
for a faster restart.

For a containerised run, copy `.env.example` to `.env`, optionally pin model
revisions, then run `docker compose up --build`. The complete application is
served at `http://127.0.0.1:5173/`; Spring and Python remain on the private
Compose network.

Set up and start the internal model service:

```powershell
cd services\model-service
python -m venv .venv
.\.venv\Scripts\python -m pip install -e ".[dev]"
.\.venv\Scripts\python -m uvicorn epicure_backend.app:app --host 127.0.0.1 --port 8000
```

In a second terminal, start the public Spring API:

```powershell
cd services\api
.\mvnw.cmd spring-boot:run
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

## Quality gate

Run every local check from the repository root:

```powershell
.\test.cmd
```

This runs Ruff and the local Python tests, Spring unit, contract, and architecture
tests, frontend ESLint and Vitest checks, and the production frontend build.
Use `.\test.ps1 -Network` to include the Hugging Face compatibility tests.
GitHub Actions runs the same non-network checks on every push and pull request.

### Codecov setup

CI generates JaCoCo coverage for the Spring API and V8 coverage for the React frontend,
then uploads both reports when `CODECOV_TOKEN` is available. To enable it, install the
Codecov GitHub App for this repository and add the repository upload token as a GitHub
Actions secret named `CODECOV_TOKEN`. For a private repository badge, obtain the separate
badge token from Codecov's **Badges & Graphs** settings and append it as the `token` query
parameter to the coverage badge URL above. Do not use the repository upload token in the
README.

## Documentation

- [Architecture](docs/architecture.md)
- [Development](docs/development.md)
- [Deployment](docs/deployment.md)
- [Spring API service](services/api/README.md)
- [Python model service](services/model-service/README.md)
