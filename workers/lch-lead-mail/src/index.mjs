import { runNotificationScan } from './job.mjs';

/** No public ingestion route: private scheduled consumer only. */
export default {
  async fetch() {
    return new Response('Not Found', { status: 404, headers: { 'cache-control': 'no-store' } });
  },
  async scheduled(_event, env, ctx) {
    ctx.waitUntil(runNotificationScan(env)
      .then(({ state, sent = 0, attempted = 0, blocked = 0, invalid = 0, conflict = 0, pages = 0, capped = false, reason = null }) => {
        // Counts and machine status only; never log the lead, recipient body,
        // Google private key, Entra client secret or OAuth bearer tokens.
        console.log('lch_lead_notification_cron', JSON.stringify({ state, sent, attempted, blocked, invalid, conflict, pages, capped, reason }));
      })
      .catch((error) => {
        console.error('lch_lead_notification_error', error?.code || error?.message || 'unknown');
        throw error;
      }));
  },
};
