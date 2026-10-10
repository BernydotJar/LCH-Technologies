/**
 * Reconcile a Donna-produced Contact draft against the form.
 * Assistant-owned fields may be corrected or reset. Human edits always win.
 * consentimiento is deliberately absent from the typed contract.
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
    const value = after[key];
    if (value !== undefined) {
      next[key] = value;
    } else if (before[key] && current[key] === before[key]) {
      next[key] = '';
    }
  }
  return next;
}
