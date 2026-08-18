import type { Metadata } from "next";
import type { Project, SiteContent } from "@/types/content";
import { ogImages } from "@/lib/og";
import { coverImage, allScreenshots } from "@/lib/project-media";
import { publicProjects } from "@/lib/project-helpers";

export function siteUrlFrom(content: SiteContent) {
  return content.profile.website.replace(/\/$/, "");
}

export function skillNames(content: SiteContent) {
  return content.skillCategories.flatMap((category) => category.items.map((item) => item.name));
}

// Capped so a stale/oversized topic list in the database can never balloon
// the Person entity back into keyword-stuffing territory.
function uniqueKnowsAbout(content: SiteContent) {
  return [...new Set([...skillNames(content), ...content.seo.topics])].slice(0, 48);
}

function currentEmployer(content: SiteContent) {
  return content.experience[0]?.company;
}

export function personJsonLd(content: SiteContent) {
  const siteUrl = siteUrlFrom(content);
  const { profile, social, seo, experience } = content;
  const employer = currentEmployer(content);
  return {
    "@type": "Person",
    "@id": `${siteUrl}/#person`,
    name: profile.name,
    givenName: profile.firstName,
    familyName: profile.lastName,
    jobTitle: profile.title,
    description: seo.description,
    url: siteUrl,
    email: profile.email,
    image: seo.defaultOgImage ?? `${siteUrl}/opengraph-image`,
    sameAs: [
      social.github,
      social.linkedin,
      social.medium,
      social.upwork,
      social.cursorHandle ? `https://cursor.com/@${social.cursorHandle.replace(/^@/, "")}` : "",
      siteUrl,
    ].filter(Boolean),
    knowsLanguage: ["en", "ur"],
    knowsAbout: uniqueKnowsAbout(content),
    homeLocation: {
      "@type": "Place",
      name: profile.location,
    },
    ...(employer
      ? {
          worksFor: {
            "@type": "Organization",
            name: employer,
          },
        }
      : {}),
    hasOccupation: experience.map((item) => ({
      "@type": "Occupation",
      name: item.role,
      occupationLocation: {
        "@type": "Place",
        name: item.location ?? profile.location,
      },
      skills: item.technologies.join(", "),
    })),
  };
}

export function websiteJsonLd(content: SiteContent) {
  const siteUrl = siteUrlFrom(content);
  return {
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    name: `${content.profile.name} — Portfolio`,
    url: siteUrl,
    description: content.seo.description,
    inLanguage: "en",
    publisher: { "@id": `${siteUrl}/#person` },
  };
}

export function professionalServiceJsonLd(content: SiteContent) {
  const siteUrl = siteUrlFrom(content);
  return {
    "@type": "ProfessionalService",
    "@id": `${siteUrl}/#services`,
    name: `${content.profile.name} — Software Engineering`,
    url: siteUrl,
    description: content.seo.description,
    image: content.seo.defaultOgImage ?? `${siteUrl}/opengraph-image`,
    areaServed: ["Worldwide", "Pakistan", "United Arab Emirates", "Saudi Arabia", "United States"],
    serviceType: [
      "React Native development",
      "Full-stack engineering",
      "NestJS backend development",
      "IoT and MQTT systems",
      "Mobile app architecture",
      "AI and LLM product engineering",
    ],
    provider: { "@id": `${siteUrl}/#person` },
  };
}

export function profilePageJsonLd(content: SiteContent) {
  const siteUrl = siteUrlFrom(content);
  return {
    "@type": "ProfilePage",
    "@id": `${siteUrl}/#profile`,
    url: siteUrl,
    name: content.seo.title,
    about: { "@id": `${siteUrl}/#person` },
    mainEntity: { "@id": `${siteUrl}/#person` },
  };
}

export function resumeProfilePageJsonLd(content: SiteContent) {
  const siteUrl = siteUrlFrom(content);
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": `${siteUrl}/resume#profile`,
    url: `${siteUrl}/resume`,
    name: `Resume — ${content.profile.name}`,
    about: { "@id": `${siteUrl}/#person` },
    mainEntity: { "@id": `${siteUrl}/#person` },
  };
}

/** Site-wide entities as a single @graph script (rendered in the root layout). */
export function siteGraphJsonLd(content: SiteContent) {
  return {
    "@context": "https://schema.org",
    "@graph": [personJsonLd(content), websiteJsonLd(content), professionalServiceJsonLd(content)],
  };
}

