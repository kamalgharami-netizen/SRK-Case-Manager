import React, { Component, ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// In development mode or inside an iframe (like AI Studio preview), disable Service Worker to prevent reload loops
if ('serviceWorker' in navigator) {
  const isDevOrIframe = import.meta.env.DEV || (typeof window !== 'undefined' && window.self !== window.top);

  if (isDevOrIframe) {
    // Unregister any lingering service workers so they don't intercept dev server requests or reload the iframe
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const reg of registrations) {
        reg.unregister().catch(() => {});
      }
    }).catch(() => {});
  } else {
    // Standalone production PWA only
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then((registration) => {
          registration.update().catch(() => {});
        })
        .catch(() => {});
    });
  }
}

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class AppErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('AppErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-slate-800 p-6 rounded-2xl border border-slate-700 text-center space-y-4">
            <h2 className="text-base font-bold text-rose-400">Application Initialization Notice</h2>
            <p className="text-xs text-slate-300">
              The application encountered a display sync issue. Click below to refresh the chamber view.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg cursor-pointer"
            >
              Refresh Chamber View
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <AppErrorBoundary>
    <App />
  </AppErrorBoundary>
);
