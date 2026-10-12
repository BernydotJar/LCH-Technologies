#!/usr/bin/env python3
"""Read-only live Microsoft Entra app audit; never exports tokens/secrets."""
import json
import os
import subprocess
import sys

TENANT = '9abcb23c-110b-4268-9e0f-515c37f984f1'
APP = 'd0c36d85-a2cd-4b5c-a59d-a51f5b4f7612'
SP = 'b55852c1-3919-4c47-9737-4fff744e5e2e'
CONTACT = 'bc1c0e8d-84c1-41ff-9b09-44809c7410c7'
GRAPH = '00000003-0000-0000-c000-000000000000'
MAIL_SEND = 'e383f46e-2787-4529-855e-0e479a3ffac0'
REDIRECT = 'http://localhost:5678/rest/oauth2-credential/callback'


def validate(account, app, sp, assignments, grants, secrets):
    resources = app.get('requiredResourceAccess') or []
    permissions = [
        (r.get('resourceAppId'), e.get('id'), e.get('type'))
        for r in resources for e in (r.get('resourceAccess') or [])
    ]
    user_assignments = [
        (a.get('principalId'), a.get('principalType'), a.get('appRoleId'))
        for a in assignments
    ]
    consent = [(g.get('consentType'), g.get('principalId'), g.get('scope')) for g in grants]
    result = {
        'correctTenant': account.get('tenantId') == TENANT,
        'singleTenantApplication': app.get('appId') == APP and app.get('signInAudience') == 'AzureADMyOrg',
        'exactRedirect': (app.get('web') or {}).get('redirectUris') == [REDIRECT],
        'onlyDelegatedMailSend': permissions == [(GRAPH, MAIL_SEND, 'Scope')],
        'appAssignmentRequired': sp.get('id') == SP and sp.get('appRoleAssignmentRequired') is True and sp.get('accountEnabled') is True,
        'onlyContactoAssigned': user_assignments == [(CONTACT, 'User', '00000000-0000-0000-0000-000000000000')],
        'onlyContactoConsent': consent == [('Principal', CONTACT, 'Mail.Send')],
        'maxOneRotatableSecret': len(secrets) <= 1,
        'clientSecretCount': len(secrets),
    }
    result['readyForMailboxOAuth'] = all(v for k, v in result.items() if isinstance(v, bool))
    return result


def run_az(args):
    exe = os.environ.get('LCH_AZ_BIN') or '/workspace/.deployment-tools/azcli-venv/bin/az'
    p = subprocess.run([exe, *args, '-o', 'json', '--only-show-errors'], capture_output=True, text=True, check=False)
    if p.returncode:
        raise RuntimeError('Unable to verify Microsoft Entra live state (Azure CLI access or permission error)')
    return json.loads(p.stdout)


def live_audit():
    account = run_az(['account', 'show'])
    app = run_az(['ad', 'app', 'show', '--id', APP])
    sp = run_az(['rest', '--method', 'GET', '--url', f'https://graph.microsoft.com/v1.0/servicePrincipals/{SP}?$select=id,appRoleAssignmentRequired,accountEnabled'])
    assignments = run_az(['rest', '--method', 'GET', '--url', f'https://graph.microsoft.com/v1.0/servicePrincipals/{SP}/appRoleAssignedTo'])['value']
    grants = run_az(['ad', 'app', 'permission', 'list-grants', '--id', APP])
    secrets = run_az(['ad', 'app', 'credential', 'list', '--id', APP])
    return validate(account, app, sp, assignments, grants, secrets)


if __name__ == '__main__':
    if '--live' not in sys.argv:
        print('Use --live with an authenticated Azure CLI', file=sys.stderr)
        sys.exit(64)
    try:
        result = live_audit()
        print(json.dumps(result, sort_keys=True))
        if not result['readyForMailboxOAuth']:
            sys.exit(2)
    except (RuntimeError, KeyError, ValueError, OSError):
        print('LCH_ENTRA_AUDIT_BLOCKED: cannot verify least-privilege live state', file=sys.stderr)
        sys.exit(2)
