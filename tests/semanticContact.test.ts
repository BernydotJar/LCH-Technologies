import assert from 'node:assert/strict';
import test from 'node:test';

import {
  applyContactDraft, CONTACT_FIELD_NAMES, CONTACT_FIELDS,
  CONTACT_REQUIRED_FIELDS, countContactFields, mergeContactDraft, missingContactFields,
  normalizeContactDraft, PREPARE_CONTACT_TOOL,
} from '../src/contact/semanticContract.ts';
import {
  containsPersonalContactData, extractFromDonnaMessages,
  extractSemanticContact, inferContactInterest, readGuidedContactAnswer,
  safeContactMessageFromConversation,
} from '../src/contact/semanticDraft.ts';

test('GH-22 semantic tool advertises ONLY exact existing form fields and no submit/consent', () => {
  const expected = ['nombre', 'apellido', 'email', 'empresa', 'cargo', 'interes', 'mensaje'];
  assert.deepEqual([...CONTACT_FIELD_NAMES].sort(), expected.sort());
  assert.equal(PREPARE_CONTACT_TOOL.name, 'prepare_lch_contact_form');
  assert.equal(PREPARE_CONTACT_TOOL.inputSchema.additionalProperties, false);
  assert.deepEqual(Object.keys(PREPARE_CONTACT_TOOL.inputSchema.properties).sort(), expected);
  assert.equal(CONTACT_REQUIRED_FIELDS.length, 6);
  assert.equal(CONTACT_FIELDS.every((item) => item.maxLength > 0 && item.description && item.question), true);
  const schema = JSON.stringify(PREPARE_CONTACT_TOOL.inputSchema);
  assert.doesNotMatch(schema, /consentimiento|telefono|teléfono|submit|enviar/iu);
});

test('GH-22 literal Spanish contact sentence extracts explicit values only', () => {
  const value = extractSemanticContact(
    'Me llamo Ana Perez, soy directora de operaciones, trabajo en Acme y necesito automatizar facturas, mi correo es ana@acme.com',
  );
  assert.deepEqual(value, {
    nombre: 'Ana',
    apellido: 'Perez',
    email: 'ana@acme.com',
    empresa: 'Acme',
    cargo: 'directora de operaciones',
    interes: 'Automatización',
    mensaje: 'necesito automatizar facturas',
  });
});

test('GH-22 extracts executive role in separate clause without inventing company', () => {
  const value = extractSemanticContact(
    'Soy Carlos Alvarez, CTO en LexTech, correo carlos@lextech.com, quiero inteligencia artificial para consultar documentos',
  );
  assert.equal(value.nombre, 'Carlos');
  assert.equal(value.apellido, 'Alvarez');
  assert.equal(value.cargo, 'CTO');
  assert.equal(value.empresa, 'LexTech');
  assert.equal(value.interes, 'Inteligencia Artificial');
});

test('GH-22 multi-turn partial contact merges and supports guided replies', () => {
  const partial = extractFromDonnaMessages([
    { role: 'assistant', content: 'Mi correo es bot@not-allowed.example, nombre supuesto Falso' },
    { role: 'user', content: 'Mi nombre es Maria Lopez y mi correo es maria@example.com' },
    { role: 'user', content: 'Represento a Empresa Global y quiero automatizar procesos' },
  ]);
  assert.equal(partial.email, 'maria@example.com');
  assert.equal(partial.nombre, 'Maria');
  assert.equal(partial.apellido, 'Lopez');
  assert.equal(partial.empresa, 'Empresa Global');
  assert.equal(partial.interes, 'Automatización');
  assert.equal(partial.cargo, undefined);
  const answered = mergeContactDraft(partial, readGuidedContactAnswer('cargo', 'Directora de operaciones'));
  assert.equal(answered.cargo, 'Directora de operaciones');
  assert.equal(missingContactFields(answered).length, 0);
  assert.equal(countContactFields(answered), 6);
});

