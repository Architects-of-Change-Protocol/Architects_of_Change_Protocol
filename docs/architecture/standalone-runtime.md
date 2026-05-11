# Standalone Runtime Architecture

AOC Runtime is a modular substrate split into typed contracts, provider interfaces, and focused runtimes.

## Layering

1. **Contracts layer**: `shared-types`
2. **Provider layer**: `provider-interfaces`
3. **Runtime primitives**: governance/capability/consent/audit/vault/portable-cognition
4. **Application adapters**: PMFreak and future apps
