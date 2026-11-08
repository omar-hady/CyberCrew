import { getCollection, type CollectionEntry } from "astro:content";
import {
  getPublishedResources,
  resourceSlug,
  type Resource,
} from "./resources";

export type Track = CollectionEntry<"tracks">;
export type PathFocus = Track["data"]["focus"];
export type JourneyLevel = Track["data"]["journeyLevel"];
export type StageImportance = Track["data"]["stages"][number]["importance"];

export type StageSuggestion = {
  title: string;
  url?: string;
  note?: string;
};

export type ResolvedStage = {
  id: string;
  title: string;
  description: string;
  importance: StageImportance;
  resources: Resource[];
  suggestions: StageSuggestion[];
  /** Slugs referenced in CMS that could not be resolved (unpublished/missing). */
  missing: string[];
};

export const journeyLevelLabel: Record<JourneyLevel, string> = {
  foundations: "Foundations",
  core: "Core skills",
  specialization: "Specialization",
};

export const journeyLevelBlurb: Record<JourneyLevel, string> = {
  foundations: "Technical preparation if you are new to computing or security.",
  core: "Shared skills every specialist needs before choosing a path.",
  specialization: "Pick Red Team, Blue Team, or CTF and follow ordered stages.",
};

export const focusLabel: Record<PathFocus, string> = {
  "red-team": "Red Team",
  "blue-team": "Blue Team",
  ctf: "CTF",
  specialized: "Specialized",
};

export const focusBlurb: Record<PathFocus, string> = {
  "red-team": "Offensive methodology and ethical exploitation practice.",
  "blue-team": "Detection, triage, hunting, and defensive operations.",
  ctf: "Challenge-driven practice across common CTF categories.",
  specialized: "Shared journey stages or optional advanced depth.",
};

/** Tracks ordered for listings (home, /tracks, footer, about). */
export async function getTracks() {
  const tracks = await getCollection("tracks");
  return tracks
    .filter((track) => {
      // Decap writes pathId into frontmatter and uses it as the filename.
      // Skip mismatched entries rather than publishing broken URLs.
      if (track.data.pathId !== track.id) {
        console.warn(
          `[tracks] Skipping "${track.id}": pathId "${track.data.pathId}" does not match filename.`,
        );
        return false;
      }
      return true;
    })
    .sort((a, b) => a.data.order - b.data.order);
}

export function getTracksByJourney(tracks: Track[], level: JourneyLevel) {
  return tracks.filter((t) => t.data.journeyLevel === level);
}

export function getTracksByFocus(tracks: Track[], focus: PathFocus) {
  return tracks.filter((t) => t.data.focus === focus);
}

/** Primary specializations shown in the choose-your-path step. */
export function getPrimarySpecializations(tracks: Track[]) {
  const order: PathFocus[] = ["red-team", "blue-team", "ctf"];
  return order.flatMap((focus) =>
    tracks.filter((t) => t.data.journeyLevel === "specialization" && t.data.focus === focus),
  );
}

/** Optional depth paths (e.g. Malware) — not primary specialization choices. */
export function getOptionalDepthPaths(tracks: Track[]) {
  return tracks.filter(
    (t) => t.data.journeyLevel === "specialization" && t.data.focus === "specialized",
  );
}

/**
 * Journey map for the hub: foundations + core + primary specializations.
 * Optional depth paths are returned separately.
 */
export function getLearningJourney(tracks: Track[]) {
  const foundations = getTracksByJourney(tracks, "foundations")[0] ?? null;
  const core = getTracksByJourney(tracks, "core")[0] ?? null;
  const specializations = getPrimarySpecializations(tracks);
  const optionalDepth = getOptionalDepthPaths(tracks);
  return { foundations, core, specializations, optionalDepth };
}

/** Ordered list for footer/about: foundations, core, specs, then optional depth. */
export function getJourneyListing(tracks: Track[]) {
  const { foundations, core, specializations, optionalDepth } = getLearningJourney(tracks);
  return [foundations, core, ...specializations, ...optionalDepth].filter(
    (t): t is Track => Boolean(t),
  );
}

export type JourneyNextStep = {
  href: string;
  label: string;
  detail: string;
};

/** Suggested next action after finishing a path's stages. */
export function getPathNextStep(track: Track, tracks: Track[]): JourneyNextStep {
  const { foundations, core, specializations, optionalDepth } = getLearningJourney(tracks);

  if (track.data.journeyLevel === "foundations" && core) {
    return {
      href: `/tracks/${core.id}`,
      label: `Continue to ${core.data.title}`,
      detail: "Shared skills before you specialize.",
    };
  }

  if (track.data.journeyLevel === "core") {
    return {
      href: "/tracks#specialize",
      label: "Choose your specialization",
      detail: "Red Team, Blue Team, or CTF.",
    };
  }

  if (track.id === "soc-blue-team" && optionalDepth[0]) {
    return {
      href: `/tracks/${optionalDepth[0].id}`,
      label: `Optional depth: ${optionalDepth[0].data.title}`,
      detail: "Advanced binary analysis after defensive footing.",
    };
  }

  if (track.id === "ctf-learning") {
    return {
      href: "/ctf",
      label: "Open CTF Arena",
      detail: "Practice when the platform link is configured.",
    };
  }

  if (track.data.focus === "red-team" || track.data.focus === "blue-team") {
    return {
      href: `/library?track=${track.id}`,
      label: "Browse related library resources",
      detail: "Keep learning with materials tagged to this path.",
    };
  }

  if (foundations && track.data.focus === "specialized") {
    return {
      href: "/tracks",
      label: "Back to the learning journey",
      detail: "Return to Foundations → Core → Specialize.",
    };
  }

  return {
    href: "/tracks",
    label: "Back to learning paths",
    detail: "See the full journey map.",
  };
}

/** Prev/next among the main journey listing (includes optional depth at the end). */
export function getJourneySiblings(track: Track, tracks: Track[]) {
  const listing = getJourneyListing(tracks);
  const index = listing.findIndex((t) => t.id === track.id);
  return {
    prev: index > 0 ? listing[index - 1] : null,
    next: index >= 0 && index < listing.length - 1 ? listing[index + 1] : null,
  };
}

export async function resolveTrackStages(track: Track): Promise<ResolvedStage[]> {
  const published = await getPublishedResources();
  const bySlug = new Map(published.map((r) => [resourceSlug(r), r]));

  return track.data.stages.map((stage) => {
    const resources: Resource[] = [];
    const missing: string[] = [];

    for (const slug of stage.resources) {
      const match = bySlug.get(slug);
      if (match) resources.push(match);
      else missing.push(slug);
    }

    return {
      id: stage.id,
      title: stage.title,
      description: stage.description,
      importance: stage.importance,
      resources,
      suggestions: stage.suggestions.map((s) => ({
        title: s.title,
        url: s.url,
        note: s.note,
      })),
      missing,
    };
  });
}

/** Published resources for a track that are not assigned to any stage. */
export async function getUnstagedTrackResources(track: Track) {
  const [byTrack, stages] = await Promise.all([
    getPublishedResources().then((all) => all.filter((r) => r.data.track === track.id)),
    resolveTrackStages(track),
  ]);
  const staged = new Set(stages.flatMap((s) => s.resources.map(resourceSlug)));
  return byTrack.filter((r) => !staged.has(resourceSlug(r)));
}

export function countStagedResources(stages: ResolvedStage[]) {
  return stages.reduce((sum, stage) => sum + stage.resources.length, 0);
}
