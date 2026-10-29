import { getCollection, type CollectionEntry } from "astro:content";

export type Resource = CollectionEntry<"resources">;

/** Prefer content-layer id; fall back to filename if HMR ever yields a partial entry. */
export function resourceSlug(resource: Resource) {
  if (resource.id) return resource.id;
  const file = resource.filePath?.split("/").pop();
  return file?.replace(/\.(md|mdx)$/i, "") ?? "";
}

export function resourceHref(resource: Resource) {
  const slug = resourceSlug(resource);
  return slug ? `/library/${slug}` : "/library";
}

export async function getPublishedResources() {
  const all = await getCollection("resources");
  return all
    .filter((r) => r.data.published && resourceSlug(r))
    .sort((a, b) => {
      if (a.data.order !== b.data.order) return a.data.order - b.data.order;
      return b.data.pubDate.valueOf() - a.data.pubDate.valueOf();
    });
}

export async function getFeaturedResources(limit = 4) {
  const resources = await getPublishedResources();
  return resources.filter((r) => r.data.featured).slice(0, limit);
}

export async function getResourcesByTrack(track: string) {
  const resources = await getPublishedResources();
  return resources.filter((r) => r.data.track === track);
}

export function resourceAction(resource: Resource) {
  if (resource.data.file) {
    return { href: resource.data.file, label: "Download", external: false };
  }
  if (resource.data.url) {
    return { href: resource.data.url, label: "Open resource", external: true };
  }
  return null;
}

export const difficultyLabel: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export const typeLabel: Record<string, string> = {
  pdf: "PDF",
  documentation: "Documentation",
  external: "External",
  lab: "Lab",
  cheatsheet: "Cheatsheet",
  session: "Session",
};

export const trackLabel: Record<string, string> = {
  "penetration-testing": "Penetration Testing",
  "soc-blue-team": "SOC & Blue Team",
  "malware-analysis": "Malware Analysis",
  "ctf-learning": "CTF Learning",
  general: "General",
};
