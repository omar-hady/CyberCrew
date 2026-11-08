import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const difficulty = z.enum(["beginner", "intermediate", "advanced"]);
const resourceType = z.enum([
  "pdf",
  "documentation",
  "external",
  "lab",
  "cheatsheet",
  "session",
]);
const track = z.enum([
  "cybersecurity-foundations",
  "core-cybersecurity-skills",
  "penetration-testing",
  "soc-blue-team",
  "malware-analysis",
  "ctf-learning",
  "general",
]);
const pathFocus = z.enum(["red-team", "blue-team", "ctf", "specialized"]);
const journeyLevel = z.enum(["foundations", "core", "specialization"]);
const stageImportance = z.enum(["essential", "optional"]);

/** Decap often serializes cleared optional fields as null — coerce to undefined. */
const optionalString = z
  .union([z.string(), z.null()])
  .optional()
  .transform((v) => v ?? undefined);

const stringList = z
  .union([z.array(z.string()), z.null()])
  .optional()
  .transform((v) => v ?? []);

const stageSuggestion = z.object({
  title: z.string(),
  url: optionalString,
  note: optionalString,
});

const suggestionList = z
  .union([z.array(stageSuggestion), z.null()])
  .optional()
  .transform((v) => v ?? []);

const resources = defineCollection({
  // Flat files only — matches Decap `folder` + `slug: "{{slug}}"`.
  loader: glob({ pattern: "*.{md,mdx}", base: "./src/content/resources" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    track: track,
    difficulty: difficulty,
    type: resourceType,
    tags: stringList,
    url: optionalString,
    file: optionalString,
    thumbnail: optionalString,
    featured: z.boolean().default(false),
    published: z.boolean().default(true),
    pubDate: z.coerce.date(),
    order: z.number().default(100),
  }),
});

const tracks = defineCollection({
  loader: glob({ pattern: "*.{md,mdx}", base: "./src/content/tracks" }),
  schema: z.object({
    title: z.string(),
    short: z.string(),
    level: z.string(),
    order: z.number(),
    /** Where this path sits in the Foundations → Core → Specialize journey. */
    journeyLevel,
    /** Specialization identity for badges; foundations/core use specialized. */
    focus: pathFocus,
    objectives: z.array(z.string()),
    /** Ordered learning stages; resources are content collection slugs. */
    stages: z.array(
      z.object({
        id: z.string().min(1),
        title: z.string(),
        description: z.string(),
        importance: stageImportance.default("essential"),
        resources: stringList,
        /** External recommendations — not CyberCrew library entries. */
        suggestions: suggestionList,
      }),
    ),
    tools: stringList,
  }),
});

const announcements = defineCollection({
  loader: glob({
    pattern: "*.{md,mdx}",
    base: "./src/content/announcements",
  }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    date: z.coerce.date(),
    kind: z.enum(["announcement", "workshop", "session", "contribution"]),
    published: z.boolean().default(true),
    link: optionalString,
  }),
});

export const collections = { resources, tracks, announcements };
