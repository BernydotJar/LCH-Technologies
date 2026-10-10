import json
import sqlite3
import tempfile
import unittest
from pathlib import Path
import sys
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
from lch_n8n_release_preflight import audit, WORKFLOW_ID, FIRESTORE_NODES, OUTLOOK_NODE

SOURCE = Path(__file__).resolve().parents[1] / 'workflows/n8n/lch-contact-mail-spark.workflow.json'


class ReleasePreflightTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.db = Path(self.tmp.name) / 'instance.sqlite'
        self.workflow = json.loads(SOURCE.read_text())
        self.conn = sqlite3.connect(self.db)
        self.conn.executescript('''CREATE TABLE workflow_entity(id TEXT PRIMARY KEY, nodes TEXT, active INTEGER);
            CREATE TABLE credentials_entity(id TEXT PRIMARY KEY, type TEXT);''')
        self.persist()

    def tearDown(self):
        self.conn.close()
        self.tmp.cleanup()

    def persist(self, enabled=False):
        self.conn.execute('INSERT OR REPLACE INTO workflow_entity VALUES(?,?,?)',
                          (WORKFLOW_ID, json.dumps(self.workflow['nodes']), int(enabled)))
        self.conn.commit()

    def test_initial_state_is_blocked_without_secrets_or_activation(self):
        result = audit(str(self.db))
        self.assertFalse(result['ready'])
        self.assertIn('outlook_credential_not_bound', result['blockers'])
        self.assertIn('google_firestore_credential_not_bound', result['blockers'])
        self.assertIn('activation_time_not_configured', result['blockers'])
        self.assertIn('workflow_not_active', result['blockers'])
        self.assertNotIn('clientSecret', json.dumps(result))

    def test_unbound_credentials_are_insufficient(self):
        self.conn.executemany('INSERT INTO credentials_entity VALUES(?,?)', [('g-1', 'googleApi'), ('m-1', 'microsoftOutlookOAuth2Api')])
        self.conn.commit()
        result = audit(str(self.db))
        self.assertIn('google_firestore_credential_not_bound', result['blockers'])
        self.assertIn('outlook_credential_not_bound', result['blockers'])

    def test_configuration_can_be_ready_but_does_not_prove_inbox_receipt(self):
        self.conn.executemany('INSERT INTO credentials_entity VALUES(?,?)', [('g-1', 'googleApi'), ('m-1', 'microsoftOutlookOAuth2Api')])
        for node in self.workflow['nodes']:
            if node['name'] in FIRESTORE_NODES:
                node['credentials'] = {'googleApi': {'id': 'g-1', 'name': 'Google API'}}
            if node['name'] == OUTLOOK_NODE:
                node['credentials'] = {'microsoftOutlookOAuth2Api': {'id': 'm-1', 'name': 'Outlook'}}
            if node['name'] == 'Activation UTC':
                node['parameters']['jsCode'] = node['parameters']['jsCode'].replace('__REPLACE_WITH_ACTIVATION_UTC__', '2026-10-10T21:00:00Z')
        self.persist(enabled=True)
        result = audit(str(self.db))
        self.assertTrue(result['ready'])
        self.assertFalse(result['live_receipts_verified'])

    def test_wrong_revision_blocks_a_workflow_even_if_active(self):
        self.workflow['nodes'].pop()
        self.persist(enabled=True)
        self.assertIn('workflow_revision_mismatch', audit(str(self.db))['blockers'])


if __name__ == '__main__':
    unittest.main()
