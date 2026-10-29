# CyberCrew

Production-ready static site for the **CyberCrew** cybersecurity learning community.

Stack: **Astro** (static) + **Decap CMS** for resource/announcement publishing. No application backend is required for the public site.

## Brand

The CyberCrew logo pack in `/LOGO` is the identity source of truth (`ICON/`, `HORIZONTAL/`, `VERTICAL/`): horned red emblem, white `CYBER` wordmark, tracked red `CREW`, on near-black (`#020202`). Brand accent `#ee2227` / ring `#ed2529` and ember `#2e1010` come from the SVG fills; chamfered UI framing and circular badge treatments echo the STICKER / circ marks. Web-optimized copies live in `/public/brand`.

Prefer raster marks in the UI so desktop-only fonts embedded in source Illustrator SVGs are not required in browsers:
- `logo-horizontal.webp` — navbar / CMS / Organization schema (dark surfaces)
- `logo-horizontal-on-light.webp` — light surfaces
- `logo-hero.webp` — atmospheric circular hero badge
- `logo-badge.webp` — circular sticker lockups (footer, About)
- `logo-emblem.webp` / `logo-icon.webp` — emblem-only mark / favicon source
- `logo-full.webp` — full vertical transparent mark
- `logo-on-light.*` / `logo-mono-white.*` — light-surface and monochrome variants

## Quick start

```bash
npm install
npm run dev
```

Open the local URL printed by Astro (typically `http://localhost:4321`).

### Optional environment

Copy `.env.example` to `.env`:

| Variable | Purpose |
| --- | --- |
| `PUBLIC_SITE_URL` | Absolute site origin (enables canonical URLs + sitemap). Leave unset until the production domain is known. |
| `PUBLIC_CTF_URL` | Real external CTF platform URL. **Do not invent one.** Until set, `/ctf` explains the missing configuration. |

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Local development server (required for live CMS → site updates) |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview the production build (frozen `dist/` — does **not** hot-reload CMS file writes) |
| `npm run cms` | Local Decap backend proxy (`decap-server`, pinned in devDependencies) |
| `npm run cms:check` | Ping the local CMS proxy (`info` action) |

## Content model

| Collection | Path | Managed in CMS |
| --- | --- | --- |
| Resources | `src/content/resources/*.md` | Yes |
| Announcements | `src/content/announcements/*.md` | Yes |
| Tracks | `src/content/tracks/*.md` | Editable (create disabled by default) |

Published resources power `/library` and `/library/[slug]`. Featured items surface on the home page.

### Publishing workflow (Decap CMS)

**Local:** `npm run dev` + `npm run cms` → open `/admin/` → save → refresh the site. Astro’s content loader watches `src/content/**` and picks up new/changed markdown without a deploy. Do not use `npm run preview` for this check — it serves a frozen `dist/` build.

**Production:** Open `/admin/` on the deployed site (trailing slash) → authenticate with GitHub via the Cloudflare Worker OAuth proxy → create/edit → Decap commits to `main` on `omar-hady/CyberCrew` → your host rebuilds → pages update after the deploy finishes.

Ordinary resource updates should not require hand-editing Astro components once CMS auth + Git are connected.

## Decap CMS authentication

