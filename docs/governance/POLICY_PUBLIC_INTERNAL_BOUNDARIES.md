# Policy Public/Internal Boundaries
- Stable public contracts: normalized decision outcome + reason code compatible with existing wire responses.
- Internal runtime contracts: rule-level evaluators, conflicts, traces.
- Experimental contracts: future policy adapters and inheritance composition.
- Future enterprise control-plane contracts: policy publication lifecycle and delegated admin governance.

Current placement: `runtime/policy/*` is internal-only via `runtime/internal` export.
