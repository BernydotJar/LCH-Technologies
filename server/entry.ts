import { createServer } from 'node:http';
import { createSiteHandler } from './handler.ts';

const port = Number(process.env.PORT ?? '14175');
const host = process.env.HOST ?? '0.0.0.0';
const distDir = process.env.DIST_DIR;
const releaseSha = process.env.RELEASE_SHA ?? 'unknown';

if (!distDir) throw new Error('DIST_DIR environment variable is required');

const handler = createSiteHandler({
  distDir,
  releaseSha,
  allowedOrigin: process.env.LCH_PUBLIC_ORIGIN ?? 'https://lch-app.cloud',
  trustedProxyHeader: process.env.DONNA_TRUSTED_PROXY_IP_HEADER,
});
createServer((req, res) => { void handler(req, res); })
  .listen(port, host, () => {
    console.log(`LCH site + Donna ready on ${host}:${port} (release=${releaseSha})`);
  });
