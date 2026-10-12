"""Fail-closed fixture tests for the dedicated per-mailbox Graph app."""
import copy
import importlib.util
from pathlib import Path
import unittest

SPEC = importlib.util.spec_from_file_location('entra', Path(__file__).resolve().parent.parent / 'scripts/lch_entra_mail_audit.py')
entra = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(entra)


class EntraLeastPrivilegeTests(unittest.TestCase):
    def setUp(self):
        self.data = [
            {'tenantId': entra.TENANT},
            {'appId': entra.APP, 'signInAudience': 'AzureADMyOrg', 'web': {'redirectUris': [entra.REDIRECT]}, 'requiredResourceAccess': [{'resourceAppId': entra.GRAPH, 'resourceAccess': [{'id': entra.MAIL_SEND, 'type': 'Scope'}]}]},
            {'id': entra.SP, 'appRoleAssignmentRequired': True, 'accountEnabled': True},
            [{'principalId': entra.CONTACT, 'principalType': 'User', 'appRoleId': '00000000-0000-0000-0000-000000000000'}],
            [{'consentType': 'Principal', 'principalId': entra.CONTACT, 'scope': 'Mail.Send'}],
            [],
        ]

    def audit(self):
        return entra.validate(*self.data)

    def test_passes_exact_scoped_grants(self):
        self.assertTrue(self.audit()['readyForMailboxOAuth'])

    def test_rejects_multi_tenant_app(self):
        self.data[1]['signInAudience'] = 'AzureADMultipleOrgs'
        self.assertFalse(self.audit()['readyForMailboxOAuth'])

    def test_rejects_mismatched_redirect(self):
        self.data[1]['web']['redirectUris'] = ['https://example.com/callback']
        self.assertFalse(self.audit()['exactRedirect'])

    def test_rejects_application_wide_mail_send(self):
        self.data[1]['requiredResourceAccess'][0]['resourceAccess'] = [{'id': entra.MAIL_SEND, 'type': 'Role'}]
        self.assertFalse(self.audit()['onlyDelegatedMailSend'])

    def test_rejects_broad_outlook_scopes(self):
        self.data[1]['requiredResourceAccess'][0]['resourceAccess'].append({'id': 'unapproved', 'type': 'Scope'})
        self.assertFalse(self.audit()['readyForMailboxOAuth'])

    def test_rejects_unrestricted_sign_in(self):
        self.data[2]['appRoleAssignmentRequired'] = False
        self.assertFalse(self.audit()['appAssignmentRequired'])

    def test_rejects_additional_assigned_user(self):
        self.data[3].append({'principalId': 'other', 'principalType': 'User', 'appRoleId': '00000000-0000-0000-0000-000000000000'})
        self.assertFalse(self.audit()['onlyContactoAssigned'])

    def test_rejects_tenant_wide_consent(self):
        self.data[4] = [{'consentType': 'AllPrincipals', 'principalId': None, 'scope': 'Mail.Send'}]
        self.assertFalse(self.audit()['onlyContactoConsent'])

    def test_rejects_overly_permissive_consent_scopes(self):
        self.data[4][0]['scope'] = 'Mail.Send Mail.ReadWrite'
        self.assertFalse(self.audit()['onlyContactoConsent'])

    def test_allows_exactly_one_rotatable_secret(self):
        self.data[5] = [{'keyId': 'one'}]
        self.assertTrue(self.audit()['readyForMailboxOAuth'])
        self.data[5].append({'keyId': 'two'})
        self.assertFalse(self.audit()['maxOneRotatableSecret'])


if __name__ == '__main__':
    unittest.main()
