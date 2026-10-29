/**
 * Site configuration for CyberCrew.
 * Set PUBLIC_CTF_URL in your environment / host settings when the CTF platform URL is known.
 * Do not invent a CTF URL — leave empty until the real platform address is available.
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
  email: "",
  social: {
    // Add real links when available
  },
  nav: [
    { label: "Tracks", href: "/tracks" },
    { label: "Library", href: "/library" },
    { label: "Community", href: "/community" },
    { label: "CTF Arena", href: "/ctf" },
    { label: "About", href: "/about" },
  ],
  tracks: [
    {
      slug: "penetration-testing",
      title: "Penetration Testing",
      short: "Offensive methodology, recon, exploitation, and reporting.",
      level: "Beginner → Advanced",
      accent: "pentest",
    },
    {
      slug: "soc-blue-team",
      title: "SOC & Blue Team",
      short: "Detection, triage, hunting, and defensive operations.",
      level: "Beginner → Intermediate",
      accent: "blue",
    },
    {
      slug: "malware-analysis",
      title: "Malware Analysis",
      short: "Static and dynamic analysis of suspicious binaries.",
      level: "Intermediate → Advanced",
      accent: "malware",
    },
    {
      slug: "ctf-learning",
      title: "CTF Learning",
      short: "Challenge-driven practice across common CTF categories.",
      level: "Beginner → Advanced",
      accent: "ctf",
    },
  ] as const,
} as const;

export type TrackSlug = (typeof site.tracks)[number]["slug"];
