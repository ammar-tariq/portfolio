import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { getSiteContent } from "@/lib/content";
import { rootMetadata, siteGraphJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { AnalyticsTracker } from "@/components/analytics/tracker";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const serif = Instrument_Serif({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: "400",
});

export async function generateMetadata(): Promise<Metadata> {
  const content = await getSiteContent();
  return rootMetadata(content);
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3f7fb" },
    { media: "(prefers-color-scheme: dark)", color: "#05070c" },
  ],
  colorScheme: "dark light",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const themeScript = `(function(){try{var s=localStorage.getItem("theme");var light=s==="light"||(s!=="dark"&&window.matchMedia("(prefers-color-scheme: light)").matches);if(light)document.documentElement.classList.add("light");document.documentElement.style.colorScheme=light?"light":"dark";}catch(e){}})();`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const content = await getSiteContent();
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${serif.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full bg-bg text-fg" suppressHydrationWarning>
        <JsonLd data={siteGraphJsonLd(content)} />
        <AnalyticsTracker />
        {children}
      </body>
    </html>
  );
}
