# Policy Engine Architecture
This pass introduces a lightweight, deterministic policy semantics layer that normalizes governance decisions without replacing existing capability/consent/trust engines. It uses internal types (`runtime/policy/types.ts`) and deterministic evaluators (`runtime/policy/evaluation.ts`) with compatibility shims at route decision derivation.
