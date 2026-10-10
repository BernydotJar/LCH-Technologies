import assert from 'node:assert/strict';
import test from 'node:test';
import { extractSemanticContact, readGuidedContactAnswer } from '../src/contact/semanticDraft.ts';
import { reconcileAssistantDraft } from '../src/contact/liveDraft.ts';
import type { DemoRequest } from '../src/integrations/leadContract.ts';

const blank = (): DemoRequest => ({
  nombre: '', apellido: '', email: '', empresa: '', cargo: '',
  interes: '', mensaje: '', consentimiento: false,
});

test('GH-24: common complete Spanish intro maps actual organization and role', () => {
  const proposal = extractSemanticContact(
    'Me llamo Juan Pérez, soy director comercial en Acme, mi correo es juan@acme.com, quiero automatizar mi facturación',
  );
  assert.deepEqual(proposal, {
    email: 'juan@acme.com', nombre: 'Juan', apellido: 'Pérez',
    empresa: 'Acme', cargo: 'director comercial',
    interes: 'Automatización', mensaje: 'quiero automatizar mi facturación',
  });
});

test('GH-24: work-for syntax is not accidentally appended to a surname', () => {
  const value = extractSemanticContact(
    'Soy Eduardo Sacahui y trabajo para LCH Technologies, mi email es eduardo@example.com',
  );
  assert.equal(value.nombre, 'Eduardo');
  assert.equal(value.apellido, 'Sacahui');
  assert.equal(value.empresa, 'LCH Technologies');
  assert.equal(value.email, 'eduardo@example.com');
});

test('GH-24: explicit corporate suffix does not corrupt the surname', () => {
  const value = extractSemanticContact(
    'Mi nombre es Ana Gómez de Zeta Corp, correo ana@zeta.com, necesito una demo de LUMA',
  );
  assert.equal(value.nombre, 'Ana');
  assert.equal(value.apellido, 'Gómez');
  assert.equal(value.empresa, 'Zeta Corp');
  assert.equal(value.interes, 'Software Empresarial');
  assert.equal(value.mensaje, 'necesito una demo de LUMA');
  const surname = extractSemanticContact('Me llamo Juan de la Cruz, gerente de operaciones en ACME');
  assert.equal(surname.apellido, 'de la Cruz');
  assert.equal(surname.empresa, 'ACME');
});

test('GH-24: separated sentences and contact facts do not pollute business description', () => {
  const value = extractSemanticContact(
    'Necesito automatizar inventarios y me llamo Juan Pérez, trabajo en Empresa Uno como gerente',
  );
  assert.equal(value.mensaje, 'Necesito automatizar inventarios');
  assert.equal(value.apellido, 'Pérez');
  assert.equal(value.empresa, 'Empresa Uno');
  const sentences = extractSemanticContact(
    'Mi nombre es María Gómez. Trabajo en Alfa y mi cargo es gerente de operaciones. Correo maria@alfa.com. Necesito optimizar inventario.',
  );
  assert.equal(sentences.apellido, 'Gómez');
  assert.equal(sentences.empresa, 'Alfa');
  assert.equal(sentences.cargo, 'gerente de operaciones');
  assert.equal(sentences.mensaje, 'Necesito optimizar inventario');
});

test('GH-24: other explicitly recognized facts do not get forced into the next guided field', () => {
  assert.deepEqual(readGuidedContactAnswer('empresa', 'Me llamo Ana Pérez'), {
    nombre: 'Ana', apellido: 'Pérez',
  });
  assert.deepEqual(readGuidedContactAnswer('empresa', 'Mi correo es ana@example.com'), {
    email: 'ana@example.com',
  });
});

test('GH-24: assistant fills live form, can revise itself, but never affects consent', () => {
  const first = { nombre: 'Ana', apellido: 'Pérez', email: 'ana@example.com', empresa: 'Acme' };
  const v1 = reconcileAssistantDraft(blank(), {}, first, new Set());
  assert.equal(v1.email, 'ana@example.com');
  assert.equal(v1.empresa, 'Acme');
  assert.equal(v1.consentimiento, false);
  const revised = { ...first, email: 'correcta@example.com', interes: 'Automatización' as const };
  const v2 = reconcileAssistantDraft(v1, first, revised, new Set());
  assert.equal(v2.email, 'correcta@example.com');
  assert.equal(v2.interes, 'Automatización');
  assert.equal(v2.consentimiento, false);
});

test('GH-24: manually edited fields survive assistant revisions and reset', () => {
  const first = { nombre: 'Ana', apellido: 'Pérez', email: 'ana@example.com', empresa: 'Acme' };
  const applied = reconcileAssistantDraft(blank(), {}, first, new Set());
  const edited = { ...applied, nombre: 'Nombre manual', consentimiento: true };
  const human = new Set(['nombre'] as const);
  const after = reconcileAssistantDraft(edited, first, { ...first, nombre: 'Otro nombre', email: 'revised@example.com' }, human);
  assert.equal(after.nombre, 'Nombre manual');
  assert.equal(after.email, 'revised@example.com');
  assert.equal(after.consentimiento, true);
  const reset = reconcileAssistantDraft(after, { ...first, email: 'revised@example.com' }, {}, human);
  assert.equal(reset.nombre, 'Nombre manual');
  assert.equal(reset.email, '');
  assert.equal(reset.apellido, '');
  assert.equal(reset.empresa, '');
  assert.equal(reset.consentimiento, true);
});