test('GH-22 guided mode can start with a full name or one name and requests missing fields', () => {
  assert.deepEqual(readGuidedContactAnswer('nombre', 'Ana Perez'), { nombre: 'Ana', apellido: 'Perez' });
  assert.deepEqual(readGuidedContactAnswer('nombre', 'Ana'), { nombre: 'Ana' });
  assert.deepEqual(readGuidedContactAnswer('apellido', 'Perez Garcia'), { apellido: 'Perez Garcia' });
  assert.deepEqual(readGuidedContactAnswer('email', 'invalid-no-at'), {});
  assert.deepEqual(readGuidedContactAnswer('email', 'ana@example.com'), { email: 'ana@example.com' });
  assert.deepEqual(readGuidedContactAnswer('empresa', 'Acme'), { empresa: 'Acme' });
  assert.deepEqual(readGuidedContactAnswer('interes', 'otro'), { interes: 'Otro' });
  assert.equal(missingContactFields({ nombre: 'Ana', apellido: 'Perez' })[0].name, 'email');
});

test('GH-22 rejects unknown, oversized and consent values from tools', () => {
  const cleaned = normalizeContactDraft({
    nombre: ' Lucia ',
    empresa: 'Enterprise',
    email: 'bad-email',
    cargo: 'X'.repeat(250),
    interes: 'Weapons',
    consentimiento: true,
    telefono: '68899999',
    status: 'new',
  });
  assert.deepEqual(cleaned, { nombre: 'Lucia', empresa: 'Enterprise' });
  const previous = { nombre: 'Ana' };
  assert.deepEqual(mergeContactDraft(previous, { nombre: 'Ana Nueva', consentimiento: true }), { nombre: 'Ana Nueva' });
});

test('GH-22 preserves human edits and never marks consent on handoff', () => {
  const human = {
    nombre: 'Nombre escrito por persona',
    apellido: '',
    email: '',
    empresa: '',
    cargo: '',
    interes: '',
    mensaje: '',
    consentimiento: false,
  };
  const result = applyContactDraft(human, {
    nombre: 'Nombre propuesto',
    apellido: 'Perez',
    email: 'ana@example.com',
    consentimiento: true,
    mensaje: 'automatizar contratos',
  });
  assert.equal(result.nombre, human.nombre);
  assert.equal(result.apellido, 'Perez');
  assert.equal(result.email, 'ana@example.com');
  assert.equal(result.consentimiento, false);
  assert.equal(result.mensaje, 'automatizar contratos');
});

test('GH-22 does not generate missing names, roles or company from a question', () => {
  const data = extractSemanticContact('¿Cómo pueden automatizar tareas manuales con IA?');
  assert.equal(data.nombre, undefined);
  assert.equal(data.apellido, undefined);
  assert.equal(data.email, undefined);
  assert.equal(data.empresa, undefined);
  assert.equal(data.cargo, undefined);
  assert.equal(inferContactInterest('software e inteligencia artificial'), undefined);
  assert.deepEqual(extractSemanticContact('Mi telefono es 68899999, autorizo el tratamiento de datos'), {});
  assert.equal(extractSemanticContact('Soy una empresa').nombre, undefined);
  assert.deepEqual(readGuidedContactAnswer('cargo', 'CEO de ...'), { cargo: 'CEO' });
});

test('GH-22 sensitive contact text is not duplicated as free-form business message', () => {
  assert.equal(containsPersonalContactData('mi correo es ana@example.com'), true);
  assert.equal(safeContactMessageFromConversation('Mi correo es ana@example.com'), '');
  assert.equal(safeContactMessageFromConversation('Me llamo Ana y necesito automatizar facturas'), 'necesito automatizar facturas');
  assert.equal(safeContactMessageFromConversation('Soy Ana Perez'), '');
  assert.equal(safeContactMessageFromConversation('Necesito automatizar facturas y mi teléfono es 68899999'), 'Necesito automatizar facturas');
  assert.equal(safeContactMessageFromConversation('¿Qué soluciones de IA ofrece LCH?'), '¿Qué soluciones de IA ofrece LCH?');
});

test('GH-22 all production builds invoke Firebase configuration guard BEFORE bundling', async () => {
  const { readFileSync } = await import('node:fs');
  const packageFile = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  assert.match(packageFile.scripts.build, /^node scripts\/check-production-env\.mjs && vite build/);
  assert.equal(packageFile.scripts['build:deploy'], 'npm run build');
});
