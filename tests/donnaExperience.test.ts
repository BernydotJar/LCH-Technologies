import assert from 'node:assert/strict';
import test from 'node:test';
import { contextualPrompts, DONNA_IDEAS, DONNA_IDEA_ROTATION_MS } from '../src/donna/experience.ts';
import { DONNA_LIMITS, respondToDonna } from '../src/donna/engine.ts';
import type { InterestArea } from '../src/integrations/leadContract.ts';

const ask = (message: string) => respondToDonna([{ role: 'user', content: message }]);

test('GH-21 uses only bounded, curated LCH product ideas', () => {
  assert.ok(DONNA_IDEAS.length >= 4 && DONNA_IDEAS.length <= 6);
  assert.ok(DONNA_IDEA_ROTATION_MS >= 5000);
  assert.equal(new Set(DONNA_IDEAS.map((idea) => idea.id)).size, DONNA_IDEAS.length);
  for (const idea of DONNA_IDEAS) {
    assert.ok(idea.eyebrow.length > 0 && idea.question.length > 0);
    assert.ok(idea.context.length > 0 && idea.action.length > 0);
    assert.ok(idea.prompt.length <= DONNA_LIMITS.maxMessageChars);
    const response = ask(idea.prompt);
    assert.equal(response.kind, 'grounded', idea.id);
    assert.equal(response.suggestedInterest, idea.expectedInterest, `Wrong target interest: ${idea.id}`);
    const text = JSON.stringify(idea).toLowerCase();
    assert.doesNotMatch(text, /cadre|claude|100\+|50\+ companies|guaranteed return/i);
  }
});

test('GH-21 followups remain grounded and never send arbitrary instructions', () => {
  const interests: InterestArea[] = [
    'Automatización', 'Inteligencia Artificial', 'Software Empresarial', 'Cloud', 'LCH Evidence AI',
  ];
  for (const interest of interests) {
    const suggestions = contextualPrompts('grounded', interest, 'Me interesa esta solución');
    assert.ok(suggestions.length >= 1 && suggestions.length <= 2, interest);
    for (const suggestion of suggestions) {
      assert.ok(suggestion.label && suggestion.message);
      const result = ask(suggestion.message);
      assert.equal(result.kind, 'grounded', `${interest} -> ${suggestion.message}`);
      assert.notEqual(result.suggestedInterest, 'Otro', `Generic misroute from ${interest}: ${suggestion.message}`);
      assert.doesNotMatch(suggestion.message, /password|contraseña|costo exacto|precio garantizado/i);
    }
  }
});

test('GH-21/23 keeps price and privacy refusals free of prompts, but offers grounded topic clarifications', () => {
  for (const kind of ['redirect', 'decline'] as const) {
    assert.deepEqual(contextualPrompts(kind, 'Inteligencia Artificial', '¿Cuánto cuesta?'), []);
  }
  const options = contextualPrompts('clarify', 'Otro', '¿De qué habla LCH?');
  assert.ok(options.length >= 2);
  for (const option of options) assert.equal(ask(option.message).kind, 'grounded');
  assert.deepEqual(contextualPrompts('grounded', 'Otro', '¿Qué haces con mis datos?'), []);
  assert.deepEqual(contextualPrompts(undefined, undefined, ''), []);
});

test('GH-21 does not suggest a duplicate of the exact last message', () => {
  const first = contextualPrompts('grounded', 'Inteligencia Artificial', '');
  assert.equal(first.length, 2);
  const filtered = contextualPrompts('grounded', 'Inteligencia Artificial', first[0].message);
  assert.ok(filtered.every((item) => item.message !== first[0].message));
});

test('GH-21 greeting suggestions are stable, grounded, and optional', () => {
  const suggestions = contextualPrompts('greeting', 'Otro', 'Hola');
  assert.equal(suggestions.length, 2);
  assert.ok(suggestions.every((prompt) => ask(prompt.message).kind === 'grounded'));
});
