/**
 * Public, sanitized evidence snapshot from an authorized local BPCA CLI
 * exercise. This module never runs the proprietary SDK or creates BP XML.
 * Evidence describes STATIC validation only. Do not repurpose as Studio proof.
 */
export const bpcaLabRecord = {
  schema: 'lch.bpca.technical-lab.v1',
  capturedAt: '2026-11-14',
  evidenceType: 'LOCAL_STATIC_CLI_SAMPLE',
  scenario: 'Normalize Text',
  targetBuild: '6.5.1.14401',
  object: 'BPCA_Text_Normalizer.bpobject',
  process: 'BPCA_Normalize_Text_Process.bpprocess',
  action: 'Normalize Text',
  inputPort: 'InputText: text',
  outputPort: 'NormalizedText: text',
  sampleInput: '  hello rea  ',
  expectedOutputIfNativeValidated: 'HELLO REA',
  seed: 'lch-static-showcase-20261114',
  generatedBy: 'bpca build-pair',
  gates: {
    build: 'PASS_STATIC_PAIR_ONLY',
    actionAbi: 'PASS_STATIC_ACTION_ABI_ONLY',
    dependencies: 'NO_GO',
    dependencyIssue: 'MANAGED_ASSEMBLY_TARGET_REGISTRY_V2_MISSING',
    nativeStudioImport: 'NOT_RUN',
    nativeCodeCheck: 'NOT_RUN',
    nativeExecution: 'NOT_RUN',
    nativeRelease: 'NOT_RUN',
  },
  outputSha256: {
    object: '9e2dec8a762d16a9ed215a17c6235959fd2a54a5f4306e81866a3e10f55535ad',
    process: 'e9cf3f8c8224d22abe28b168dbcd4e23d1562edce7d4eeefa50de64af54aa72d',
  },
  limits: [
    'Source files are generated only by the private BPCA CLI in an authorized local workspace.',
    'The sample has not been imported, compiled, or executed in a Blue Prism Studio DEV runtime.',
    'The target System.dll reference is not verified against a destination registry.',
    'The browser does not execute BPCA, handle credentials, or download Blue Prism runtime artifacts.',
    'SHA-256 values identify the recorded local candidate, not a certified or independently signed release.',
  ],
} as const;

const sourceRoot = 'examples/action-pair/';
const outputDir = './bpca-lab-output';
const objectFile = outputDir + '/' + bpcaLabRecord.object;
const processFile = outputDir + '/' + bpcaLabRecord.process;

/** Commands are intentionally the actual published CLI interface. */
export const bpcaLabCommands = {
  build: [
    'PYTHONPATH=src python3 -m bp_coded_agents build-pair',
    '--object-spec ' + sourceRoot + 'object.json',
    '--object-reference examples/fixtures/bp6_5/Synthetic_Object_Shell_BP6_5.bpobject',
    '--process-spec ' + sourceRoot + 'process.json',
    '--process-reference examples/fixtures/bp6_5/Synthetic_NativeBinding_Process.bpprocess',
    '--seed ' + bpcaLabRecord.seed,
    '-o ' + outputDir,
  ].join(' '),
  actionAbi: [
    'PYTHONPATH=src python3 -m bp_coded_agents verify-action-abi',
    '--consumer ' + processFile,
    '--object-source ' + objectFile,
  ].join(' '),
  dependencies: [
    'PYTHONPATH=src python3 -m bp_coded_agents resolve-native-deps',
    '--consumer ' + processFile,
    '--object-source ' + objectFile,
  ].join(' '),
} as const;

export function bpcaPublicEvidenceJson(): string {
  return JSON.stringify({
    ...bpcaLabRecord,
    commands: bpcaLabCommands,
    evidenceBoundary: 'Local static engineering evidence; no vendor-native verification or production approval',
  }, null, 2) + '\n';
}
