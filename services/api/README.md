# Spring API service

This is the public Epicure platform backend. It exposes model exploration and
comparison endpoints and delegates numerical inference through
`ModelInferencePort`.

## Structure

```text
src/main/java/com/epicure/platform/
├── web/             REST controllers, DTOs, exception handling
├── application/     use cases and inference port
├── domain/          model-independent business types
└── infrastructure/  Python model-service HTTP adapter
```

## Commands

```powershell
.\mvnw.cmd test
.\mvnw.cmd spring-boot:run
.\mvnw.cmd package
```

Configuration is in `src/main/resources/application.yml`. Override the internal
model-service address with `EPICURE_MODEL_SERVICE_BASE_URL`.
Connection and response limits are configurable with
`EPICURE_MODEL_SERVICE_CONNECT_TIMEOUT` and `EPICURE_MODEL_SERVICE_READ_TIMEOUT`.

Only the Actuator health endpoint is exposed under `/actuator/health`, without
component details. The public application listens on port 8080 by default.

The chef workflow is available at `POST /v1/creative/recipe-ideas`. It accepts a
recipe title and ingredient list, then returns familiar, balanced, and surprising
ingredient ideas generated from the Cooc, Core, and Chem model views.

Interactive API documentation is available at `/swagger-ui/index.html`, with the
generated OpenAPI document available at `/v3/api-docs`.

ArchUnit tests preserve the dependency direction from web to application and
from infrastructure adapters toward application ports. Transport DTOs must not
leak into application services.
