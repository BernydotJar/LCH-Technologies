#!/usr/bin/env python3
"""Strict n8n workflow import guard; no credentials, tokens or lead data read."""
import hashlib
import json
import pathlib
import sys

LCH_ID = 'lchContactNotifyN8nGH26'
LCH_NODES = {
    'Every 5 Minutes', 'Activation UTC', 'Read Consented Contacts',
    'Prepare eligible leads', 'Claim Firestore Lease',
    'Confirm Firestore Lease', 'Outlook Send Four Recipients',
    'Confirm Outlook Accepted', 'Re-read Firestore Lease',
    'Verify Original Lease', 'Record Outlook Acceptance',
    'Select Retry-Exhausted Leads', 'Record Needs Review',
}
LCH_DB = 'ai-studio-8963e7a3-87ce-4ca9-938c-9490f698d4c7'
RECIPIENTS = (
    'contacto@lch-technologies.com',
    'eduardo.sacahui@lch-technologies.com',
    'lina.saldarriaga@lchtechnologies.onmicrosoft.com',
    'sara.saldarriaga@lchtechnologies.onmicrosoft.com',
)


def parse(path):
    data = json.loads(pathlib.Path(path).read_text(encoding='utf-8'))
    result = data if isinstance(data, list) else [data]
    if not all(isinstance(w, dict) and isinstance(w.get('nodes'), list) for w in result):
        raise ValueError('Not an n8n workflow JSON export')
    return result


def signature(w):
    data = {key: w.get(key) for key in ('id', 'name', 'nodes', 'connections', 'settings')}
    return hashlib.sha256(json.dumps(data, sort_keys=True, ensure_ascii=True).encode()).hexdigest()


def validate_source(w):
    if w.get('id') != LCH_ID:
        raise ValueError('Unexpected LCH workflow ID')
    if w.get('active') is not False:
        raise ValueError('LCH source workflow must be inactive')
    names = [n.get('name') for n in w['nodes']]
    if len(names) != 13 or set(names) != LCH_NODES:
        raise ValueError('LCH 13-node topology does not match the release contract')
    if any(n.get('credentials') for n in w['nodes']):
        raise ValueError('LCH import must not contain bound credentials')
    read = next(n for n in w['nodes'] if n['name'] == 'Read Consented Contacts')
    if read['parameters'].get('projectId') != 'rag-municipalidades' or read['parameters'].get('database') != LCH_DB:
        raise ValueError('Firestore source does not match the designated Spark database')
    guard = next(n for n in w['nodes'] if n['name'] == 'Activation UTC')
    if '__REPLACE_WITH_ACTIVATION_UTC__' not in guard['parameters'].get('jsCode', ''):
        raise ValueError('Activation UTC is not fail-closed')
    text = json.dumps(w, ensure_ascii=True)
    if not all(addr in text for addr in RECIPIENTS):
        raise ValueError('Fixed four-recipient contract missing')
    if not w.get('settings', {}).get('saveDataSuccessExecution') == 'none':
        raise ValueError('Execution data minimization disabled')
    return signature(w)


def find_lina(export):
    matches = [w for w in export if 'lina' in w.get('name', '').lower() and 'agenda' in w.get('name', '').lower()]
    if len(matches) != 1:
        raise ValueError('Expected exactly one existing Lina agenda workflow')
    return matches[0]


def verify_before(export):
    find_lina(export)
    if any(w.get('id') == LCH_ID or 'LCH | Contact Notifications' in w.get('name', '') for w in export):
        raise ValueError('LCH workflow already exists; import would duplicate it')
    return len(export)


def verify_after(before, after):
    lina0, lina1 = find_lina(before), find_lina(after)
    if signature(lina0) != signature(lina1) or lina0.get('active') != lina1.get('active'):
        raise ValueError('Lina workflow changed during LCH import')
    matches = [w for w in after if w.get('id') == LCH_ID]
    if len(after) != len(before) + 1 or len(matches) != 1:
        raise ValueError('Unexpected workflow inventory after LCH import')
    new = matches[0]
    if new.get('active') is not False:
        raise ValueError('LCH workflow became active without credentials')
    if len(new['nodes']) != 13:
        raise ValueError('LCH workflow node count does not match')
    return {'before': len(before), 'after': len(after), 'Lina': 'unchanged', 'LCH': 'inactive'}


def main(argv):
    if len(argv) == 3 and argv[1] == 'source':
        print(json.dumps({'guard': 'pass', 'sha256': validate_source(parse(argv[2])[0])}))
    elif len(argv) == 3 and argv[1] == 'before':
        print(json.dumps({'existingWorkflows': verify_before(parse(argv[2])), 'duplicate': False}))
    elif len(argv) == 4 and argv[1] == 'after':
        print(json.dumps(verify_after(parse(argv[2]), parse(argv[3]))))
    else:
        raise ValueError('Usage: guard.py source FILE | before EXPORT | after BEFORE AFTER')


if __name__ == '__main__':
    try:
        main(sys.argv)
    except (ValueError, OSError, json.JSONDecodeError, KeyError) as exc:
        print('LCH_N8N_GUARD_BLOCKED: ' + str(exc), file=sys.stderr)
        sys.exit(2)
