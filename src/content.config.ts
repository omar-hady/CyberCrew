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
/** Resource library filter tag — usually a Learning Path slug; "general" is allowed. */
const trackTag = z
  .string()
  .min(1)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Expected a lowercase slug (e.g. cybersecurity-foundations or general)",
  );
const pathFocus = z.enum(["red-team", "blue-team", "ctf", "specialized"]);
const journeyLevel = z.enum(["foundations", "core", "specialization"]);
const stageImportance = z.enum(["essential", "optional"]);
/** Decap Path ID — mirrors the Markdown filename / public /tracks/<id> slug. */
const pathId = z
  .string()
  .min(1)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Expected a lowercase slug (e.g. web-security-basics)",
  );

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
    track: trackTag,
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
  // Flat files only — matches Decap `folder` + `slug: "{{fields.pathId}}"`.
  // New Markdown files are picked up automatically on the next build.
  loader: glob({ pattern: "*.{md,mdx}", base: "./src/content/tracks" }),
  schema: z.object({
    /** Stable public slug; must match the filename (without extension). */
    pathId,
    title: z.string(),
    short: z.string(),
    level: z.string(),
    order: z.number(),
    /** Where this path sits in the Foundations → Core → Specialize journey. */
    journeyLevel,
    /** Specialization identity for badges; foundations/core use specialized. */
    focus: pathFocus,
    objectives: z
      .union([z.array(z.string()), z.null()])
      .optional()
      .transform((v) => v ?? []),
    /** Ordered learning stages; resources are content collection slugs. */
    stages: z
      .union([
        z.array(
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
        z.null(),
      ])
      .optional()
      .transform((v) => v ?? []),
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
