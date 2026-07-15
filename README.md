# Architects of Change Protocol

AOC Protocol defines the semantic contract layer for programmable authority.

This repository contains protocol-level concepts such as:

- capability semantics
- delegation semantics
- policy decision contracts
- actor and subject models
- audit lineage contracts
- SDK/API interface types

This repository is not the enterprise runtime implementation.

## Layering

- AOC Protocol: contracts, semantics, interfaces
- AOC Enterprise: runtime, persistence, APIs, SDK implementation
- PMFreak: vertical PM product consuming AOC layers

## Current status

Initial copy-first extraction from PMFreak. Some files may still contain runtime dependency references and must be cleaned through adapter interfaces before this package is treated as runtime-independent.

## License

Except where expressly stated otherwise, AOC Protocol is licensed under the
Apache License, Version 2.0. See [LICENSE](./LICENSE) and [NOTICE](./NOTICE).

The contents of [`enterprise/`](./enterprise/) are proprietary, are expressly
excluded from the Apache License, Version 2.0, and may not be used, copied,
modified, distributed, sublicensed, published, or commercialized without a
separate written agreement with the copyright owner. See
[`enterprise/LICENSE`](./enterprise/LICENSE).
