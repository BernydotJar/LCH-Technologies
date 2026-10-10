import assert from 'node:assert/strict';
import test from 'node:test';
import {
  firestoreBase, decodeFields, listRecentLeads,
  patchNotification, readLead, notificationField, isFirestoreConflict,
} from '../src/firestore.mjs';

const base = firestoreBase('rag-municipalidades', 'ai-studio-8963e7a3-87ce-4ca9-938c-9490f698d4c7');
const docName = base + '/demoRequests/lead_example_88';
const time = '2026-10-10T15:05:00.123Z';

test('GH-25 Firestore REST is hard scoped to existing named free-tier DB', () => {
  assert.match(base, /rag-municipalidades\/databases\/ai-studio-8963e7a3-87ce-4ca9-938c-9490f698d4c7\/documents$/);
  assert.throws(() => firestoreBase('wrong-project', 'ai-studio-8963e7a3-87ce-4ca9-938c-9490f698d4c7'));
  assert.throws(() => firestoreBase('rag-municipalidades', '(default)'));
});

test('GH-25 Firestore decoder reads only encoded known wire values', () => {
  assert.deepEqual(decodeFields({
    source: { stringValue: 'website' },
    consentimiento: { booleanValue: true },
    createdAt: { timestampValue: time },
    attempts: { integerValue: '2' },
    notification: { mapValue: { fields: { state: { stringValue: 'accepted' }, attempts: { integerValue: '1' } } } },
  }), { source: 'website', consentimiento: true, createdAt: time, attempts: 2, notification: { state: 'accepted', attempts: 1 } });
});

test('GH-25 read-only Firestore runQuery filters by launch timestamp and pages in descending order', async () => {
  let calls = 0;
  const docs = await listRecentLeads({
    base, token: 'fake-google-oauth-token', since: '2026-10-10T14:00:00Z', offset: 40, limit: 2,
    fetchImpl: async (url, opts) => {
      calls++;
      assert.equal(url, base + ':runQuery');
      assert.equal(opts.method, 'POST');
      assert.equal(opts.headers.authorization, 'Bearer fake-google-oauth-token');
      const query = JSON.parse(opts.body).structuredQuery;
      assert.equal(query.from[0].collectionId, 'demoRequests');
      assert.equal(query.where.fieldFilter.field.fieldPath, 'createdAt');
      assert.equal(query.where.fieldFilter.op, 'GREATER_THAN_OR_EQUAL');
      assert.equal(query.where.fieldFilter.value.timestampValue, '2026-10-10T14:00:00Z');
      assert.equal(query.orderBy[0].direction, 'DESCENDING');
      assert.equal(query.orderBy[1].field.fieldPath, '__name__');
      assert.equal(query.limit, 2);
      assert.equal(query.offset, 40);
      return { ok: true, json: async () => [
        { document: { name: docName, updateTime: time, fields: {
          source: { stringValue: 'website' }, createdAt: { timestampValue: time },
          consentimiento: { booleanValue: true },
        } } },
        { readTime: time },
      ] };
    },
  });
  assert.equal(calls, 1);
  assert.equal(docs.length, 1);
  assert.equal(docs[0].id, 'lead_example_88');
  assert.equal(docs[0].fields.consentimiento, true);
  await assert.rejects(() => listRecentLeads({ base, token: 'fake', since: 'invalid' }), /invalid_launch_time/);
});

test('GH-25 conditional Firestore patch changes only notification field and checks updateTime', async () => {
  const state = { provider: 'microsoft_graph', state: 'sending', attempts: 2, leaseUntilMs: 1800, leaseId: 'uuid-test', errorCode: null };
  const patched = await patchNotification({ base, token: 'fake', document: docName, updateTime: time, notification: state,
    fetchImpl: async (url, options) => {
      const requestUrl = new URL(url);
      assert.equal(requestUrl.searchParams.get('updateMask.fieldPaths'), 'notification');
      assert.equal(requestUrl.searchParams.get('currentDocument.updateTime'), time);
      assert.equal(options.method, 'PATCH');
      assert.equal(options.headers.authorization, 'Bearer fake');
      const body = JSON.parse(options.body);
      assert.deepEqual(Object.keys(body.fields), ['notification']);
      assert.equal(body.fields.notification.mapValue.fields.state.stringValue, 'sending');
      assert.equal(body.fields.notification.mapValue.fields.attempts.integerValue, '2');
      assert.equal(body.fields.notification.mapValue.fields.errorCode.nullValue, null);
      return { ok: true, json: async () => ({ updateTime: '2026-10-10T15:06:00Z' }) };
    },
  });
  assert.equal(patched.updateTime, '2026-10-10T15:06:00Z');
  assert.equal(isFirestoreConflict(412), true);
  assert.equal(isFirestoreConflict(403), false);
  assert.equal(isFirestoreConflict({ status: 400, remoteCode: 'FAILED_PRECONDITION' }), true);
  assert.equal(isFirestoreConflict({ status: 400, remoteCode: 'INVALID_ARGUMENT' }), false);
  assert.equal(notificationField({ state: 'accepted' }).mapValue.fields.state.stringValue, 'accepted');
});

test('GH-25 REST decoder supports conditional finalization after concurrent edits', async () => {
  let calls = 0;
  const record = await readLead({ base, token: 'fake', document: docName, fetchImpl: async (url, options) => {
    calls++;
    assert.equal(url, docName);
    assert.equal(options.method, 'GET');
    return { ok: true, json: async () => ({
      updateTime: '2026-10-10T15:09:00Z', fields: {
        automationStatus: { stringValue: 'processed' },
        notification: { mapValue: { fields: { state: { stringValue: 'sending' }, leaseId: { stringValue: 'id' } } } },
      },
    }) };
  } });
  assert.equal(calls, 1);
  assert.equal(record.fields.automationStatus, 'processed');
  assert.equal(record.fields.notification.leaseId, 'id');
});


test('GH-25 Firestore REST canonical FAILED_PRECONDITION is a conflict, not a resend', async () => {
  await assert.rejects(() => patchNotification({
    base, token: 'mock', document: docName, updateTime: time,
    notification: { state: 'sending' },
    fetchImpl: async () => ({ ok: false, status: 400, json: async () => ({ error: { status: 'FAILED_PRECONDITION', message: 'expected version mismatch' } }) }),
  }), (error) => error.status === 400 && error.remoteCode === 'FAILED_PRECONDITION' && isFirestoreConflict(error));
});
