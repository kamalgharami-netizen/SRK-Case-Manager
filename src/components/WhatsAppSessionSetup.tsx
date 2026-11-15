import React, { useState, useEffect, useCallback } from 'react';
import {
  QrCode,
  Smartphone,
  CheckCircle2,
  Loader2,
  LogOut,
  RefreshCw,
  AlertTriangle,
  Wifi,
  WifiOff,
  Copy
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export interface WhatsAppStatusResponse {
  sessionId: string;
  status: 'disconnected' | 'connecting' | 'qr' | 'pairing' | 'connected';
  qrDataUrl: string | null;
  pairingCode: string | null;
  connectedPhone: string | null;
  connectedName: string | null;
  lastError: string | null;
  hasSavedAuth: boolean;
  updatedAt: number;
}

interface WhatsAppSessionSetupProps {
  compact?: boolean;
  onStatusChange?: (status: WhatsAppStatusResponse) => void;
}

export const WhatsAppSessionSetup: React.FC<WhatsAppSessionSetupProps> = ({
  compact = false,
  onStatusChange
}) => {
  const { activeCompany, language, showToast } = useApp();
  const bn = language === 'bn';
  const sessionId = activeCompany?.id || 'default';

  const [session, setSession] = useState<WhatsAppStatusResponse | null>(null);
  const [loginMode, setLoginMode] = useState<'qr' | 'pairing'>('qr');
  const [pairingPhone, setPairingPhone] = useState<string>(
    activeCompany?.whatsappSettings?.senderPhone || activeCompany?.phone || ''
  );
  const [isStarting, setIsStarting] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/whatsapp/status?sessionId=${encodeURIComponent(sessionId)}`);
      if (!res.ok) return;
      const data: WhatsAppStatusResponse = await res.json();
      setSession(data);
      onStatusChange?.(data);
    } catch {
      // ignore background network poll error
    }
  }, [sessionId, onStatusChange]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Poll live QR / Pairing / Connecting status every 2 seconds while linking
  useEffect(() => {
    if (!session || session.status === 'connected' || session.status === 'disconnected') {
      return;
    }
    const id = window.setInterval(fetchStatus, 2000);
    return () => window.clearInterval(id);
  }, [session, fetchStatus]);

  const handleStartLogin = async (modeOverride?: 'qr' | 'pairing') => {
    const chosenMode = modeOverride || loginMode;
    if (chosenMode === 'pairing' && pairingPhone.replace(/\D/g, '').length < 10) {
      showToast(
        bn ? 'সঠিক ১০ সংখ্যার WhatsApp মোবাইল নম্বর দিন' : 'Enter a valid 10-digit WhatsApp mobile number',
        'error'
      );
      return;
    }

    setIsStarting(true);
    try {
      const res = await fetch('/api/whatsapp/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          mode: chosenMode,
          phoneNumber: chosenMode === 'pairing' ? pairingPhone : undefined
        })
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to start WhatsApp login', 'error');
        return;
      }
      setSession(data);
      onStatusChange?.(data);
    } catch (err: any) {
      showToast(err?.message || 'Unable to connect to WhatsApp login service', 'error');
    } finally {
      setIsStarting(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const res = await fetch('/api/whatsapp/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });
      const data = await res.json();
      setSession(data);
      onStatusChange?.(data);
      showToast(bn ? 'WhatsApp সেশন লগআউট হয়েছে' : 'WhatsApp account disconnected cleanly', 'info');
    } catch {
      showToast('Failed to disconnect WhatsApp session', 'error');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const isConnected = session?.status === 'connected';
  const isConnecting = session?.status === 'connecting';

  return (
    <div
      className={`rounded-2xl border ${
        isConnected
          ? 'border-emerald-300 bg-emerald-50/70 dark:bg-emerald-950/30 dark:border-emerald-800'
          : 'border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60'
      } ${compact ? 'p-3.5 space-y-3' : 'p-4 sm:p-5 space-y-4'}`}
    >
      {/* Connection Status Row */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              isConnected
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            {isConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 flex-wrap">
              <span>{bn ? 'ইন-অ্যাপ WhatsApp লগইন সেটআপ' : 'In-App WhatsApp Account Login'}</span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isConnected
                    ? 'bg-emerald-600 text-white'
                    : session?.status === 'qr' || session?.status === 'pairing' || isConnecting
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {isConnected
                  ? bn ? 'সংযুক্ত (Connected)' : 'Connected'
                  : session?.status === 'qr'
                  ? 'Scan QR Code'
                  : session?.status === 'pairing'
                  ? 'Enter Pairing Code'
                  : isConnecting
                  ? 'Connecting...'
                  : bn ? 'লগইন করা নেই' : 'Not Logged In'}
              </span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
              {isConnected
                ? `${session?.connectedName ? `${session.connectedName} · ` : ''}+${session?.connectedPhone || 'Linked Device'} — Messages send directly inside app`
                : bn
                ? 'বাইরের ব্রাউজার বা ডেস্কটপ অ্যাপ ছাড়াই সরাসরি অ্যাপ থেকে WhatsApp মেসেজ পাঠাতে একবার লগইন করুন।'
                : 'Link your WhatsApp once inside the app to send transaction & case messages without opening WhatsApp Desktop or Browser.'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={fetchStatus}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-600 cursor-pointer"
            title="Refresh WhatsApp status"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isConnecting ? 'animate-spin' : ''}`} />
          </button>
          {isConnected && (
            <button
              type="button"
              disabled={isLoggingOut}
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer disabled:opacity-60"
            >
              {isLoggingOut ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogOut className="w-3.5 h-3.5" />}
              <span>{bn ? 'লগআউট' : 'Logout WhatsApp'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Connected confirmation */}
      {isConnected && (
        <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300 font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            {bn
              ? 'WhatsApp অ্যাকাউন্ট সফলভাবে সংযুক্ত আছে। এখন লেনদেন ও মামলার সমস্ত মেসেজ সরাসরি অ্যাপ থেকেই পাঠানো যাবে।'
              : 'WhatsApp session is active. All transaction receipts, ledger updates & case notices send directly from inside SRK Case Manager.'}
          </span>
        </div>
      )}

      {/* Login Setup Controls (when not connected) */}
      {!isConnected && (
        <div className="space-y-3">
          {/* Login method switcher */}
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-200/70 dark:bg-slate-800 text-xs font-bold">
            <button
              type="button"
              onClick={() => setLoginMode('qr')}
              className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                loginMode === 'qr'
                  ? 'bg-white dark:bg-slate-900 text-emerald-700 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>{bn ? 'QR কোড স্ক্যান' : 'Scan QR Code'}</span>
            </button>
            <button
              type="button"
              onClick={() => setLoginMode('pairing')}
              className={`py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                loginMode === 'pairing'
                  ? 'bg-white dark:bg-slate-900 text-blue-700 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>{bn ? 'ফোন নম্বর কোড' : 'Mobile Pairing Code'}</span>
            </button>
          </div>

          {session?.lastError && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-[11px] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{session.lastError}</span>
            </div>
          )}

          {loginMode === 'qr' ? (
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-4">
              {session?.qrDataUrl ? (
                <div className="shrink-0 p-2 rounded-xl border-2 border-emerald-500 bg-white shadow-sm">
                  <img
                    src={session.qrDataUrl}
                    alt="WhatsApp Login QR Code"
                    className="w-44 h-44 object-contain"
                  />
                </div>
              ) : (
                <div className="w-44 h-44 shrink-0 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex flex-col items-center justify-center text-center p-3 gap-2">
                  {isStarting || isConnecting ? (
                    <>
                      <Loader2 className="w-7 h-7 animate-spin text-emerald-600" />
                      <span className="text-[11px] font-semibold text-slate-600">
                        Generating WhatsApp QR Code...
                      </span>
                    </>
                  ) : (
                    <>
                      <QrCode className="w-8 h-8 text-slate-400" />
                      <span className="text-[11px] text-slate-500">
                        Click "Generate QR Code" to link WhatsApp
                      </span>
                    </>
                  )}
                </div>
              )}

              <div className="flex-1 space-y-2.5 text-xs">
                <div className="font-bold text-slate-900 dark:text-slate-100">
                  {bn ? 'মোবাইল WhatsApp দিয়ে স্ক্যান করুন:' : 'How to Link via QR Code:'}
                </div>
                <ol className="text-[11px] text-slate-600 dark:text-slate-400 space-y-1 list-decimal list-inside">
                  <li>Open WhatsApp on your mobile phone</li>
                  <li>Tap <strong>Linked Devices</strong> (Settings / Menu)</li>
                  <li>Tap <strong>Link a Device</strong> and scan this QR code</li>
                </ol>
                <div className="pt-1 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={isStarting}
                    onClick={() => handleStartLogin('qr')}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-60 shadow-xs"
                  >
                    {isStarting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <QrCode className="w-3.5 h-3.5" />}
                    <span>{session?.qrDataUrl ? 'Refresh QR Code' : 'Generate QR Code'}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                {bn ? 'মোবাইল নম্বর দিয়ে লিঙ্ক কোড পান (ফোনে ব্যবহারের জন্য সুবিধাজনক):' : 'Link Using Your WhatsApp Phone Number (Best for Same-Phone Use):'}
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="tel"
                  value={pairingPhone}
                  onChange={e => setPairingPhone(e.target.value)}
                  placeholder="Enter your 10-digit WhatsApp number"
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold"
                />
                <button
                  type="button"
                  disabled={isStarting}
                  onClick={() => handleStartLogin('pairing')}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60 shrink-0"
                >
                  {isStarting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Smartphone className="w-3.5 h-3.5" />}
                  <span>{bn ? 'পেয়ারিং কোড তৈরি করুন' : 'Get Pairing Code'}</span>
                </button>
              </div>

              {session?.pairingCode && (
                <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div>
                    <div className="text-[11px] font-bold text-blue-900 dark:text-blue-200 uppercase">
                      Enter This 8-Character Code in WhatsApp → Linked Devices → Link with Phone Number:
                    </div>
                    <div className="text-2xl font-black tracking-[0.2em] font-mono text-blue-700 dark:text-blue-300 mt-1">
                      {session.pairingCode}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(session.pairingCode || '');
                      showToast('Pairing code copied!', 'success');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white border border-blue-300 text-blue-700 text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Code</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
