/**
 * Decap CMS GitHub OAuth proxy for Cloudflare Workers.
 *
 * Based on the official Decap-linked template:
 * https://github.com/sterlingwes/decap-proxy
 * https://decapcms.org/docs/backends-overview/#using-github-with-an-oauth-proxy
 *
 * Security additions vs the stock template:
 * - OAuth `state` cookie CSRF check on /callback
 * - postMessage targetOrigin restricted to OAUTH_ALLOWED_ORIGINS (no `*`)
 * - Secrets only via Worker bindings (never hardcoded)
 */

import { OAuthClient } from './oauth';

const STATE_COOKIE = 'decap_oauth_state';
const STATE_MAX_AGE_SEC = 600;

function randomHex(bytes: number): string {
  const buf = new Uint8Array(bytes);
  crypto.getRandomValues(buf);
  return Array.from(buf)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

function parseCookie(header: string | null, name: string): string | null {
  if (!header) return null;
  for (const part of header.split(';')) {
    const [rawKey, ...rest] = part.trim().split('=');
    if (rawKey === name) return decodeURIComponent(rest.join('=') || '');
  }
  return null;
}

function parseAllowedOrigins(raw: string | undefined): string[] {
  if (!raw || !raw.trim()) return [];
  return raw
    .split(',')
    .map((s) => s.trim().replace(/\/$/, ''))
    .filter((s) => {
      if (!s || s.includes('REPLACE_WITH')) return false;
      try {
        const u = new URL(s);
        return u.protocol === 'https:' || u.hostname === 'localhost' || u.hostname === '127.0.0.1';
      } catch {
        return false;
      }
    });
}

function requireSecrets(env: Env): Response | null {
  if (!env.GITHUB_OAUTH_ID || !env.GITHUB_OAUTH_SECRET) {
    return new Response(
      'OAuth secrets are not configured. Set GITHUB_OAUTH_ID and GITHUB_OAUTH_SECRET via `wrangler secret put`.',
      { status: 503 }
    );
  }
  return null;
}

function createOAuth(env: Env) {
  return new OAuthClient({
    id: env.GITHUB_OAUTH_ID,
    secret: env.GITHUB_OAUTH_SECRET,
    target: {
      tokenHost: 'https://github.com',
      tokenPath: '/login/oauth/access_token',
      authorizePath: '/login/oauth/authorize',
    },
  });
}

/** GitHub Authorization callback URL registered on the OAuth App (no query string). */
function callbackRedirectUri(url: URL): string {
  return `https://${url.hostname}/callback`;
}

function clearStateCookie(): string {
  return `${STATE_COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`;
}

const handleAuth = async (url: URL, env: Env): Promise<Response> => {
  const missing = requireSecrets(env);
  if (missing) return missing;

  const provider = url.searchParams.get('provider');
  if (provider !== 'github') {
    return new Response('Invalid provider', { status: 400 });
  }

  const allowed = parseAllowedOrigins(env.OAUTH_ALLOWED_ORIGINS);
  if (allowed.length === 0) {
    return new Response(
      'OAUTH_ALLOWED_ORIGINS is unset or still a placeholder. Set production site origin(s) in wrangler.toml [vars] before auth can proceed.',
      { status: 503 }
    );
  }

  const repoIsPrivate = env.GITHUB_REPO_PRIVATE != undefined && env.GITHUB_REPO_PRIVATE !== '0';
  const repoScope = repoIsPrivate ? 'repo user' : 'public_repo user';

  const state = randomHex(16);
  const oauth2 = createOAuth(env);
  const authorizationUri = oauth2.authorizeURL({
    redirect_uri: callbackRedirectUri(url),
    scope: repoScope,
    state,
  });

  return new Response(null, {
    status: 302,
    headers: {
      Location: authorizationUri,
      'Set-Cookie': `${STATE_COOKIE}=${encodeURIComponent(state)}; Path=/; Max-Age=${STATE_MAX_AGE_SEC}; HttpOnly; Secure; SameSite=Lax`,
      'Cache-Control': 'no-store',
    },
  });
};

/**
 * Decap listens on the opener for `authorization:github:success:{"token":"..."}`.
 * Target each allowlisted origin so the token is never posted with `*`.
 */
const callbackScriptResponse = (status: 'success' | 'error', token: string, allowedOrigins: string[]) => {
  const originsJson = JSON.stringify(allowedOrigins);
  const payload = JSON.stringify({ token });
  // Escape for embedding inside a JS string literal in HTML.
  const safeStatus = status === 'success' ? 'success' : 'error';
  const message = `authorization:github:${safeStatus}:${payload}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Authorizing Decap…</title>
</head>
<body>
  <p>Authorizing Decap…</p>
  <script>
    (function () {
      var allowed = ${originsJson};
      var authMessage = ${JSON.stringify(message)};
      function postToAllowed(data) {
        if (!window.opener) return;
        for (var i = 0; i < allowed.length; i++) {
          try { window.opener.postMessage(data, allowed[i]); } catch (e) {}
        }
      }
      function receiveMessage(message) {
        postToAllowed(authMessage);
        window.removeEventListener("message", receiveMessage, false);
      }
      window.addEventListener("message", receiveMessage, false);
      postToAllowed("authorizing:github");
    })();
  </script>
</body>
</html>`;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'Set-Cookie': clearStateCookie(),
    },
  });
};

const handleCallback = async (request: Request, url: URL, env: Env): Promise<Response> => {
  const missing = requireSecrets(env);
  if (missing) return missing;

  const allowed = parseAllowedOrigins(env.OAUTH_ALLOWED_ORIGINS);
  if (allowed.length === 0) {
    return new Response('OAUTH_ALLOWED_ORIGINS is not configured.', { status: 503 });
  }

  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const oauthError = url.searchParams.get('error');

  if (oauthError) {
    return callbackScriptResponse('error', oauthError, allowed);
  }

  if (!code || !state) {
    return new Response('Missing code or state', { status: 400 });
  }

  const cookieState = parseCookie(request.headers.get('Cookie'), STATE_COOKIE);
  if (!cookieState || !timingSafeEqual(cookieState, state)) {
    return new Response('Invalid OAuth state', {
      status: 400,
      headers: { 'Set-Cookie': clearStateCookie() },
    });
  }

  try {
    const oauth2 = createOAuth(env);
    const accessToken = await oauth2.getToken({
      code,
      redirect_uri: callbackRedirectUri(url),
    });
    return callbackScriptResponse('success', accessToken, allowed);
  } catch {
    return callbackScriptResponse('error', 'token_exchange_failed', allowed);
  }
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/auth') {
      return handleAuth(url, env);
    }
    if (url.pathname === '/callback') {
      return handleCallback(request, url, env);
    }

    return new Response(
      'CyberCrew Decap OAuth proxy. Endpoints: /auth , /callback',
      { status: 200, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
    );
  },
};
