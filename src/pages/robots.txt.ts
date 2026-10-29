import type { APIRoute } from "astro";
import { site } from "../data/site";

export const prerender = true;

export const GET: APIRoute = () => {
  const lines = [
    "User-agent: *",
    "Allow: /",
    "",
    "Disallow: /admin/",
    "",
  ];

  if (site.url) {
    const origin = site.url.replace(/\/$/, "");
    lines.push(`Sitemap: ${origin}/sitemap-index.xml`, "");
  } else {
    lines.push(
      "# Sitemap is emitted after PUBLIC_SITE_URL is set and the site is rebuilt.",
      "",
    );
  }

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
