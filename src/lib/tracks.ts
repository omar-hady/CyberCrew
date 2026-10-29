import { getCollection, type CollectionEntry } from "astro:content";

export type Track = CollectionEntry<"tracks">;

/** Tracks ordered for listings (home, /tracks, footer, about). */
export async function getTracks() {
  const tracks = await getCollection("tracks");
  return tracks.sort((a, b) => a.data.order - b.data.order);
}
