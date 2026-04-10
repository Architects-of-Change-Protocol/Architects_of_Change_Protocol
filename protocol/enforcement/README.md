# Protocol Enforcement Runtime

## Propósito

`protocol/enforcement` implementa la capa runtime de enforcement del protocolo AOC.
Recibe solicitudes de acceso/acción, valida capability tokens, evalúa su estado y emite una decisión canónica, determinista y fail-closed.

## Relación con Capability Layer

El enforcement runtime envuelve la capa `protocol/capability` como fuente única para:

- `verifyCapability(...)`
- `evaluateCapabilityState(...)`
- `evaluateCapabilityAccess(...)`

La capa de enforcement no reimplementa lifecycle de capability: agrega normalización del request y construcción de decisiones estructuradas reutilizables.

## Salida canónica

La función principal `evaluateEnforcement(...)` devuelve un `EnforcementDecision` con:

- `allowed` + `decision`
- `reason_code` canónico
- `reasons` detallados
- `evaluated_at`
- request/capability normalizados y matches evaluados cuando aplica

## Qué **no** hace todavía

Este runtime está limitado a core decision logic. No incluye:

- side effects reales de ejecución
- networking / API pública
- SDK final
- audit trail persistente
- storage providers externos
- policy marketplace complejo

Los market makers/adapters ejecutan acciones fuera del core; el core solo decide.
