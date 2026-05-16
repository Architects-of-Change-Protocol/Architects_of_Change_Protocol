# Runtime Compatibility Handshake

`GET /runtime/handshake`

Returns `RuntimeHandshakeEnvelope`:
- `transportVersion`
- `runtimeVersion`
- `supportedModes`
- `supportedEndpoints`

SDK compares handshake `transportVersion` to `RUNTIME_TRANSPORT_VERSION`.
