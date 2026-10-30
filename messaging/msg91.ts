/**
 * Server-only MSG91 transport adapter.
 *
 * This module intentionally does not expose an HTTP route. It must only be
 * called by a trusted, authenticated backend queue worker after consent,
 * template, schedule and duplicate checks have passed.
 */
type TemplateVariables = Record<string, string>;

export interface Msg91SendResult {
  provider: 'MSG91';
  accepted: boolean;
  requestId?: string;
  providerResponse: unknown;
}

export interface Msg91WhatsAppComponent {
  type: string;
  value: string;
}

export class Msg91ConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'Msg91ConfigurationError';
  }
}

export class Msg91RequestError extends Error {
  readonly httpStatus?: number;

  constructor(message: string, httpStatus?: number) {
    super(message);
    this.name = 'Msg91RequestError';
    this.httpStatus = httpStatus;
  }
}

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Msg91ConfigurationError(`Missing server environment variable: ${name}`);
  return value;
}

function validateIndianMobile(mobile: string): string {
  const digits = mobile.replace(/^\+/, '').replace(/[\s()-]/g, '');
  if (!/^91[6-9]\d{9}$/.test(digits)) {
    throw new Msg91RequestError('Recipient must be an Indian mobile number in 91XXXXXXXXXX format.');
  }
  return digits;
}

function validateVariables(variables: TemplateVariables): TemplateVariables {
  const clean: TemplateVariables = {};
  for (const [key, value] of Object.entries(variables)) {
    if (!/^[A-Z][A-Z0-9_]{0,31}$/.test(key) || typeof value !== 'string') {
      throw new Msg91RequestError('Template variables must use uppercase keys and string values.');
    }
    clean[key] = value;
  }
  return clean;
}

async function postMsg91(url: string, body: unknown): Promise<Msg91SendResult> {
  const authKey = requiredEnv('MSG91_AUTH_KEY');
  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        authkey: authKey,
        'content-type': 'application/json'
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(20000)
    });
  } catch {
    throw new Msg91RequestError('MSG91 request failed before a response was received.');
  }

  const responseText = await response.text();
  let providerResponse: unknown;
  try {
    providerResponse = responseText ? JSON.parse(responseText) : null;
  } catch {
    providerResponse = { unparsedResponse: true };
  }

  const responseRecord = providerResponse && typeof providerResponse === 'object'
    ? providerResponse as Record<string, unknown>
    : {};
  const providerRejected =
    responseRecord.hasError === true ||
    responseRecord.status === 'error' ||
    responseRecord.type === 'error' ||
    Boolean(responseRecord.errors);

  if (!response.ok || providerRejected) {
    throw new Msg91RequestError(
      `MSG91 rejected the request (HTTP ${response.status}). Check the provider dashboard and template configuration.`,
      response.status
    );
  }

  // "accepted" means the provider accepted/queued the request; it is NOT a delivery receipt.
  const requestId = typeof responseRecord.request_id === 'string'
    ? responseRecord.request_id
    : typeof responseRecord.requestId === 'string'
      ? responseRecord.requestId
      : undefined;

  return { provider: 'MSG91', accepted: true, requestId, providerResponse };
}

/**
 * Send an approved DLT SMS template. DLT/entity/header/template registration
 * and the customer's consent must already have been verified by the caller.
 */
export async function sendMsg91Sms(
  mobile: string,
  variables: TemplateVariables
): Promise<Msg91SendResult> {
  const templateId = requiredEnv('MSG91_SMS_TEMPLATE_ID');
  const recipient = {
    mobiles: validateIndianMobile(mobile),
    ...validateVariables(variables)
  };

  return postMsg91('https://control.msg91.com/api/v5/flow', {
    template_id: templateId,
    realTimeResponse: '1',
    recipients: [recipient]
  });
}

/**
 * Send an approved WhatsApp template. Components must match the exact
 * approved MSG91/Meta template definition (for example body_1, header_1).
 */
export async function sendMsg91WhatsAppTemplate(
  mobile: string,
  templateName: string,
  languageCode: string,
  components: Record<string, Msg91WhatsAppComponent>
): Promise<Msg91SendResult> {
  const integratedNumber = requiredEnv('MSG91_WHATSAPP_INTEGRATED_NUMBER');
  if (!/^[A-Za-z0-9_-]{1,128}$/.test(templateName)) {
    throw new Msg91RequestError('Invalid WhatsApp template name.');
  }
  if (!/^[a-z]{2,3}(?:_[A-Z]{2})?$/.test(languageCode)) {
    throw new Msg91RequestError('Invalid WhatsApp template language code.');
  }
  if (!components || Object.keys(components).length === 0) {
    throw new Msg91RequestError('Approved WhatsApp template components are required.');
  }

  return postMsg91(
    'https://control.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk',
    {
      integrated_number: integratedNumber,
      content_type: 'template',
      payload: {
        type: 'template',
        template: {
          name: templateName,
          language: { code: languageCode, policy: 'deterministic' },
          to_and_components: [{
            to: [validateIndianMobile(mobile)],
            components
          }]
        }
      }
    }
  );
}
