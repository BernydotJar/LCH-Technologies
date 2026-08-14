import type { LeadAutomationPayload } from './leadContract';

export type AutomationDeliveryStatus = 'sent' | 'skipped' | 'failed';

export type AutomationDeliveryResult = {
  status: AutomationDeliveryStatus;
  httpStatus?: number;
  error?: string;
};

type FetchLike = typeof fetch;

type NotifyOptions = {
  timeoutMs?: number;
  fetchImpl?: FetchLike;
};

export function isSupportedWebhookUrl(value: string): boolean {
  try {
    const url = new URL(value);
    if (url.protocol === 'https:') return true;
    if (url.protocol !== 'http:') return false;
    return ['localhost', '127.0.0.1', 'host.docker.internal'].includes(url.hostname);
  } catch {
    return false;
  }
}

export async function notifyLeadAutomation(
  webhookUrl: string | undefined,
  payload: LeadAutomationPayload,
  options: NotifyOptions = {},
): Promise<AutomationDeliveryResult> {
  const endpoint = webhookUrl?.trim();
  if (!endpoint) return { status: 'skipped' };

  if (!isSupportedWebhookUrl(endpoint)) {
    return { status: 'failed', error: 'unsupported_webhook_url' };
  }

  const fetchImpl = options.fetchImpl ?? fetch;
  const timeoutMs = options.timeoutMs ?? 3500;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchImpl(endpoint, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-lch-automation-schema': payload.schemaVersion,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
      mode: 'cors',
      credentials: 'omit',
      cache: 'no-store',
    });

    if (!response.ok) {
      return {
        status: 'failed',
        httpStatus: response.status,
        error: `automation_http_${response.status}`,
      };
    }

    return { status: 'sent', httpStatus: response.status };
  } catch (error) {
    return {
      status: 'failed',
      error: error instanceof Error ? error.name : 'automation_network_error',
    };
  } finally {
    clearTimeout(timeout);
  }
}
