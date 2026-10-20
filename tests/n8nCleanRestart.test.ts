import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const original = JSON.parse(readFileSync(new URL('../workflows/n8n/lch-contact-mail-spark.workflow.json', import.meta.url), 'utf8'));
const clean = JSON.parse(readFileSync(new URL('../workflows/n8n/lch-contact-mail-clean.workflow.json', import.meta.url), 'utf8'));
const nodes = new Map(clean.nodes.map((n: {name: string}) => [n.name,n]));

const getNode = (name: string): any => {
  const n = nodes.get(name);
  assert.ok(n, 'missing node ' + name);
  return n;
};

test('clean cutover has distinct workflow and node identities while keeping Lina completely out of scope', () => {
  assert.equal(clean.id, 'lchContactNotifyClean20261014');
  assert.notEqual(clean.id, original.id);
  assert.notEqual(clean.name, original.name);
  assert.equal(clean.active, false);
  assert.equal(original.active, false);
  assert.equal(clean.nodes.length, 13);
  assert.equal(new Set(clean.nodes.map((n: {id: string}) => n.id)).size, 13);
  assert.ok(clean.nodes.every((n: {id: string}) => !original.nodes.some((o: {id: string}) => o.id === n.id)));
  assert.deepEqual(clean.connections, original.connections);
  assert.ok(!JSON.stringify(clean).includes('Lina · Agenda Orchestrator'));
});

test('fresh workflow cannot execute before a specific future cutover authorization', () => {
  assert.equal(clean.meta.activationPlaceholder, true);
  assert.equal(clean.active, false);
  const code = getNode('Activation UTC').parameters.jsCode;
  assert.match(code, /__REPLACE_WITH_ACTIVATION_UTC__/);
  const result = vm.runInNewContext('(function(){ ' + code + '\n })()', {Date, Number}, {timeout:1000});
  assert.equal(result.length, 0);
  for(const k of ['saveDataSuccessExecution','saveDataErrorExecution'])assert.equal(clean.settings[k], 'none');
  for(const k of ['saveManualExecutions','saveExecutionProgress'])assert.equal(clean.settings[k], false);
  assert.ok(clean.nodes.every((n: {credentials?:unknown}) => !n.credentials));
});

test('fresh workflow maintains Firestore CAS before Outlook and ACK after provider acceptance', () => {
  const names = clean.nodes.map((n: {name: string})=>n.name);
  const order = ['Read Consented Contacts','Prepare eligible leads','Claim Firestore Lease','Confirm Firestore Lease','Outlook Send Four Recipients','Confirm Outlook Accepted','Re-read Firestore Lease','Verify Original Lease','Record Outlook Acceptance'];
  const idx = order.map(x=>names.indexOf(x));
  assert.ok(idx.every((i:number)=>i >= 0));
  assert.ok(idx.every((i:number,pos:number)=>pos===0||i>idx[pos-1]));
  const query = getNode('Read Consented Contacts').parameters;
  assert.equal(query.query, '={{ $json.firestoreQuery }}');
  assert.equal(query.projectId,'rag-municipalidades');
  assert.equal(query.database,'ai-studio-8963e7a3-87ce-4ca9-938c-9490f698d4c7');
  for(const n of ['Claim Firestore Lease','Record Outlook Acceptance']) {
    const p=getNode(n).parameters;
    assert.equal(p.method,'PATCH');
    assert.match(p.url,/currentDocument\.updateTime=/);
    assert.match(p.url,/updateMask\.fieldPaths=notification/);
  }
  assert.equal(getNode('Outlook Send Four Recipients').parameters.additionalFields.from,'contacto@lch-technologies.com');
  assert.equal(getNode('Outlook Send Four Recipients').continueOnFail,true);
});

test('Firestore query is pre-built in Code node and remains fail-closed until activation', () => {
  const source=getNode('Activation UTC').parameters.jsCode;
  assert.match(source, /const firestoreQuery = JSON\.stringify/);
  assert.match(source, /GREATER_THAN_OR_EQUAL/);
  const date='2026-10-13T06:30:00Z';
  const runnable=source.replace('__REPLACE_WITH_ACTIVATION_UTC__', date);
  const res=vm.runInNewContext('(function(){ ' + runnable + '\n })()', {Date,Number,JSON},{timeout:1000});
  assert.equal(res.length,1);
  const query=JSON.parse(res[0].json.firestoreQuery);
  assert.equal(query.structuredQuery.from[0].collectionId,'demoRequests');
  assert.equal(query.structuredQuery.where.fieldFilter.value.timestampValue,date);
  assert.equal(query.structuredQuery.limit,40);
});

test('fresh workflow locks four fixed recipients and excludes arbitrary prospect recipients', () => {
  const code=getNode('Prepare eligible leads').parameters.jsCode;
  for(const recipient of [
    'contacto@lch-technologies.com','eduardo.sacahui@lch-technologies.com',
    'lina.saldarriaga@lchtechnologies.onmicrosoft.com','sara.saldarriaga@lchtechnologies.onmicrosoft.com'
  ]) assert.ok(code.includes(recipient), 'missing recipient ' + recipient);
  assert.match(code,/lead\.consentimiento!==true/);
  assert.match(code,/lead\.source!=='website'/);
  assert.match(code,/\['accepted','blocked','needs_review','invalid'\]/);
  const body=JSON.stringify(clean);
  assert.doesNotMatch(body,/BEGIN (?:RSA |EC )?PRIVATE KEY|"access_token"|"refresh_token"|"client_secret"/i);
  assert.ok(!clean.nodes.some((n: {type: string}) => /webhook/i.test(n.type)));
});
