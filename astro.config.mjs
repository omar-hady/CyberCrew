// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

const site = process.env.PUBLIC_SITE_URL || undefined;

// https://astro.build/config
export default defineConfig({
  site,
  integrations: site ? [sitemap()] : [],
  // "ignore" keeps pretty URLs without trailing slashes while still allowing
  // /admin/ (required for Decap's relative config.yml resolution).
  trailingSlash: "ignore",
});
