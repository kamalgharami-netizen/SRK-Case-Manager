import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pino from 'pino';
import QRCode from 'qrcode';
import makeWASocket, {
  Browsers,
  DisconnectReason,
  fetchLatestBaileysVersion,
  useMultiFileAuthState,
  WASocket
} from '@whiskeysockets/baileys';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const AUTH_ROOT = path.resolve(__dirname, '..', '.whatsapp-auth');

export type WhatsAppSessionState =
  | 'disconnected'
  | 'connecting'
  | 'qr'
  | 'pairing'
  | 'connected';

export interface WhatsAppPublicStatus {
  sessionId: string;
  status: WhatsAppSessionState;
  qrDataUrl: string | null;
  pairingCode: string | null;
  connectedPhone: string | null;
  connectedName: string | null;
  lastError: string | null;
  hasSavedAuth: boolean;
  updatedAt: number;
}

interface InternalSession {
  sessionId: string;
  socket: WASocket | null;
  status: WhatsAppSessionState;
  qrDataUrl: string | null;
  pairingCode: string | null;
  connectedPhone: string | null;
  connectedName: string | null;
  lastError: string | null;
  mode: 'qr' | 'pairing';
  pairingPhone: string | null;
  pairingRequested: boolean;
  manualDisconnect: boolean;
  reconnectAttempts: number;
  reconnectTimer: NodeJS.Timeout | null;
  pairingTimer: NodeJS.Timeout | null;
  updatedAt: number;
}

const sessions = new Map<string, InternalSession>();
const startingLocks = new Map<string, Promise<void>>();

function sanitizeSessionId(raw?: string): string {
  const cleaned = String(raw || 'default')
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, '_');
  return cleaned || 'default';
}

export function normalizeWhatsAppDigits(phone: string): string {
  let digits = String(phone || '').replace(/\D/g, '');
  if (!digits) return '';
  // Strip leading 0 if 11-digit Indian format (0XXXXXXXXXX)
  if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.slice(1);
  }
  // Auto-prepend India 91 for standard 10-digit numbers
  if (digits.length === 10) {
    digits = `91${digits}`;
  }
  return digits;
}

function getAuthDir(sessionId: string): string {
  return path.join(AUTH_ROOT, sanitizeSessionId(sessionId));
}

function hasSavedCredentials(sessionId: string): boolean {
  try {
    const credsPath = path.join(getAuthDir(sessionId), 'creds.json');
    if (!fs.existsSync(credsPath)) return false;
    const raw = fs.readFileSync(credsPath, 'utf-8');
    const parsed = JSON.parse(raw);
    return Boolean(parsed?.registered);
  } catch {
    return false;
  }
}

function clearAuthDir(sessionId: string): void {
  try {
    const dir = getAuthDir(sessionId);
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  } catch (err) {
    console.warn('Failed clearing WhatsApp auth dir:', err);
  }
}

function getOrCreateSession(sessionIdRaw?: string): InternalSession {
  const sessionId = sanitizeSessionId(sessionIdRaw);
  let session = sessions.get(sessionId);
  if (!session) {
    session = {
      sessionId,
      socket: null,
      status: 'disconnected',
      qrDataUrl: null,
      pairingCode: null,
      connectedPhone: null,
      connectedName: null,
      lastError: null,
      mode: 'qr',
      pairingPhone: null,
      pairingRequested: false,
      manualDisconnect: false,
      reconnectAttempts: 0,
      reconnectTimer: null,
      pairingTimer: null,
      updatedAt: Date.now()
    };
    sessions.set(sessionId, session);
  }
  return session;
}

function cleanupSocketOnly(session: InternalSession): void {
  if (session.reconnectTimer) {
    clearTimeout(session.reconnectTimer);
    session.reconnectTimer = null;
  }
  if (session.pairingTimer) {
    clearTimeout(session.pairingTimer);
    session.pairingTimer = null;
  }
  if (session.socket) {
    try {
      session.socket.ev.removeAllListeners('connection.update');
      session.socket.ev.removeAllListeners('creds.update');
      session.socket.end(undefined);
    } catch {
      // ignore cleanup errors
    }
    session.socket = null;
  }
}

