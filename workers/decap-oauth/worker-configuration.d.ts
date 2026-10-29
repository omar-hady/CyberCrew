/**
 * Cloudflare Worker bindings for the Decap GitHub OAuth proxy.
 * Secrets (GITHUB_OAUTH_ID, GITHUB_OAUTH_SECRET) are set via `wrangler secret put`
 * and must never be committed.
 */
interface Env {
  /** GitHub OAuth App client ID (Worker secret). */
  GITHUB_OAUTH_ID: string;
  /** GitHub OAuth App client secret (Worker secret). */
  GITHUB_OAUTH_SECRET: string;
  /**
   * Comma-separated origins allowed as postMessage targets (no trailing slash).
   * Example: https://cybercrew.pages.dev,https://www.example.com
   * Must include every origin where /admin/ is served in production.
   */
  OAUTH_ALLOWED_ORIGINS: string;
  /** Set to "1" if omar-hady/CyberCrew is private (requests repo scope). Default "0". */
  GITHUB_REPO_PRIVATE?: string;
}
