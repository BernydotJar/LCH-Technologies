"""Adversarial fixtures for Mac n8n inactive import guard."""
import copy
import importlib.util
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

    def test_after_rejects_activation(self):
        bad = copy.deepcopy(WORKFLOW)
        bad['active'] = True
        with self.assertRaisesRegex(ValueError, 'active'):
            guard.verify_after([self.lina], [copy.deepcopy(self.lina), bad])


if __name__ == '__main__':
    unittest.main()
