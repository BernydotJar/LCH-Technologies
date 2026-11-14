# BPCA Technical Lab: public evidence and scope

Captured: 2026-11-14. Target build: Blue Prism 6.5.1.14401. Site route: /productos/bpca#laboratorio-bpca.

## Purpose

A public, read-only engineering walkthrough of an existing, original, synthetic Normalize Text example. It shows the typed Action interface, BPCA CLI commands, recorded static validation results, and a downloadable evidence JSON. The website never runs the private BPCA SDK, compiles Blue Prism XML, uses credentials, or executes a native robot. No client exports or private framework files are published.

## Reproduction

From an authorized bp-coded-agents SDK checkout with the bundled synthetic fixtures and an output directory that does not yet exist:

1. PYTHONPATH=src python3 -m bp_coded_agents doctor
2. PYTHONPATH=src python3 -m bp_coded_agents build-pair --object-spec examples/action-pair/object.json --object-reference examples/fixtures/bp6_5/Synthetic_Object_Shell_BP6_5.bpobject --process-spec examples/action-pair/process.json --process-reference examples/fixtures/bp6_5/Synthetic_NativeBinding_Process.bpprocess --seed lch-static-showcase-20261114 -o ./bpca-lab-output
3. PYTHONPATH=src python3 -m bp_coded_agents verify-action-abi --consumer ./bpca-lab-output/BPCA_Normalize_Text_Process.bpprocess --object-source ./bpca-lab-output/BPCA_Text_Normalizer.bpobject
4. PYTHONPATH=src python3 -m bp_coded_agents resolve-native-deps --consumer ./bpca-lab-output/BPCA_Normalize_Text_Process.bpprocess --object-source ./bpca-lab-output/BPCA_Text_Normalizer.bpobject

The fixed seed is for replay of the synthetic review case only. Do not reuse the stage identities in deployments.

## Results observed in the existing developer checkout

| Gate | Result | What it establishes |
| --- | --- | --- |
| bpca doctor | LOCAL_ONLY | CLI responds; native runtime not bundled |
| bpca build-pair | PASS_STATIC_PAIR_ONLY, exit 0 | Generates candidate Object and Process XML |
| bpca verify-action-abi | PASS_STATIC_ACTION_ABI_ONLY, exit 0 | One Action ABI matched with zero issues |
| bpca resolve-native-deps | NO_GO, exit 2 | Missing destination registry evidence for managed assembly |
| Studio import and Check Code | NOT_RUN | No native certification |
| Native execution and Control Room | NOT_RUN | No observed robot execution |
| Native release | NOT_RUN | No certified release |

Exact blocker: MANAGED_ASSEMBLY_TARGET_REGISTRY_V2_MISSING. This does not mean System.dll is absent from Windows, only that no verifiable destination registry has been supplied.

Replayed twice with the same seed on this checkout, byte-for-byte identical:
- Object SHA-256: 9e2dec8a762d16a9ed215a17c6235959fd2a54a5f4306e81866a3e10f55535ad
- Process SHA-256: e9cf3f8c8224d22abe28b168dbcd4e23d1562edce7d4eeefa50de64af54aa72d

These are local artifact fingerprints, not independently signed approvals. The candidate artifacts are not copied into the LCH public repository.

## Next DEV Studio gate

Review the authorized exact target build, DLL declarations and installed VBOs. Import the Object first, run Check Code, then import the Process, verify Action ports, and execute with a negative test in a real DEV environment. Expected sample output for input containing spaces around 'hello rea' is 'HELLO REA'; this output has NOT been observed in the new native run. Reexport the artifacts and attach independently obtained SHA evidence before declaring runtime acceptance.

## Website tests

Unit and contract tests: tests/bpcaLabContract.test.ts.
Responsive browser checks: scripts/bpca-lab-smoke.cjs on 390px mobile and 1365px desktop (including ES/EN/PT, tab navigation, JSON download and no runtime claims).
CI: .github/workflows/donna-gh24-validation.yml.

All UX operations are local to the browser; the contact CTA uses the existing LCH form. This website change does not modify BPCA itself, Graph Harness, authorization boundaries or production infrastructure. No automatic merge or deployment is part of the feature.
