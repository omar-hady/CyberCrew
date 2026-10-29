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

**Production:** Open `/admin/` on the deployed site (trailing slash) → authenticate via Decap Turbo → create/edit → Decap commits to the content branch → your host rebuilds → pages update after the deploy finishes.

Ordinary resource updates should not require hand-editing Astro components once CMS auth + Git are connected.

## Decap CMS authentication

The admin UI at `/admin/` is **not** authenticated by itself.

### Local development (active now)

`config.yml` uses `backend.name: git-gateway` with `local_backend` so `/admin/` works without a Turbo Site ID ([Decap proxy docs](https://decapcms.org/docs/decap-proxy/)):

1. From the repo root: `npm run dev` (Astro must be in **dev** mode, not `preview`)
2. In a second terminal, from the same root: `npm run cms`
3. Open `http://localhost:4321/admin/` (trailing slash) and click **Login** (no email/password — the local proxy has no auth)
4. Create/edit a resource or announcement → Decap writes `src/content/**/*.md` (and media under `public/uploads/resources/`)
5. Refresh `/library`, `/library/<slug>`, `/community`, or the home page — Astro’s content glob loader picks up the new/changed files without a production deploy

`npm run preview` and a Cloudflare/Pages deploy only see CMS changes after a fresh `npm run build` (or host rebuild). For local publishing checks, always use `dev` + `cms`.

Optional: `npm run cms:check` confirms the proxy is listening on port 8081.

The local proxy writes to files on disk. It does not apply on the production host.

### Production — Decap Turbo (`turbo-github`)

After the GitHub repo exists, switch the `backend` block in `public/admin/config.yml` to the commented `turbo-github` example (keep the existing `local_backend` block so localhost still uses `decap-server`):

1. Create a GitHub repository and push this project (`main` branch).
2. Sign up at [Decap Turbo](https://decapcms.org/docs/turbo-getting-started/) and connect GitHub (install the Turbo GitHub App on the account/org that owns the repo).
3. Create a Turbo **site** with:
   - Repo: your `owner/name`
   - Branch: `main`
   - Config path: `public/admin/config.yml`
   - Admin interface URL(s): your production origin (and optionally `http://localhost:4321` for local Turbo login)
4. Paste the **Site ID** (UUID) from the site Overview tab as `turbo_site_id`. **Do not invent this value.**
5. Redeploy so `/admin/` serves the updated config.
6. Invite editors from the Turbo dashboard (GitHub OAuth — not email/password in this repo).

Requires Decap CMS **3.17.0+** (loaded from the CDN script in `src/pages/admin.html`).

Production `/admin` login is **not** claimed working until the real Site ID is set and login is tested on a live deploy.

**Never commit credentials, tokens, or private keys.** Decap Turbo does not require storing OAuth client secrets in this repository. Local `decap-server` has no authentication.

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
6. Complete Decap Turbo setup (above), then set `turbo_site_id` and redeploy.

Deployment and CMS auth are **not** claimed complete until you connect the host, set the Turbo Site ID, and verify a live URL plus `/admin` login.

## Project structure

```
public/           Static assets, Decap admin, uploads, Cloudflare _headers/_redirects
src/content/      Markdown collections (CMS-managed)
src/components/   UI building blocks
src/layouts/      Base layout + SEO
src/pages/        Routes (includes dynamic /robots.txt)
src/styles/       Design tokens + global CSS
src/data/site.ts  Nav, social/email stubs, env-backed URLs
src/lib/          Resource and track helpers
Logo/             Original brand package (source of truth)
```

Track listings (home, `/tracks`, about, footer) load from `src/content/tracks/` so CMS edits stay in sync with detail pages.

## Accessibility & motion

Semantic landmarks, skip link, visible focus rings, keyboard mobile nav (Escape, focus trap, click-outside), and `prefers-reduced-motion` support are included.

## Remaining setup checklist (requires your input / accounts)

1. Push `main` to GitHub if the remote is not yet the source of truth for Cloudflare (do not invent owner/repo names).
2. Connect Cloudflare Pages to that repo; confirm build uses `npm run build` → `dist` (Node 22).
3. Set `PUBLIC_SITE_URL` to the real domain (then rebuild) — enables canonical URLs, sitemap, and the Sitemap line in `/robots.txt`.
4. Set `PUBLIC_CTF_URL` when the arena URL is known.
5. Configure Decap Turbo, switch `backend` to `turbo-github`, and paste the real Site ID UUID into `public/admin/config.yml` (do not invent it).
6. Optionally set `site_url` / `display_url` in `public/admin/config.yml` to the production origin.
7. Test `/admin/` login on the live site after Turbo Site ID is set.
8. Add real community contact/social links in `src/data/site.ts` when available (empty values stay hidden).
