# Runtime Health Model

`RuntimeHealthSnapshot` contains:
- status: healthy|degraded|unhealthy|unknown
- startupPosture
- environment classification
- transport/contracts/sdk compatibility versions
- storage mode
- enforcement mode
- warning count
- degraded and strict flags
- generated timestamp

Endpoint: `GET /runtime/health` returns an envelope-compatible snapshot and correlation metadata.