The admin UI at `/admin/` is **not** authenticated by itself. Production login uses a self-hosted [GitHub OAuth proxy on Cloudflare Workers](https://decapcms.org/docs/backends-overview/#using-github-with-an-oauth-proxy) (official template: [sterlingwes/decap-proxy](https://github.com/sterlingwes/decap-proxy)). Decap Turbo is not required.

**Never commit** GitHub OAuth client secrets, tokens, or `.dev.vars`. Worker secrets are set only with `wrangler secret put` (or the Cloudflare dashboard). Local `decap-server` has no authentication.

### Local development (unchanged)

`local_backend` stays enabled so localhost uses `decap-server` and never needs the Worker ([Decap proxy docs](https://decapcms.org/docs/decap-proxy/)):

1. From the repo root: `npm run dev` (Astro must be in **dev** mode, not `preview`)
2. In a second terminal, from the same root: `npm run cms`
3. Open `http://localhost:4321/admin/` (trailing slash) and click **Login** (no email/password — the local proxy has no auth)
4. Create/edit a resource or announcement → Decap writes `src/content/**/*.md` (and media under `public/uploads/resources/`)
5. Refresh `/library`, `/library/<slug>`, `/community`, or the home page — Astro’s content glob loader picks up the new/changed files without a production deploy

`npm run preview` and a Cloudflare/Pages deploy only see CMS changes after a fresh `npm run build` (or host rebuild). For local publishing checks, always use `dev` + `cms`.

Optional: `npm run cms:check` confirms the proxy is listening on port 8081.

The local proxy writes to files on disk. It does not apply on the production host.

### Production — GitHub + Cloudflare Worker OAuth (`workers/decap-oauth`)

`public/admin/config.yml` uses the `github` backend for repo `omar-hady/CyberCrew`. Production login works only after you finish the **manual** steps below (nothing in this checklist is deployed or credentialed automatically).

#### Values you will produce

| Item | Value |
| --- | --- |
| GitHub OAuth App callback URL | `{PROXY_URL}/callback` (exact; no trailing slash on `{PROXY_URL}`) |
| Worker secrets | `GITHUB_OAUTH_ID`, `GITHUB_OAUTH_SECRET` |
| Worker var | `OAUTH_ALLOWED_ORIGINS` = production site origin(s), comma-separated, no trailing slash |
| Decap `base_url` | `{PROXY_URL}` (Worker origin only — no `/auth`, no trailing slash) |
| Decap `auth_endpoint` | `auth` |

`{PROXY_URL}` examples after deploy: `https://cybercrew-decap-oauth.<your-subdomain>.workers.dev` or a custom domain you bind in `workers/decap-oauth/wrangler.toml`.

#### Manual setup steps (required before production login)

1. **Confirm GitHub repo access** — Editors who log into `/admin/` must have push access to `omar-hady/CyberCrew` on `main`.

2. **Set allowed site origins on the Worker** — Edit `workers/decap-oauth/wrangler.toml` and replace the `OAUTH_ALLOWED_ORIGINS` placeholder with your real site origin(s), for example:
   ```toml
   OAUTH_ALLOWED_ORIGINS = "https://your-pages-or-custom-domain.example"
   ```
   Add comma-separated extra origins only if you intentionally allow CMS login there (e.g. a stable custom domain). Do not leave `REPLACE_WITH_…` in place.

3. **Create a GitHub OAuth App** (account that can register apps for this project) at [GitHub → Developer settings → OAuth Apps → New](https://github.com/settings/applications/new):
   - **Application name:** e.g. `CyberCrew Decap CMS`
   - **Homepage URL:** `{PROXY_URL}` (or your public site URL)
   - **Authorization callback URL:** `{PROXY_URL}/callback`
   - Register the app, then copy the **Client ID** and generate a **Client secret**. Store them outside the repo.

   If you do not know `{PROXY_URL}` yet, deploy the Worker first (step 4), copy the URL Cloudflare prints, then create/update the OAuth App callback to match, then set secrets (step 5).

4. **Deploy the Worker** (from a machine logged into Cloudflare — do this yourself; CI is not configured here):
   ```bash
   cd workers/decap-oauth
   npm install
   npx wrangler login
   npx wrangler deploy
   ```
   Note the printed Worker URL → that is `{PROXY_URL}`. Optional custom domain: uncomment/edit the `route` in `wrangler.toml` and redeploy.

5. **Set Worker secrets** (never commit these values):
   ```bash
   cd workers/decap-oauth
   npx wrangler secret put GITHUB_OAUTH_ID
   # paste Client ID when prompted
   npx wrangler secret put GITHUB_OAUTH_SECRET
   # paste Client secret when prompted
   ```

6. **Point Decap at the Worker** — In `public/admin/config.yml`, set:
   ```yaml
   backend:
     name: github
     repo: omar-hady/CyberCrew
     branch: main
     base_url: https://YOUR_ACTUAL_WORKER_ORIGIN
     auth_endpoint: auth
   ```
   Keep the `local_backend` block as-is. Commit/push and let Cloudflare Pages (or your host) rebuild so production `/admin/config.yml` has the real `base_url`.

7. **Private repo only** — If `omar-hady/CyberCrew` is private, set `GITHUB_REPO_PRIVATE = "1"` in `wrangler.toml` and redeploy the Worker so the OAuth scope includes `repo`.

8. **Verify production login** — Open `https://<your-site>/admin/` → Login with GitHub → authorize → confirm the CMS loads the repo. Then create a test entry and confirm a commit appears on `main`.

Production `/admin` login is **not** claimed working until `{PROXY_URL}`, OAuth App callback, Worker secrets, `OAUTH_ALLOWED_ORIGINS`, and `base_url` are all real values and login is tested on a live deploy.

Requires Decap CMS **3.17.0+** (loaded from the CDN script in `src/pages/admin/index.html`).

## Storage limits (important)

- Static hosts serve public files. Anything committed under `public/uploads/` is downloadable by anyone who has the URL.
- Do **not** describe public uploads as private or secure.
- Prefer linking large binaries or malware samples from appropriate external storage; do not commit large or hazardous binaries to Git.
- Malware samples must only be handled in isolated labs — never execute untrusted files in the browser or on trusted machines.

## CTF Arena

This project does **not** reimplement a CTF engine. `/ctf` is a branded integration page. Configure `PUBLIC_CTF_URL` when the existing platform address is available.

## Deployment (Cloudflare Pages + GitHub)

Verified local build settings (match Cloudflare’s Astro preset):

| Setting | Value |
| --- | --- |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Node version | `22` (see `.nvmrc`; `package.json` engines require `>=22.12.0`) |

Cloudflare-specific static rules live in `public/_redirects` and `public/_headers` (copied into `dist/` on build). Alternate host configs (`netlify.toml`, `vercel.json`) remain for optional use; they are not required for Cloudflare Pages.

### Suggested Cloudflare Pages steps

1. Push this repo to GitHub on `main` (see commands you receive after local Git setup).
2. Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git → select the repo.
3. Framework preset: **Astro** (or set build command / output manually as above).
4. Set environment variables for production (and preview if desired):
   - `PUBLIC_SITE_URL` = your real origin (no trailing slash), once known
   - `PUBLIC_CTF_URL` = real CTF URL when available
   - `NODE_VERSION` = `22` if the dashboard does not pick up `.nvmrc`
5. Deploy and open the live URL. Confirm pages and `/admin/` load.
6. Complete the Worker OAuth setup (above), set `backend.base_url` to the real Worker origin, and redeploy the site.

Deployment and CMS auth are **not** claimed complete until you connect the host, finish Worker + GitHub OAuth App setup, and verify a live URL plus `/admin` login.

## Project structure

```
public/                 Static assets, Decap admin, uploads, Cloudflare _headers/_redirects
workers/decap-oauth/    Cloudflare Worker GitHub OAuth proxy for production Decap login
src/content/            Markdown collections (CMS-managed)
src/components/         UI building blocks
src/layouts/            Base layout + SEO
src/pages/              Routes (includes dynamic /robots.txt)
src/styles/             Design tokens + global CSS
src/data/site.ts        Nav, social/email stubs, env-backed URLs
src/lib/                Resource and track helpers
Logo/                   Original brand package (source of truth)
```

Track listings (home, `/tracks`, about, footer) load from `src/content/tracks/` so CMS edits stay in sync with detail pages.

## Accessibility & motion

Semantic landmarks, skip link, visible focus rings, keyboard mobile nav (Escape, focus trap, click-outside), and `prefers-reduced-motion` support are included.

## Remaining setup checklist (requires your input / accounts)

1. Push `main` to GitHub if the remote is not yet the source of truth for Cloudflare.
2. Connect Cloudflare Pages to `omar-hady/CyberCrew`; confirm build uses `npm run build` → `dist` (Node 22).
3. Set `PUBLIC_SITE_URL` to the real domain (then rebuild) — enables canonical URLs, sitemap, and the Sitemap line in `/robots.txt`.
4. Set `PUBLIC_CTF_URL` when the arena URL is known.
5. Deploy `workers/decap-oauth`, create the GitHub OAuth App (`{PROXY_URL}/callback`), set Worker secrets, set `OAUTH_ALLOWED_ORIGINS`, and replace `base_url` in `public/admin/config.yml` (see Production OAuth section above).
6. Optionally set `site_url` / `display_url` in `public/admin/config.yml` to the production origin.
7. Test `/admin/` login on the live site after `base_url` and secrets are real.
8. Add real community contact/social links in `src/data/site.ts` when available (empty values stay hidden).
