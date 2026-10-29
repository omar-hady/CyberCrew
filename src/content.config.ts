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

const resources = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/resources" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    track: track,
    difficulty: difficulty,
    type: resourceType,
    tags: z.array(z.string()).default([]),
    url: z.string().optional(),
    file: z.string().optional(),
    thumbnail: z.string().optional(),
    featured: z.boolean().default(false),
    published: z.boolean().default(true),
    pubDate: z.coerce.date(),
    order: z.number().default(100),
  }),
});

const tracks = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/tracks" }),
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
    tools: z.array(z.string()).default([]),
  }),
});

const announcements = defineCollection({
  loader: glob({
    pattern: "**/*.{md,mdx}",
    base: "./src/content/announcements",
  }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    date: z.coerce.date(),
    kind: z.enum(["announcement", "workshop", "session", "contribution"]),
    published: z.boolean().default(true),
    link: z.string().optional(),
  }),
});

export const collections = { resources, tracks, announcements };