async function startSocketInternal(session: InternalSession): Promise<void> {
  const existingLock = startingLocks.get(session.sessionId);
  if (existingLock) {
    await existingLock;
    return;
  }

  const run = async () => {
    cleanupSocketOnly(session);
    fs.mkdirSync(getAuthDir(session.sessionId), { recursive: true });

    session.status = 'connecting';
    session.lastError = null;
    session.updatedAt = Date.now();

    const { state, saveCreds } = await useMultiFileAuthState(getAuthDir(session.sessionId));

    let version: [number, number, number] | undefined;
    try {
      const latest = await fetchLatestBaileysVersion();
      version = latest.version;
    } catch {
      version = undefined;
    }

    const sock = makeWASocket({
      ...(version ? { version } : {}),
      logger: pino({ level: 'silent' }),
      auth: state,
      browser: Browsers.ubuntu('SRK Case Manager'),
      markOnlineOnConnect: false,
      syncFullHistory: false,
      connectTimeoutMs: 45000
    });

    session.socket = sock;
    session.manualDisconnect = false;

    sock.ev.on('creds.update', saveCreds);

    // If pairing-code mode requested & not registered yet, request code shortly after socket handshake starts
    if (session.mode === 'pairing' && session.pairingPhone && !state.creds.registered && !session.pairingRequested) {
      const phoneForPairing = session.pairingPhone;
      session.pairingTimer = setTimeout(async () => {
        if (session.socket !== sock || session.pairingRequested || state.creds.registered) return;
        try {
          session.pairingRequested = true;
          const rawCode = await sock.requestPairingCode(phoneForPairing);
          const formatted = rawCode && rawCode.length === 8
            ? `${rawCode.slice(0, 4)}-${rawCode.slice(4)}`
            : rawCode;
          session.pairingCode = formatted;
          session.qrDataUrl = null;
          session.status = 'pairing';
          session.updatedAt = Date.now();
        } catch (err: any) {
          session.pairingRequested = false;
          session.lastError = err?.message || 'Failed to generate pairing code. Try again or use QR code.';
          session.status = 'disconnected';
          session.updatedAt = Date.now();
        }
      }, 1500);
    }

    sock.ev.on('connection.update', async (update) => {
      if (session.socket !== sock) return;

      const { connection, lastDisconnect, qr } = update;

      if (qr && session.mode === 'qr') {
        try {
          session.qrDataUrl = await QRCode.toDataURL(qr, {
            width: 280,
            margin: 2,
            color: { dark: '#0f172a', light: '#ffffff' }
          });
          session.pairingCode = null;
          session.status = 'qr';
          session.lastError = null;
          session.updatedAt = Date.now();
        } catch (qrErr) {
          console.warn('QR generation error:', qrErr);
        }
      }

      if (connection === 'open') {
        if (session.pairingTimer) {
          clearTimeout(session.pairingTimer);
          session.pairingTimer = null;
        }
        const rawJid = sock.user?.id || '';
        const phoneOnly = rawJid.split(':')[0].split('@')[0] || null;
        session.status = 'connected';
        session.qrDataUrl = null;
        session.pairingCode = null;
        session.connectedPhone = phoneOnly;
        session.connectedName = sock.user?.name || null;
        session.lastError = null;
        session.reconnectAttempts = 0;
        session.updatedAt = Date.now();
      } else if (connection === 'close') {
        if (session.pairingTimer) {
          clearTimeout(session.pairingTimer);
          session.pairingTimer = null;
        }
        const statusCode = (lastDisconnect?.error as any)?.output?.statusCode;
        const isLoggedOut = statusCode === DisconnectReason.loggedOut || statusCode === 401;
        const isRestartRequired = statusCode === DisconnectReason.restartRequired || statusCode === 515;

        if (session.manualDisconnect) {
          session.status = 'disconnected';
          session.qrDataUrl = null;
          session.pairingCode = null;
          session.connectedPhone = null;
          session.connectedName = null;
          session.updatedAt = Date.now();
          return;
        }

        if (isLoggedOut) {
          clearAuthDir(session.sessionId);
          session.socket = null;
          session.status = 'disconnected';
          session.qrDataUrl = null;
          session.pairingCode = null;
          session.connectedPhone = null;
          session.connectedName = null;
          session.lastError = 'WhatsApp device unlinked. Please scan QR or enter pairing code again.';
          session.updatedAt = Date.now();
          return;
        }

        // Baileys always sends 515 restartRequired right after scanning QR or completing pairing
        const canAutoReconnect =
          isRestartRequired ||
          hasSavedCredentials(session.sessionId) ||
          (session.reconnectAttempts < 3 && (session.mode === 'qr' || Boolean(session.pairingCode)));

        if (canAutoReconnect && session.reconnectAttempts < 6) {
          session.reconnectAttempts += 1;
          session.status = 'connecting';
          session.updatedAt = Date.now();
          const delayMs = isRestartRequired ? 400 : Math.min(3000, session.reconnectAttempts * 1000);
          session.reconnectTimer = setTimeout(() => {
            startSocketInternal(session).catch(err => {
              session.lastError = err?.message || 'Reconnect failed';
              session.status = 'disconnected';
              session.updatedAt = Date.now();
            });
          }, delayMs);
        } else {
          session.socket = null;
          session.status = 'disconnected';
          session.qrDataUrl = null;
          session.lastError =
            (lastDisconnect?.error as any)?.message || 'Connection timed out. Please try logging in again.';
          session.updatedAt = Date.now();
        }
      }
    });
  };

  const lockPromise = run().finally(() => {
    startingLocks.delete(session.sessionId);
  });
  startingLocks.set(session.sessionId, lockPromise);
  await lockPromise;
}

