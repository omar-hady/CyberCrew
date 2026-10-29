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
  "penetration-testing",
  "soc-blue-team",
  "malware-analysis",
  "ctf-learning",
  "general",
]);

/** Decap often serializes cleared optional fields as null — coerce to undefined. */
const optionalString = z
  .union([z.string(), z.null()])
  .optional()
  .transform((v) => v ?? undefined);

const resources = defineCollection({
  // Flat files only — matches Decap `folder` + `slug: "{{slug}}"`.
  loader: glob({ pattern: "*.{md,mdx}", base: "./src/content/resources" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    track: track,
    difficulty: difficulty,
    type: resourceType,
    tags: z
      .union([z.array(z.string()), z.null()])
      .optional()
      .transform((v) => v ?? []),
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
    objectives: z.array(z.string()),
    roadmap: z.array(
      z.object({
        title: z.string(),
        description: z.string(),
      }),
    ),
    tools: z
      .union([z.array(z.string()), z.null()])
      .optional()
      .transform((v) => v ?? []),
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
