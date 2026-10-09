/**
 * Production same-origin API and static server for LCH.
 * The Donna POC used Next.js POST /api/chat; here the same authority boundary
 * lives inside LCH's existing supervised Node process. No Vercel dependency.
 */
import type { IncomingMessage, ServerResponse } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { isIP } from 'node:net';
import { DONNA_LIMITS, parseDonnaRequest, respondToDonna } from '../src/donna/engine.ts';

const CONTENT_TYPES: Readonly<Record<string, string>> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.json': 'application/json; charset=utf-8',
  '.woff2': 'font/woff2',
  '.mp4': 'video/mp4',
};

function sendJson(res: ServerResponse, status: number, value: unknown, headers: Record<string, string> = {}) {
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
    ...headers,
  });
  res.end(JSON.stringify(value));
}

/** A bounded, process-local limiter adapted from Donna's server/rate-limit.ts. */
export class DonnaRateLimiter {
  private readonly windows = new Map<string, { start: number; count: number }>();
  private overflow = { start: 0, count: 0 };
  private readonly limit: number;
  private readonly windowMs: number;
  constructor(limit = 30, windowMs = 60_000) {
    this.limit = limit;
    this.windowMs = windowMs;
  }
  take(key: string, now = Date.now()): { allowed: boolean; retryAfter: number } {
    for (const [client, window] of this.windows) {
      if (now - window.start >= this.windowMs) this.windows.delete(client);
    }
    let window = this.windows.get(key);
    if (!window) {
      if (this.windows.size >= 1024) {
        if (now - this.overflow.start >= this.windowMs) this.overflow = { start: now, count: 0 };
        window = this.overflow;
      } else {
        window = { start: now, count: 0 };
        this.windows.set(key, window);
      }
    }
    if (window.count >= this.limit) {
      return { allowed: false, retryAfter: Math.max(1, Math.ceil((window.start + this.windowMs - now) / 1000)) };
    }
    window.count += 1;
    return { allowed: true, retryAfter: 0 };
  }
}

function clientKey(req: IncomingMessage, trustedProxyHeader?: string): string {
  // A header is trusted only when operations explicitly configure that trusted
  // ingress. Without that assurance, use the direct peer IP.
  if (trustedProxyHeader === 'cf-connecting-ip' || trustedProxyHeader === 'x-real-ip') {
    const header = req.headers[trustedProxyHeader];
    if (typeof header === 'string' && header.length <= 45 && isIP(header.trim())) return header.trim();
  }
  return req.socket.remoteAddress ?? 'unknown';
}

async function readBounded(req: IncomingMessage): Promise<unknown> {
  const header = req.headers['content-length'];
  if (header && Number(header) > DONNA_LIMITS.maxBodyBytes) throw new Error('too_large');
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += bytes.length;
    if (size > DONNA_LIMITS.maxBodyBytes) throw new Error('too_large');
    chunks.push(bytes);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8')) as unknown;
  } catch {
    throw new Error('invalid_json');
  }
}

export type SiteHandlerOptions = {
  distDir: string;
  releaseSha: string;
  allowedOrigin?: string;
  trustedProxyHeader?: string;
  limiter?: DonnaRateLimiter;
};

export function createSiteHandler(options: SiteHandlerOptions) {
  const dist = resolve(options.distDir);
  const limiter = options.limiter ?? new DonnaRateLimiter();
  const officialOrigin = options.allowedOrigin ?? 'https://lch-app.cloud';

  return async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
    try {
      const url = new URL(req.url ?? '/', 'http://localhost');
      if (url.pathname === '/health') {
        sendJson(res, 200, {
          ok: true, product: 'lch-site', release_sha: options.releaseSha,
          donna: 'grounded-v1',
        });
        return;
      }

      if (url.pathname === '/api/chat') {
        res.setHeader('allow', 'POST');
        if (req.method !== 'POST') {
          sendJson(res, 405, { reply: 'Método no permitido.', kind: 'error' });
          return;
        }
        // No CORS response is emitted. Accept only our canonical production
        // origin or the same host during local QA; other origins get 403.
        const origin = req.headers.origin;
        if (origin) {
          let permitted = origin === officialOrigin;
          try {
            const parsed = new URL(origin);
            permitted ||= (parsed.protocol === 'http:' || parsed.protocol === 'https:')
              && parsed.host === req.headers.host;
          } catch { /* malformed origin remains forbidden */ }
          if (!permitted) {
            sendJson(res, 403, { reply: 'Origen no permitido.', kind: 'error' });
            return;
          }
        }
        if (req.headers['content-type']?.split(';')[0].trim().toLowerCase() !== 'application/json') {
          sendJson(res, 415, { reply: 'Envía JSON válido.', kind: 'error' });
          return;
        }
        const admission = limiter.take(clientKey(req, options.trustedProxyHeader));
        if (!admission.allowed) {
          sendJson(res, 429, { reply: 'Donna está recibiendo muchas consultas. Inténtalo en un momento.', kind: 'error' },
            { 'retry-after': String(admission.retryAfter) });
          return;
        }
        let payload: unknown;
        try {
          payload = await readBounded(req);
        } catch (error) {
          const large = error instanceof Error && error.message === 'too_large';
          sendJson(res, large ? 413 : 400, { reply: large ? 'Tu consulta es demasiado larga.' : 'JSON inválido.', kind: 'error' });
          return;
        }
        const parsed = parseDonnaRequest(payload);
        if (!parsed.ok) {
          sendJson(res, 400, { reply: parsed.reason, kind: 'error' });
          return;
        }
        sendJson(res, 200, respondToDonna(parsed.messages));
        return;
      }

      if (req.method !== 'GET' && req.method !== 'HEAD') {
        sendJson(res, 405, { error: 'method_not_allowed' });
        return;
      }
      const rawPath = decodeURIComponent(url.pathname);
      if (rawPath.includes('\0')) {
        sendJson(res, 400, { error: 'invalid_path' });
        return;
      }
      const requested = rawPath === '/' ? 'index.html' : rawPath.replace(/^\/+/, '');
      const file = resolve(dist, requested);
      if (!file.startsWith(dist + sep) && file !== dist) {
        sendJson(res, 403, { error: 'forbidden' });
        return;
      }
      let finalFile = file;
      try {
        const info = await stat(file);
        if (info.isDirectory()) finalFile = resolve(file, 'index.html');
      } catch {
        if (extname(requested)) {
          sendJson(res, 404, { error: 'not_found' });
          return;
        }
        finalFile = resolve(dist, 'index.html');
      }
      const ext = extname(finalFile);
      const type = CONTENT_TYPES[ext];
      // Server bundle and any unknown private artifacts must not be exposed.
      if (!type || ext === '.mjs') {
        sendJson(res, 404, { error: 'not_found' });
        return;
      }
      const body = await readFile(finalFile);
      res.writeHead(200, {
        'content-type': type,
        'x-content-type-options': 'nosniff',
        'referrer-policy': 'strict-origin-when-cross-origin',
        'cache-control': ext === '.html' ? 'no-cache' : 'public, max-age=3600',
      });
      res.end(req.method === 'HEAD' ? undefined : body);
    } catch {
      sendJson(res, 500, { error: 'internal_error' });
    }
  };
}
