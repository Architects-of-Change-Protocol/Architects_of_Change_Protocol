# Policy Evaluation Order
1. Sort rules by priority descending then rule id.
2. Evaluate all conditions deterministically.
3. Condition failure returns abstain; condition exception returns indeterminate.
4. Merge effects with deny precedence.
5. Protected operations fail closed on indeterminate.
6. Required categories must have allow match; abstain alone never grants.
7. Aggregate obligations in evaluated rule order.
8. Build ordered trace.
