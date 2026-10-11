"""Adversarial fixtures for Mac n8n inactive import guard."""
import copy
import importlib.util
import sqlite3
import tempfile
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'scripts/lch_n8n_workflow_guard.py'
spec = importlib.util.spec_from_file_location('guard', SRC)
guard = importlib.util.module_from_spec(spec)
spec.loader.exec_module(guard)
WORKFLOW = guard.parse(ROOT / 'workflows/n8n/lch-contact-mail-spark.workflow.json')[0]


class WorkflowImportGuardTests(unittest.TestCase):
    def setUp(self):
        self.lina = {
            'id': 'linaAgendaOrchestrator01',
            'name': 'Lina Agenda Orchestrator',
            'active': True, 'nodes': [{'name': 'Existing Lina Node', 'parameters': {'schedule': 9}}],
            'connections': {}, 'settings': {},
        }

    def test_release_source_is_exactly_inactive(self):
        self.assertEqual(len(guard.validate_source(WORKFLOW)), 64)

    def test_rejects_activated_source(self):
        bad = copy.deepcopy(WORKFLOW)
        bad['active'] = True
        with self.assertRaisesRegex(ValueError, 'inactive'):
            guard.validate_source(bad)

    def test_rejects_missing_node(self):
        bad = copy.deepcopy(WORKFLOW)
        bad['nodes'].pop()
        with self.assertRaisesRegex(ValueError, '13-node'):
            guard.validate_source(bad)

    def test_rejects_wrong_firestore_database(self):
        bad = copy.deepcopy(WORKFLOW)
        next(n for n in bad['nodes'] if n['name'] == 'Read Consented Contacts')['parameters']['database'] = '(default)'
        with self.assertRaisesRegex(ValueError, 'Firestore'):
            guard.validate_source(bad)

    def test_rejects_prebound_credentials(self):
        bad = copy.deepcopy(WORKFLOW)
        bad['nodes'][0]['credentials'] = {'googleApi': {'id': 'other'}}
        with self.assertRaisesRegex(ValueError, 'credential'):
            guard.validate_source(bad)

    def test_rejects_enabled_activation_cutoff(self):
        bad = copy.deepcopy(WORKFLOW)
        next(n for n in bad['nodes'] if n['name'] == 'Activation UTC')['parameters']['jsCode'] = 'return []'
        with self.assertRaisesRegex(ValueError, 'Activation'):
            guard.validate_source(bad)

    def test_rejects_missing_recipient(self):
        bad = copy.deepcopy(WORKFLOW)
        n = next(n for n in bad['nodes'] if n['name'] == 'Prepare eligible leads')
        n['parameters']['jsCode'] = n['parameters']['jsCode'].replace('sara.saldarriaga@lchtechnologies.onmicrosoft.com', 'notallowed@example.com')
        with self.assertRaisesRegex(ValueError, 'four-recipient'):
            guard.validate_source(bad)

    def test_before_requires_lina_and_no_lch(self):
        self.assertEqual(guard.verify_before([self.lina]), 1)
        with self.assertRaisesRegex(ValueError, 'Lina'):
            guard.verify_before([])
        with self.assertRaisesRegex(ValueError, 'duplicate'):
            guard.verify_before([self.lina, WORKFLOW])

    def test_after_preserves_lina_and_inactive_lch(self):
        self.assertEqual(guard.verify_after([self.lina], [copy.deepcopy(self.lina), WORKFLOW])['LCH'], 'inactive')

    def test_after_rejects_lina_mutation(self):
        mutated = copy.deepcopy(self.lina)
        mutated['nodes'][0]['parameters']['schedule'] = 8
        with self.assertRaisesRegex(ValueError, 'Lina workflow changed'):
            guard.verify_after([self.lina], [mutated, WORKFLOW])

    def test_existing_workflow_exact_inactive_is_recognized(self):
        found = guard.inspect_existing(WORKFLOW, [self.lina, copy.deepcopy(WORKFLOW)])
        self.assertEqual(found['state'], 'present_matching_inactive')
        self.assertEqual(found['lchNodes'], 13)
        self.assertEqual(found['credentialBoundNodes'], 0)
        self.assertTrue(found['activationCutoffUnset'])

    def test_existing_with_credential_ref_preserved(self):
        existing = copy.deepcopy(WORKFLOW)
        next(n for n in existing['nodes'] if n['name'] == 'Outlook Send Four Recipients')['credentials'] = {
            'microsoftOutlookOAuth2Api': {'id': 'secret-identifier', 'name': 'Private'}}
        found = guard.inspect_existing(WORKFLOW, [self.lina, existing])
        self.assertEqual(found['credentialBoundNodes'], 1)
        self.assertNotIn('Private', str(found))

    def test_inspect_absent_is_distinct(self):
        self.assertEqual(guard.inspect_existing(WORKFLOW, [self.lina])['state'], 'absent')

    def test_existing_active_blocks(self):
        existing = copy.deepcopy(WORKFLOW)
        existing['active'] = True
        with self.assertRaisesRegex(ValueError, 'active'):
            guard.inspect_existing(WORKFLOW, [self.lina, existing])

    def test_existing_executable_drift_blocks(self):
        existing = copy.deepcopy(WORKFLOW)
        next(n for n in existing['nodes'] if n['name'] == 'Prepare eligible leads')['parameters']['jsCode'] += '\n// changed'
        with self.assertRaisesRegex(ValueError, 'executable node differs'):
            guard.inspect_existing(WORKFLOW, [self.lina, existing])

    def test_existing_wrong_name_blocks(self):
        existing = copy.deepcopy(WORKFLOW)
        existing['name'] = 'LCH | Contact Notifications | Unexpected'
        with self.assertRaisesRegex(ValueError, 'unexpected ID or name'):
            guard.inspect_existing(WORKFLOW, [self.lina, existing])

    def test_duplicate_records_block(self):
        with self.assertRaisesRegex(ValueError, 'Multiple LCH'):
            guard.inspect_existing(WORKFLOW, [self.lina, WORKFLOW, copy.deepcopy(WORKFLOW)])

    def test_existing_connections_drift_blocks(self):
        existing = copy.deepcopy(WORKFLOW)
        existing['connections'] = {}
        with self.assertRaisesRegex(ValueError, 'connections differ'):
            guard.inspect_existing(WORKFLOW, [self.lina, existing])

    def test_existing_settings_drift_blocks(self):
        existing = copy.deepcopy(WORKFLOW)
        existing['settings']['timezone'] = 'UTC'
        with self.assertRaisesRegex(ValueError, 'settings differ'):
            guard.inspect_existing(WORKFLOW, [self.lina, existing])

    def ownership_fixture(self, present=True, lch_project='project-lina', lina_project='project-lina'):
        tmp = tempfile.TemporaryDirectory()
        path = Path(tmp.name) / 'database.sqlite'
        c = sqlite3.connect(path)
        c.execute('CREATE TABLE workflow_entity (id TEXT PRIMARY KEY)')
        c.execute('CREATE TABLE shared_workflow (workflowId TEXT, projectId TEXT)')
        c.execute('INSERT INTO workflow_entity VALUES (?)', (self.lina['id'],))
        if lina_project:
            c.execute('INSERT INTO shared_workflow VALUES (?,?)', (self.lina['id'], lina_project))
        contents = [self.lina]
        if present:
            c.execute('INSERT INTO workflow_entity VALUES (?)', (WORKFLOW['id'],))
            if lch_project:
                c.execute('INSERT INTO shared_workflow VALUES (?,?)', (WORKFLOW['id'], lch_project))
            contents.append(WORKFLOW)
        c.commit()
        c.close()
        return tmp, path, contents

    def test_ownership_existing_exact_same_project(self):
        tmp, db, wf = self.ownership_fixture()
        try:
            result = guard.inspect_ownership(WORKFLOW, wf, db)
            self.assertEqual(result['cutover'], 'already_present_skip_import')
            self.assertEqual(result['ownerState'], 'same_project_as_lina')
        finally:
            tmp.cleanup()

    def test_ownership_orphan_blocks_no_duplicate(self):
        tmp, db, wf = self.ownership_fixture(lch_project=None)
        try:
            result = guard.inspect_ownership(WORKFLOW, wf, db)
            self.assertEqual(result['cutover'], 'blocked_orphan_existing')
        finally:
            tmp.cleanup()

    def test_ownership_another_project_blocks(self):
        tmp, db, wf = self.ownership_fixture(lch_project='other-project')
        try:
            result = guard.inspect_ownership(WORKFLOW, wf, db)
            self.assertEqual(result['cutover'], 'blocked_other_project')
        finally:
            tmp.cleanup()

    def test_ownership_absent_is_ready_to_import(self):
        tmp, db, wf = self.ownership_fixture(present=False)
        try:
            result = guard.inspect_ownership(WORKFLOW, wf, db)
            self.assertEqual(result['cutover'], 'ready_for_inactive_import')
        finally:
            tmp.cleanup()

    def test_ownership_inventory_changed_blocks(self):
        tmp, db, wf = self.ownership_fixture(present=True)
        try:
            c = sqlite3.connect(db)
            c.execute('INSERT INTO workflow_entity VALUES (?)', ('unsynced-workflow',))
            c.commit();c.close()
            with self.assertRaisesRegex(ValueError, 'inventory changed'):
                guard.inspect_ownership(WORKFLOW, wf, db)
        finally:
            tmp.cleanup()

    def test_ownership_lina_without_project_blocks(self):
        tmp, db, wf = self.ownership_fixture(lina_project=None)
        try:
            with self.assertRaisesRegex(ValueError, 'unique owning project'):
                guard.inspect_ownership(WORKFLOW, wf, db)
        finally:
            tmp.cleanup()

    def test_after_rejects_activation(self):
        bad = copy.deepcopy(WORKFLOW)
        bad['active'] = True
        with self.assertRaisesRegex(ValueError, 'active'):
            guard.verify_after([self.lina], [copy.deepcopy(self.lina), bad])


if __name__ == '__main__':
    unittest.main()
