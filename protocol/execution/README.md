# Protocol Execution Layer (PR4)

Esta capa implementa el **handoff canónico de autorización de ejecución** entre AOC y market makers/adapters.

## Qué hace

- Recibe un `ExecutionRequest` canónico.
- Normaliza y valida fail-closed el request.
- Ejecuta evaluación contra `evaluateEnforcement(...)` como fuente única de decisión.
- Devuelve un `ExecutionAuthorizationResult` estructurado.
- Cuando autoriza, construye un `ExecutionContract` canónico para handoff a adapters externos.

## Qué NO hace (en esta fase)

- No ejecuta side effects reales.
- No integra cloud providers.
- No implementa networking/API REST.
- No registra auditoría persistente.
- No agrega colas, workers ni orchestration async.

## Responsabilidades arquitectónicas

- **AOC core protocol**: decide canónicamente si una ejecución está autorizada.
- **Market makers/adapters**: ejecutan acciones reales fuera del core.
- **Execution layer**: puente formal entre decisión protocolar y ejecución externa, sin centralizar runtime de side effects.

## Contrato de salida

Cuando `authorized = true`, el resultado incluye `execution_contract` con:

- `adapter`
- `operation`
- `subject`
- `grantee`
- `allowed_scope`
- `allowed_permissions`
- `capability_hash`
- `parent_consent_hash`
- `issued_at`

y opcionalmente `marketMakerId`, `resource`, `action_context`.