export function getPublicStatus(sessionIdRaw?: string): WhatsAppPublicStatus {
  const session = getOrCreateSession(sessionIdRaw);

  // Lazy auto-restore existing saved session when server restarts
  if (
    session.status === 'disconnected' &&
    !session.socket &&
    !session.manualDisconnect &&
    !session.lastError &&
    hasSavedCredentials(session.sessionId)
  ) {
    session.mode = 'qr';
    startSocketInternal(session).catch(() => {});
  }

  return {
    sessionId: session.sessionId,
    status: session.status,
    qrDataUrl: session.qrDataUrl,
    pairingCode: session.pairingCode,
    connectedPhone: session.connectedPhone,
    connectedName: session.connectedName,
    lastError: session.lastError,
    hasSavedAuth: hasSavedCredentials(session.sessionId),
    updatedAt: session.updatedAt
  };
}

export async function startWhatsAppLogin(params: {
  sessionId?: string;
  mode?: 'qr' | 'pairing';
  phoneNumber?: string;
}): Promise<WhatsAppPublicStatus> {
  const session = getOrCreateSession(params.sessionId);
  const mode = params.mode === 'pairing' ? 'pairing' : 'qr';

  // If already connected and creds valid, return immediately
  if (session.status === 'connected' && session.socket) {
    return getPublicStatus(session.sessionId);
  }

  let pairingDigits: string | null = null;
  if (mode === 'pairing') {
    pairingDigits = normalizeWhatsAppDigits(params.phoneNumber || '');
    if (pairingDigits.length < 10 || pairingDigits.length > 15) {
      throw new Error('Enter a valid 10-digit mobile number (or with country code) for pairing.');
    }
  }

  // If previous unregistered auth exists, wipe cleanly for fresh login
  if (!hasSavedCredentials(session.sessionId)) {
    clearAuthDir(session.sessionId);
  }

  session.mode = mode;
  session.pairingPhone = pairingDigits;
  session.pairingRequested = false;
  session.pairingCode = null;
  session.qrDataUrl = null;
  session.lastError = null;
  session.reconnectAttempts = 0;

  await startSocketInternal(session);

  // Wait briefly (up to 4.5s) so QR or pairing code is often ready in the same response
  const startedWait = Date.now();
  while (Date.now() - startedWait < 4500) {
    if (
      session.status === 'connected' ||
      (mode === 'qr' && session.qrDataUrl) ||
      (mode === 'pairing' && session.pairingCode) ||
      session.lastError
    ) {
      break;
    }
    await new Promise(resolve => setTimeout(resolve, 250));
  }

  return getPublicStatus(session.sessionId);
}

export async function sendWhatsAppText(params: {
  sessionId?: string;
  phone: string;
  message: string;
}): Promise<{ success: true; messageId: string; to: string; timestamp: number }> {
  const session = getOrCreateSession(params.sessionId);

  if (session.status !== 'connected' || !session.socket) {
    const err: any = new Error('WhatsApp account is not logged in. Please link your WhatsApp inside the app first.');
    err.code = 'WHATSAPP_NOT_CONNECTED';
    throw err;
  }

  const digits = normalizeWhatsAppDigits(params.phone);
  if (digits.length < 10) {
    throw new Error('Please provide a valid 10-digit recipient WhatsApp mobile number.');
  }

  const text = String(params.message || '').trim();
  if (!text) {
    throw new Error('Message text cannot be empty.');
  }

  let targetJid = `${digits}@s.whatsapp.net`;
  try {
    const lookup = await session.socket.onWhatsApp(digits);
    const match = Array.isArray(lookup) ? lookup[0] : undefined;
    if (match) {
      if (match.exists === false) {
        throw new Error(`The number +${digits} does not appear to be registered on WhatsApp.`);
      }
      if (match.jid) {
        targetJid = match.jid;
      }
    }
  } catch (lookupErr: any) {
    if (lookupErr?.message?.includes('not appear to be registered')) {
      throw lookupErr;
    }
    // Proceed with standard JID if onWhatsApp check encounters a transient network blip
  }

  const sent = await session.socket.sendMessage(targetJid, { text });

  return {
    success: true,
    messageId: sent?.key?.id || `wa_${Date.now()}`,
    to: digits,
    timestamp: Date.now()
  };
}

export async function logoutWhatsAppSession(sessionIdRaw?: string): Promise<WhatsAppPublicStatus> {
  const session = getOrCreateSession(sessionIdRaw);
  session.manualDisconnect = true;

  if (session.socket) {
    try {
      await session.socket.logout();
    } catch {
      // ignore if already closed
    }
  }

  cleanupSocketOnly(session);
  clearAuthDir(session.sessionId);

  session.status = 'disconnected';
  session.qrDataUrl = null;
  session.pairingCode = null;
  session.connectedPhone = null;
  session.connectedName = null;
  session.lastError = null;
  session.pairingRequested = false;
  session.updatedAt = Date.now();

  return getPublicStatus(session.sessionId);
}
