# CyberCrew

Production-ready static site for the **CyberCrew** cybersecurity learning community.

Stack: **Astro** (static) + **Decap CMS** for resource/announcement publishing. No application backend is required for the public site.

## Brand

The CyberCrew logo pack in `/Logo` is the identity source of truth: horned red emblem, white `CYBER` wordmark, tracked red `CREW`, on near-black (`#020202`). Brand accent `#ee2227` / ring `#ed2529` and ember `#2e1010` come from the SVG fills; chamfered UI framing and circular badge treatments echo the STICKER / circ marks. Web-optimized copies live in `/public/brand`.

Prefer raster marks in the UI (`logo-hero.webp` for atmospheric badge, `logo-emblem.webp` for header/favicon, `logo-badge.webp` for circular lockups, `logo-full.webp` for the full transparent mark) so desktop-only fonts embedded in source Illustrator SVGs are not required in browsers. Use `logo-on-light.*` on light surfaces and `logo-mono-white.*` when a monochrome mark is needed.

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
| `npm run dev` | Local development server |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview the production build |
| `npm run cms` | Local Decap backend proxy (`decap-server`, pinned in devDependencies) |

## Content model

| Collection | Path | Managed in CMS |
| --- | --- | --- |
| Resources | `src/content/resources/*.md` | Yes |
| Announcements | `src/content/announcements/*.md` | Yes |
| Tracks | `src/content/tracks/*.md` | Editable (create disabled by default) |

Published resources power `/library` and `/library/[slug]`. Featured items surface on the home page.

### Publishing workflow (Decap CMS)

1. Open `/admin/` on a deployed site (trailing slash required so Decap loads `config.yml`; or locally with the CMS proxy).
2. Authenticate via Decap Turbo (production) or the local proxy (development).
3. Create/edit a resource → commit to the content branch.
4. Your host rebuilds the static site; new pages appear after the deploy finishes.

Ordinary resource updates should not require hand-editing React/Astro components once CMS auth + Git are connected.

## Decap CMS authentication

The admin UI at `/admin/` is **not** authenticated by itself.

### Production — Decap Turbo (`turbo-github`)

This project is prepared for [Decap Turbo](https://decapcms.org/docs/turbo-getting-started/) with the GitHub backend:

1. Create a GitHub repository and push this project (`main` branch).
2. Sign up at Decap Turbo and connect GitHub (install the Turbo GitHub App on the account/org that owns the repo).
3. Create a Turbo **site** with:
   - Repo: your `owner/name`
   - Branch: `main`
   - Config path: `public/admin/config.yml`
   - Admin interface URL(s): your production origin (and optionally `http://localhost:4321` for local Turbo login)
4. Copy the **Site ID** (UUID) from the site Overview tab into `public/admin/config.yml` as `turbo_site_id` (replace `REPLACE_WITH_DECAP_TURBO_SITE_ID`). **Do not invent this value.**
5. Redeploy so `/admin/` serves the updated config.
6. Invite editors from the Turbo dashboard.

Requires Decap CMS **3.17.0+** (loaded from the CDN script in `public/admin/index.html`).

Production `/admin` login is **not** claimed working until the real Site ID is set and login is tested on a live deploy.

### Local development

`local_backend: true` remains enabled for localhost editing:

1. `npm run dev`
2. In a second terminal: `npm run cms`
3. Open `http://localhost:4321/admin/`

The local proxy writes to files on disk. It does not apply on the production host.

**Never commit credentials, tokens, or private keys.** Decap Turbo does not require storing OAuth client secrets in this repository.

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
5. Configure Decap Turbo and replace `REPLACE_WITH_DECAP_TURBO_SITE_ID` in `public/admin/config.yml`.
6. Optionally set `site_url` / `display_url` in `public/admin/config.yml` to the production origin.
7. Test `/admin/` login on the live site after Turbo Site ID is set.
8. Add real community contact/social links in `src/data/site.ts` when available (empty values stay hidden).
