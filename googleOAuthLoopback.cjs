const http = require("node:http");

const CALLBACK_PATH = "/oauth2callback";
const DEFAULT_TIMEOUT_MS = 180000;

function createGoogleOAuthLoopbackListener(options = {}) {
  const expectedState = options.expectedState;
  const timeoutMs = Number.isFinite(options.timeoutMs)
    ? Math.max(10000, Math.min(300000, options.timeoutMs))
    : DEFAULT_TIMEOUT_MS;

  if (typeof expectedState !== "string" || expectedState.length < 32 || expectedState.length > 256) {
    throw new Error("A valid OAuth state value is required.");
  }

  let settled = false;
  let timer;
  let resolveResult;
  let rejectResult;
  const resultPromise = new Promise((resolve, reject) => {
    resolveResult = resolve;
    rejectResult = reject;
  });
  // The caller may cancel or time out before it starts awaiting the result.
  resultPromise.catch(() => {});

  const server = http.createServer((request, response) => {
    const requestUrl = new URL(request.url || "/", "http://127.0.0.1");
    if (request.method !== "GET" || requestUrl.pathname !== CALLBACK_PATH) {
      response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      response.end("Not found");
      return;
    }

    if (settled) {
      response.writeHead(410, { "content-type": "text/plain; charset=utf-8" });
      response.end("This sign-in request has already been completed.");
      return;
    }

    const receivedState = requestUrl.searchParams.get("state") || "";
    if (receivedState !== expectedState) {
      response.writeHead(400, { "content-type": "text/plain; charset=utf-8" });
      response.end("Invalid sign-in state. Return to SRK Case Manager and try again.");
      return;
    }

    const oauthError = requestUrl.searchParams.get("error");
    const code = requestUrl.searchParams.get("code");
    settled = true;
    clearTimeout(timer);

    if (oauthError) {
      response.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
      response.end("<!doctype html><title>Sign-in not completed</title><p>Google sign-in was not completed. You may close this window.</p>");
      resolveResult({ error: oauthError });
      return;
    }

    if (!code || code.length > 8192) {
      response.writeHead(400, { "content-type": "text/plain; charset=utf-8" });
      response.end("The sign-in response did not contain a valid authorization code.");
      rejectResult(new Error("Google OAuth callback did not contain a valid authorization code."));
      return;
    }

    response.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
    response.end("<!doctype html><title>Sign-in complete</title><p>Google sign-in response received. You may close this window and return to SRK Case Manager.</p>");
    resolveResult({ code });
  });

  const close = () => {
    clearTimeout(timer);
    if (server.listening) server.close();
    if (!settled) {
      settled = true;
      rejectResult(new Error("Google sign-in was cancelled."));
    }
  };

  const ready = new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      server.removeListener("error", reject);
      const address = server.address();
      if (!address || typeof address === "string") {
        close();
        reject(new Error("Unable to start the Google sign-in callback listener."));
        return;
      }
      timer = setTimeout(() => {
        if (!settled) {
          settled = true;
          server.close();
          rejectResult(new Error("Google sign-in timed out. Please try again."));
        }
      }, timeoutMs);
      if (typeof timer.unref === "function") timer.unref();
      resolve({ redirectUri: `http://127.0.0.1:${address.port}${CALLBACK_PATH}` });
    });
  });

  return {
    ready,
    waitForCallback: () => resultPromise,
    close,
  };
}

module.exports = { createGoogleOAuthLoopbackListener };
