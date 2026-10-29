/**
 * Site configuration for CyberCrew.
 * Set PUBLIC_CTF_URL in your environment / host settings when the CTF platform URL is known.
 * Do not invent a CTF URL — leave empty until the real platform address is available.
 *
 * Learning track copy lives in `src/content/tracks/` (CMS-editable) and is loaded via
 * `getTracks()` so listings stay in sync with track detail pages.
 */
export const site = {
  name: "CyberCrew",
  tagline: "A cybersecurity learning community built for curious minds.",
  description:
    "CyberCrew is a hands-on cybersecurity learning community focused on practical skills across penetration testing, blue team operations, malware analysis, and CTF challenges.",
  /** Leave empty until a real production domain is confirmed. */
  url: import.meta.env.PUBLIC_SITE_URL ?? "",
  /** External CTF platform — never invent this URL. */
  ctfUrl: import.meta.env.PUBLIC_CTF_URL ?? "",
  ctfLabel: "CTF Arena",
  /** Public contact email — leave empty until a real address is published. */
  email: "",
  /**
   * Community / social destinations. Only add real, verified URLs.
   * Empty keys are omitted from the UI until configured.
   */
  social: {
    discord: "",
    github: "",
    linkedin: "",
    x: "",
  },
  nav: [
    { label: "Tracks", href: "/tracks" },
    { label: "Library", href: "/library" },
    { label: "Community", href: "/community" },
    { label: "CTF Arena", href: "/ctf" },
    { label: "About", href: "/about" },
  ],
} as const;

export type SocialNetwork = keyof typeof site.social;
