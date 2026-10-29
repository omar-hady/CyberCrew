# CyberCrew Decap GitHub OAuth proxy

Cloudflare Worker that implements the Decap CMS GitHub OAuth handshake (`/auth`, `/callback`).

- Official Decap guide: https://decapcms.org/docs/backends-overview/#using-github-with-an-oauth-proxy
- Official Worker template: https://github.com/sterlingwes/decap-proxy

Full site-level setup (OAuth App callback, secrets, `base_url`) lives in the repository root `README.md` under **Production — GitHub + Cloudflare Worker OAuth**.

## Quick deploy (manual)

```bash
cd workers/decap-oauth
npm install
# Edit wrangler.toml: set OAUTH_ALLOWED_ORIGINS to your real site origin(s)
npx wrangler login
npx wrangler deploy
npx wrangler secret put GITHUB_OAUTH_ID
npx wrangler secret put GITHUB_OAUTH_SECRET
```

GitHub OAuth App **Authorization callback URL** must be `{PROXY_URL}/callback`.

Never put client secrets in `wrangler.toml` or commit `.dev.vars`.
