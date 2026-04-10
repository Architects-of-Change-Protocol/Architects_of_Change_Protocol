# AOC Protocol Capability Lifecycle (Core)

`protocol/capability` implementa el lifecycle protocolar de Capability Tokens como una derivación estricta de consentimiento (`protocol/consent`).

## Qué es un Capability Token en AOC

Un capability token es un objeto verificable y determinístico que representa permisos ejecutables **derivados** de un consentimiento válido.

No es una reinterpretación libre del market maker: el token está limitado por el consentimiento padre.

## Invariantes garantizadas

- **Derivación estricta**: scope y permissions siempre deben ser subconjunto del consent.
- **Binding fuerte**: `subject`, `grantee` y `marketMakerId` (si aplica) heredan del consent.
- **Integridad verificable**: `capability_hash` se recomputa sobre canonical JSON + SHA-256.
- **Temporal fail-closed**: `expires_at`, `not_before`, `issued_at` deben cumplir orden estricto.
- **Lifecycle explícito**: `active`, `expired`, `not_yet_active`, `revoked`, `invalid`.
- **Access fail-closed**: cualquier ambigüedad, mismatch o estado no activo devuelve deny (`false`).

## Qué NO hace todavía

Este módulo de core logic **no** implementa todavía:

- enforcement externo contra Vault
- audit trail completo de decisiones
- SDK público final
- networking o APIs

## API principal

- `mintCapability(...)`
- `verifyCapability(...)`
- `evaluateCapabilityState(...)`
- `evaluateCapabilityAccess(...)`
