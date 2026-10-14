#!/usr/bin/env python3
"""Read-only prerequisite audit; never prints secret values or changes n8n."""
import argparse
import json
import sqlite3
from pathlib import Path

WORKFLOW_ID = 'lchContactNotifyN8nGH26'
CLEAN_WORKFLOW_ID = 'lchContactNotifyClean20261014'
ALLOWED_LCH_WORKFLOW_IDS = frozenset((WORKFLOW_ID, CLEAN_WORKFLOW_ID))
FIRESTORE_NODES = ('Read Consented Contacts', 'Claim Firestore Lease',
                   'Record Needs Review', 'Re-read Firestore Lease',
                   'Record Outlook Acceptance')
OUTLOOK_NODE = 'Outlook Send Four Recipients'


def audit(database: str, workflow_id: str = WORKFLOW_ID) -> dict:
    if workflow_id not in ALLOWED_LCH_WORKFLOW_IDS:
        return {'ready': False, 'blockers': ['workflow_id_not_allowed'], 'workflow_active': False, 'live_receipts_verified': False}
    conn = sqlite3.connect(f'file:{Path(database).resolve()}?mode=ro', uri=True, timeout=5)
    try:
        row = conn.execute('SELECT nodes, active FROM workflow_entity WHERE id=?',
                           (workflow_id,)).fetchone()
        types = {str(r[0]): set() for r in conn.execute('SELECT DISTINCT type FROM credentials_entity')}
        for cred_id, cred_type in conn.execute('SELECT id, type FROM credentials_entity'):
            types[cred_type].add(cred_id)
        if row is None:
            return {'ready': False, 'blockers': ['lch_workflow_missing'], 'workflow_active': False}
        nodes, active = json.loads(row[0]), bool(row[1])
        other_workflow_id = CLEAN_WORKFLOW_ID if workflow_id == WORKFLOW_ID else WORKFLOW_ID
        other = conn.execute('SELECT active FROM workflow_entity WHERE id=?', (other_workflow_id,)).fetchone()
        by_name = {n['name']: n for n in nodes}
        blockers = []
        if len(nodes) != 13:
            blockers.append('workflow_revision_mismatch')
        if OUTLOOK_NODE not in by_name or any(name not in by_name for name in FIRESTORE_NODES):
            blockers.append('required_nodes_missing')
        def has_credential(name: str, typ: str) -> bool:
            return by_name.get(name, {}).get('credentials', {}).get(typ, {}).get('id') in types.get(typ, set())
        if not all(has_credential(name, 'googleApi') for name in FIRESTORE_NODES):
            blockers.append('google_firestore_credential_not_bound')
        if not has_credential(OUTLOOK_NODE, 'microsoftOutlookOAuth2Api'):
            blockers.append('outlook_credential_not_bound')
        code = by_name.get('Activation UTC', {}).get('parameters', {}).get('jsCode', '')
        if '__REPLACE_WITH_ACTIVATION_UTC__' in code or 'const ACTIVATION_UTC' not in code:
            blockers.append('activation_time_not_configured')
        if other is not None and bool(other[0]):
            blockers.append('another_lch_workflow_active')
        if not active:
            blockers.append('workflow_not_active')
        # Credentials present/bound and active do not prove OAuth validity, Microsoft sender
        # permissions, ability to reach Firestore, or actual mailbox delivery.
        return {'ready': not blockers, 'blockers': sorted(blockers), 'workflow_active': active,
                'live_receipts_verified': False}
    finally:
        conn.close()


def main() -> int:
    parser = argparse.ArgumentParser(description='Read-only LCH n8n release prerequisite audit')
    parser.add_argument('--database', default='/workspace/_shared/lina-n8n-runtime/data/database.sqlite')
    parser.add_argument('--workflow-id', choices=sorted(ALLOWED_LCH_WORKFLOW_IDS), default=WORKFLOW_ID)
    args = parser.parse_args()
    try:
        result = audit(args.database, workflow_id=args.workflow_id)
    except (OSError, sqlite3.Error, ValueError, KeyError) as exc:
        result = {'ready': False, 'blockers': ['prerequisite_audit_failed'], 'workflow_active': False,
                  'live_receipts_verified': False}
    print(json.dumps(result, sort_keys=True))
    return 0 if result['ready'] else 2


if __name__ == '__main__':
    raise SystemExit(main())
