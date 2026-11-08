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

/**
 * Display labels for resource.track tags, derived from Learning Path titles
 * so newly created CMS paths appear in the library without code changes.
 */
export async function getTrackLabels(): Promise<Record<string, string>> {
  const tracks = await getCollection("tracks");
  const labels: Record<string, string> = { general: "General" };

  for (const track of tracks.sort((a, b) => a.data.order - b.data.order)) {
    labels[track.id] = track.data.title;
  }

  return labels;
}

export function resolveTrackLabel(
  trackId: string,
  labels: Record<string, string>,
): string {
  return labels[trackId] ?? trackId;
}
