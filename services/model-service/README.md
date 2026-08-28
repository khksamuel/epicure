# Python model service

This internal service preserves the released Epicure Python interface and serves
Cooc, Core, and Chem to the Spring application. It is not the system of record for
users, recipes, or ingredients.

## Compatible Python usage

```python
from epicure import Epicure

model = Epicure.from_pretrained("Kaikaku/epicure-core")
model.neighbors("chicken", k=5)
model.slerp("rice", "cuisine:South_Asian", theta_deg=30, k=5)
model.closest_mode("miso", kind="factor", k=3)
```

`from_pretrained` also accepts a local directory containing the five compatible
runtime artifacts.

## Commands

```powershell
python -m venv .venv
.\.venv\Scripts\python -m pip install -e ".[dev]"
.\.venv\Scripts\python -m ruff check src tests
.\.venv\Scripts\python -m pytest
.\.venv\Scripts\python -m uvicorn epicure_backend.app:app --host 127.0.0.1 --port 8000
```

The FastAPI schema is available internally at `/docs`. Models load lazily and are
cached both by Hugging Face and in the running process.
`requirements.lock` pins the complete development and CI dependency graph.
