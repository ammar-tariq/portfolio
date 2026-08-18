// Placeholder/example data — the real links are served from MongoDB in
// production. Keep this file free of real personal accounts.
export const social = {
  github: "https://github.com/your-handle",
  githubHandle: "your-handle",
  linkedin: "https://linkedin.com/in/your-handle",
  medium: "https://medium.com/@your-handle",
  calendly: "https://calendly.com/your-handle",
  whatsapp: "https://wa.me/000000000000",
  upwork: "https://www.upwork.com/freelancers/your-handle",
  website: "https://example.com",
  cursorHandle: "your-handle",
} as const;

// Mirrors the section order on the homepage so scroll-spy highlighting moves
// linearly while scrolling.
export const navItems = [
  { id: "about", label: "About", href: "/about" },
  { id: "portfolio", label: "Portfolio", href: "/portfolio" },
  { id: "open-source", label: "Open source", href: "/open-source" },
  { id: "experience", label: "Experience", href: "/experience" },
  { id: "skills", label: "Skills", href: "/skills" },
  { id: "blogs", label: "Blogs", href: social.medium, external: true },
] as const;
