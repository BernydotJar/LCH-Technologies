import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { bpcaLabCommands, bpcaLabRecord, bpcaPublicEvidenceJson } from '../src/bpca/demoContract.ts';
import { translate, translationExists } from '../src/i18n/messages.ts';

test('BPCA laboratory is anchored to the measured local CLI build, not a claimed Studio runtime', () => {
  assert.equal(bpcaLabRecord.targetBuild, '6.5.1.14401');
  assert.equal(bpcaLabRecord.generatedBy, 'bpca build-pair');
  assert.equal(bpcaLabRecord.evidenceType, 'LOCAL_STATIC_CLI_SAMPLE');
  assert.equal(bpcaLabRecord.gates.build, 'PASS_STATIC_PAIR_ONLY');
  assert.equal(bpcaLabRecord.gates.actionAbi, 'PASS_STATIC_ACTION_ABI_ONLY');
  assert.equal(bpcaLabRecord.gates.dependencies, 'NO_GO');
  assert.equal(bpcaLabRecord.gates.dependencyIssue, 'MANAGED_ASSEMBLY_TARGET_REGISTRY_V2_MISSING');
  for (const key of ['nativeStudioImport', 'nativeCodeCheck', 'nativeExecution', 'nativeRelease'] as const) {
    assert.equal(bpcaLabRecord.gates[key], 'NOT_RUN');
  }
  assert.match(bpcaLabRecord.object, /\.bpobject$/);
  assert.match(bpcaLabRecord.process, /\.bpprocess$/);
  for (const hash of Object.values(bpcaLabRecord.outputSha256)) assert.match(hash, /^[0-9a-f]{64}$/);
});

test('downloaded evidence is a bounded, source-free record and not a native Blue Prism release', () => {
  const json = bpcaPublicEvidenceJson();
  const parsed = JSON.parse(json);
  assert.deepEqual(parsed.gates, bpcaLabRecord.gates);
  assert.equal(parsed.targetBuild, '6.5.1.14401');
  assert.equal(parsed.outputSha256.object, bpcaLabRecord.outputSha256.object);
  assert.equal(parsed.outputSha256.process, bpcaLabRecord.outputSha256.process);
  assert.match(parsed.evidenceBoundary, /no vendor-native verification/i);
  assert.doesNotMatch(json, /"code"\s*:/i);
  assert.doesNotMatch(json, /api[_-]?key|private[_-]?key|password\s*:/i);
  assert.doesNotMatch(json, /\.bprelease/i);
  assert.equal(json.length < 7000, true, 'small public evidence record');
});

test('public commands use real BPCA CLI verbs and never pretend to execute vendor runtime', () => {
  assert.match(bpcaLabCommands.build, /^PYTHONPATH=src python3 -m bp_coded_agents build-pair /);
  assert.match(bpcaLabCommands.build, /--object-reference examples\/fixtures\/bp6_5\/Synthetic_Object_Shell_BP6_5\.bpobject/);
  assert.match(bpcaLabCommands.build, /--process-reference examples\/fixtures\/bp6_5\/Synthetic_NativeBinding_Process\.bpprocess/);
  assert.match(bpcaLabCommands.build, /--seed lch-static-showcase-20261114/);
  assert.match(bpcaLabCommands.actionAbi, / -m bp_coded_agents verify-action-abi /);
  assert.match(bpcaLabCommands.dependencies, / -m bp_coded_agents resolve-native-deps /);
  for (const command of Object.values(bpcaLabCommands)) {
    assert.doesNotMatch(command, /\b(run|import-artifact|publish|importrelease|overwrite|forceid)\b/i);
    assert.doesNotMatch(command, /https?:\/\//i);
  }
});

test('technical lab is linked only from BPCA product profile, without a private-repository CTA', () => {
  const profile = readFileSync(new URL('../src/components/ProductDetailPage.tsx', import.meta.url), 'utf8');
  const catalog = readFileSync(new URL('../src/components/ProductReferences.tsx', import.meta.url), 'utf8');
  const lab = readFileSync(new URL('../src/components/BpcaTechnicalLab.tsx', import.meta.url), 'utf8');
  assert.match(profile, /product\.id === 'bpca' && <BpcaTechnicalLab \/>/);
  assert.match(profile, /data-testid="bpca-lab-cta" href="#laboratorio-bpca"/);
  assert.match(catalog, /href="\/productos\/bpca#laboratorio-bpca"/);
  assert.match(lab, /id="laboratorio-bpca"/);
  assert.match(lab, /data-testid="bpca-download-evidence"/);
  assert.match(lab, /data-testid="bpca-evidence"/);
  assert.doesNotMatch(lab, /fetch\(|<iframe|\/api\/chat|eval\(/);
  assert.doesNotMatch(lab, /https:\/\/github\.com\/BernydotJar\/bp-coded-agents/);
});

test('new interactive controls and evidence boundaries have English and Portuguese translations', () => {
  for (const key of [
    'Laboratorio técnico BPCA',
    'Del contrato al artefacto.',
    'Con evidencia.',
    'Explorar laboratorio técnico',
    'Generar Process + Object',
    'Copiar comando',
    'Copiado',
    'Descargar evidencia JSON',
    'Bloqueo que debe resolverse',
    'No certificado para runtime',
    'La evidencia es de validación estática local. Importación, Check Code y ejecución Blue Prism: NOT_RUN. El estado de dependencias: NO_GO.',
  ]) {
    assert.equal(translationExists(key), true, key);
    assert.ok(translate('en', key).length > 1, 'English: ' + key);
    assert.ok(translate('pt', key).length > 1, 'Portuguese: ' + key);
    if (key !== 'Copiar comando' && key !== 'Copiado') {
      assert.notEqual(translate('en', key), key, 'English: ' + key);
      assert.notEqual(translate('pt', key), key, 'Portuguese: ' + key);
    }
  }
});