/** Homepage-specific entities: the profile page and the project list. */
export function homeGraphJsonLd(content: SiteContent) {
  return {
    "@context": "https://schema.org",
    "@graph": [profilePageJsonLd(content), workIndexJsonLd(content)],
  };
}

export function projectJsonLd(content: SiteContent, project: Project) {
  const siteUrl = siteUrlFrom(content);
  const sameAs = [project.liveUrl, project.appStoreUrl, project.webUrl].filter(
    (url): url is string => Boolean(url),
  );
  const image = coverImage(project);
  const screenshots = allScreenshots(project);
  return {
    "@type": "SoftwareApplication",
    "@id": `${siteUrl}/work/${project.slug}#app`,
    name: project.seoLabel,
    description: project.seoDescription,
    url: `${siteUrl}/work/${project.slug}`,
    applicationCategory: project.applicationCategory ?? "DeveloperApplication",
    operatingSystem: "iOS, Android, Web",
    creator: { "@id": `${siteUrl}/#person` },
    author: { "@id": `${siteUrl}/#person` },
    keywords: project.technologies.join(", "),
    ...(project.updatedAt ? { dateModified: project.updatedAt } : {}),
    ...(image ? { image } : {}),
    ...(screenshots.length ? { screenshot: screenshots.map((shot) => shot.src) } : {}),
    ...(project.github ? { codeRepository: project.github } : {}),
    ...(sameAs.length === 1 ? { sameAs: sameAs[0] } : sameAs.length > 1 ? { sameAs } : {}),
  };
}

export function workIndexJsonLd(content: SiteContent) {
  const siteUrl = siteUrlFrom(content);
  return {
    "@type": "ItemList",
    "@id": `${siteUrl}/work#list`,
    name: `Portfolio of ${content.profile.name}`,
    itemListElement: publicProjects(content.projects).map((project, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${siteUrl}/work/${project.slug}`,
      name: project.seoLabel,
      description: project.seoDescription,
    })),
  };
}

export function breadcrumbJsonLd(siteUrl: string, items: { name: string; url: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/** Work index page entities as a single @graph script. */
export function workPageGraphJsonLd(content: SiteContent) {
  return {
    "@context": "https://schema.org",
    "@graph": [workIndexJsonLd(content)],
  };
}

/** Case study page entities as a single @graph script. */
export function projectGraphJsonLd(content: SiteContent, project: Project) {
  const siteUrl = siteUrlFrom(content);
  return {
    "@context": "https://schema.org",
    "@graph": [
      projectJsonLd(content, project),
      breadcrumbJsonLd(siteUrl, [
        { name: content.profile.name, url: siteUrl },
        { name: "Portfolio", url: `${siteUrl}/work` },
        { name: project.seoLabel, url: `${siteUrl}/work/${project.slug}` },
      ]),
    ],
  };
}

export function rootMetadata(content: SiteContent): Metadata {
  const siteUrl = siteUrlFrom(content);
  const images = ogImages(content.seo.defaultOgImage, siteUrl, content.profile.name);
  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: content.seo.title,
      template: `%s — ${content.profile.name}`,
    },
    description: content.seo.description,
    // Hard cap: the stored list may be long (editable in the admin), but the
    // rendered tag must stay a short, curated set.
    keywords: [...content.seo.keywords].slice(0, 36),
    alternates: {
      canonical: siteUrl,
      types: {
        "text/plain": `${siteUrl}/llms.txt`,
      },
    },
    authors: [{ name: content.profile.name, url: siteUrl }],
    creator: content.profile.name,
    publisher: content.profile.name,
    category: "technology",
    icons: {
      icon: [{ url: "/logo-at.png", type: "image/png" }],
      apple: "/logo-at.png",
      shortcut: "/logo-at.png",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    verification: {
      google: content.seo.googleVerification || undefined,
      other: content.seo.bingVerification
        ? { "msvalidate.01": content.seo.bingVerification }
        : undefined,
    },
    openGraph: {
      type: "profile",
      url: siteUrl,
      title: content.seo.title,
      description: content.seo.description,
      siteName: content.profile.name,
      locale: "en_US",
      firstName: content.profile.firstName,
      lastName: content.profile.lastName,
      ...(images ? { images } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: content.seo.title,
      description: content.seo.description,
      ...(content.seo.twitterHandle ? { creator: content.seo.twitterHandle } : {}),
      ...(images ? { images: images.map((image) => image.url) } : {}),
    },
  };
}
