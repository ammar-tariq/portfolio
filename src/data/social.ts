// Fallback social links used when MongoDB is unavailable.
export const social = {
  "github": "https://github.com/ammar-tariq",
  "githubHandle": "ammar-tariq",
  "linkedin": "https://linkedin.com/in/ammar10",
  "medium": "https://medium.com/@ammar.tariq10",
  "calendly": "https://calendly.com/ammar-tariq10/new-meeting",
  "whatsapp": "https://wa.link/0ssemy",
  "upwork": "https://www.upwork.com/freelancers/~01ec8705c5f63b783f",
  "website": "https://ammartariq.com",
  "cursorHandle": "ammart10"
} as const;

// Mirrors the section order on the homepage so scroll-spy highlighting moves
// linearly while scrolling.
export const navItems = [
  { id: "about", label: "About", href: "/about" },
  { id: "portfolio", label: "Portfolio", href: "/portfolio" },
  { id: "open-source", label: "Open source", href: "/open-source" },
  { id: "experience", label: "Experience", href: "/experience" },
  { id: "skills", label: "Skills", href: "/skills" },
  { id: "blogs", label: "Blogs", href: "/blog" },
] as const;
