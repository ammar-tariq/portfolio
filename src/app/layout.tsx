import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { getSiteContent } from "@/lib/content";
import { rootMetadata, siteGraphJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { AnalyticsTracker } from "@/components/analytics/tracker";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { googleAnalyticsId, googleTagManagerId } from "@/lib/env";

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

function gtmScript(id: string) {
  return `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer',${JSON.stringify(id)});`;
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const content = await getSiteContent();
  const gaId = googleAnalyticsId();
  const gtmId = googleTagManagerId();
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${serif.variable} h-full antialiased`}
    >
      <head>
        {gtmId ? <script dangerouslySetInnerHTML={{ __html: gtmScript(gtmId) }} /> : null}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full bg-bg text-fg" suppressHydrationWarning>
        {gtmId ? (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${encodeURIComponent(gtmId)}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
              title="Google Tag Manager"
            />
          </noscript>
        ) : null}
        <JsonLd data={siteGraphJsonLd(content)} />
        <AnalyticsTracker />
        {gaId ? <GoogleAnalytics id={gaId} /> : null}
        {children}
      </body>
    </html>
  );
}
