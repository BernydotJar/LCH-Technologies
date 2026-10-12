/**
 * GH-24: reconcile a Donna-produced Contact draft against the live form.
 *
 * The assistant owns only the typed six required fields + optional message.
 * Values edited by the visitor on the form always take precedence; neither
 * assistant drafts nor resets may modify the consent checkbox.
 */
import type { DemoRequest } from '../integrations/leadContract.ts';
import {
  CONTACT_FIELDS, normalizeContactDraft,
  type ContactDraft, type ContactField,
} from './semanticContract.ts';

export function reconcileAssistantDraft(
  current: DemoRequest,
  previousAssistantDraft: ContactDraft,
  nextAssistantDraft: ContactDraft,
  userEdited: ReadonlySet<ContactField>,
): DemoRequest {
  const before = normalizeContactDraft(previousAssistantDraft);
  const after = normalizeContactDraft(nextAssistantDraft);
  const next: DemoRequest = { ...current };

  for (const field of CONTACT_FIELDS) {
    const key = field.name;
    if (userEdited.has(key)) continue;

    const nextValue = after[key];
    if (nextValue !== undefined) {
      next[key] = nextValue;
    } else if (before[key] && current[key] === before[key]) {
      // A new Donna conversation clears only its own prior suggestions.
      next[key] = '';
    }
  }

  // Never touch human consent, even when clearing an assistant draft.
  return next;
}
