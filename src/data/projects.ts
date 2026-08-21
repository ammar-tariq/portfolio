import { type IndustryId } from "@/data/industries";

export type ProjectScreenshot = {
  src: string;
  alt: string;
  caption?: string;
};

export type Project = {
  slug: string;
  title: string;
  /** Brand-free label for metadata, JSON-LD, and LLM/crawler text. */
  seoLabel: string;
  /** Brand-free summary for metadata and structured data. */
  seoDescription: string;
  tagline: string;
  description: string;
  industries: IndustryId[];
  role: string;
  year?: string;
  status?: "shipped" | "active" | "internal";
  featured?: boolean;
  listed?: boolean;
  technologies: string[];
  github?: string;
  liveUrl?: string;
  liveLabel?: string;
  appStoreUrl?: string;
  webUrl?: string;
  webLabel?: string;
  challenge?: string;
  solution?: string;
  architecture: string[];
  engineering?: string[];
  outcome?: string;
  highlights: string[];
  screenshots?: ProjectScreenshot[];
  logo?: string;
  applicationCategory?: string;
  visual: "dojo" | "glass" | "signal" | "frame" | "hub" | "map" | "orbit" | "horizon" | "catalog";
};

export function projectLiveLabel(project: Project) {
  return project.liveLabel ?? "Live";
}

// Fallback case studies used when MongoDB is unavailable.
export const projects: Project[] = 
[
  {
    "slug": "icatm",
    "title": "iCATM",
    "seoLabel": "MRO inventory cataloging mobile app",
    "seoDescription": "Production React Native app for spare-parts cataloging — category, noun, modifier, and attribute templates so MRO inventory is described consistently.",
    "tagline": "Inventory cataloging for spare parts and assets.",
    "description": "A production React Native app for MRO inventory — Category, Noun, Modifier, and Attribute templates so spare parts are described consistently instead of as free-form text. Live on Google Play as iCATM: Inventory Cataloging.",
    "industries": [
      "industrial"
    ],
    "role": "React Native engineer · UI and API integration",
    "year": "2026",
    "status": "shipped",
    "featured": false,
    "listed": true,
    "technologies": [
      "React Native",
      "TypeScript",
      "REST APIs",
      "Authentication",
      "Search"
    ],
    "liveUrl": "https://play.google.com/store/apps/details?id=com.blitzapp.ictam",
    "liveLabel": "Play Store",
    "challenge": "Spare-part catalogs rot when anyone can type a description. Duplicate records, encrypted names, and missing attributes make warehouse stock invisible — and maintenance waits on parts that already exist.",
    "solution": "Built the full mobile UI and wired it to backend APIs: auth, hierarchical browse (category → noun → modifier), scoped search, and attribute-level item records. Data stewards fill values against a preloaded dictionary; items sync to the MRO cloud and export as CSV.",
    "architecture": [
      "React Native client with custom header, search, and 3-column catalog grid",
      "Bottom-tab plus stack navigation through the classification tree",
      "API-backed counts, images, and item master data (stock no., UNSPSC, location, qty)",
      "Auth surfaces: login, password visibility, forgot password, and sign up",
      "Four-tier data model: Category → Noun → Modifier → Attributes"
    ],
    "engineering": [
      "Designed the entire product UI for catalog density — image grids, level-scoped search, and a two-column spec layout for technical attributes.",
      "Integrated backend APIs for authentication, category trees, and item records rather than static lists.",
      "Kept navigation honest to the data model: each level is a real screen with its own search and totals."
    ],
    "outcome": "Shipped on Google Play for MRO Management as a data dictionary for businesses, warehouses, and schools — English templates with additional language support, CSV export, and cloud-backed item records.",
    "highlights": [
      "Full React Native UI",
      "API-integrated catalog",
      "Play Store release"
    ],
    "screenshots": [
      {
        "src": "https://res.cloudinary.com/dcrgvijkc/image/upload/v1786997098/portfolio/projects/icatm/login.png",
        "alt": "iCATM login screen with email, password, and sign up",
        "caption": "Login"
      },
      {
        "src": "https://res.cloudinary.com/dcrgvijkc/image/upload/v1786997099/portfolio/projects/icatm/categories.png",
        "alt": "iCATM categories grid with search and total count",
        "caption": "Categories"
      },
      {
        "src": "https://res.cloudinary.com/dcrgvijkc/image/upload/v1786997100/portfolio/projects/icatm/nouns.png",
        "alt": "iCATM Pumps noun catalog with part images",
        "caption": "Nouns"
      },
      {
        "src": "https://res.cloudinary.com/dcrgvijkc/image/upload/v1786997101/portfolio/projects/icatm/modifiers.png",
        "alt": "iCATM Pump modifiers grid including centrifugal and booster",
        "caption": "Modifiers"
      },
      {
        "src": "https://res.cloudinary.com/dcrgvijkc/image/upload/v1786997102/portfolio/projects/icatm/item-detail.png",
        "alt": "iCATM centrifugal pump item record with stock, UNSPSC, and attributes",
        "caption": "Item record"
      }
    ],
    "applicationCategory": "BusinessApplication",
    "visual": "catalog"
  },
  {
    "slug": "bargenius",
    "title": "Bar Genius",
    "seoLabel": "AI mixology and hospitality assistant",
    "seoDescription": "LLM-backed React Native product for cocktail recommendations, inventory awareness, and personalized mixology workflows.",
    "tagline": "AI-powered mixology assistant.",
    "description": "An AI-enabled product for cocktail recommendations, inventory awareness, and personalized mixology workflows — LLM integration in a real consumer surface.",
    "industries": [
      "hospitality"
    ],
    "role": "Full-stack engineer · LLM integration",
    "year": "2023+",
    "status": "shipped",
    "featured": true,
    "listed": true,
    "technologies": [
      "React Native",
      "Node.js",
      "OpenAI API",
      "TypeScript",
      "Realtime sync"
    ],
    "challenge": "Consumers and bartenders needed more than a static recipe list — they needed recommendations that adapted to ingredients, taste, and context.",
    "solution": "Integrated LLM-based recommendation and conversation into a React Native and Node.js stack, with real-time data sync and push notifications around inventory and experience.",
    "architecture": [
      "Mobile client in React Native",
      "Node.js API layer",
      "LLM integration for recommendation and assistance",
      "Realtime sync and notifications"
    ],
    "engineering": [
      "Structured LLM usage as a product workflow, not a chat toy.",
      "Recommendation and inventory as first-class domain concepts."
    ],
    "highlights": [
      "LLM product surface",
      "Mobile + backend",
      "Personalization"
    ],
    "visual": "glass"
  },
  {
    "slug": "soundseen",
    "title": "SoundSeen",
    "seoLabel": "Live music discovery marketplace",
    "seoDescription": "Full-stack music marketplace: React Native, React Navigation, RTK Query, Node/Express, and Stripe — listeners discover local artists; musicians claim profiles and schedules.",
    "tagline": "Discover and connect with live musicians.",
    "description": "A live-music marketplace for fans and artists — discover talent, follow shows, leave reviews, and create listings. Built full-stack: React Native client, Node/Express APIs, and Stripe.",
    "industries": [
      "entertainment",
      "marketplace"
    ],
    "role": "Full-stack engineer · React Native, Node, Stripe",
    "year": "2024–2025",
    "status": "shipped",
    "featured": false,
    "listed": true,
    "technologies": [
      "React Native",
      "React Navigation",
      "RTK Query",
      "Node.js",
      "Express",
      "Stripe"
    ],
    "liveUrl": "https://play.google.com/store/apps/details?id=com.genesysglobal.soundseen",
    "liveLabel": "Play Store",
    "appStoreUrl": "https://apps.apple.com/app/soundseen/id6499276844",
    "challenge": "Live music is local and forgettable. Fans lose who they heard; artists have no durable rating surface; booking still happens in DMs. The scene needed a marketplace, not another streaming catalog.",
    "solution": "Shipped the mobile app and backend: React Navigation and RTK Query on the client, Express APIs for profiles, search, listings, and reviews, and Stripe for artist support. Social auth, onboarding, and store delivery on Android and iOS.",
    "architecture": [
      "React Native client with React Navigation — onboarding, tabs, and listing flows",
      "RTK Query for artist catalog, search, profiles, and upcoming shows",
      "Node.js / Express API for marketplace data and reviews",
      "Stripe for tips and artist support",
      "Social login (Apple, Google, Facebook) plus email/password"
    ],
    "engineering": [
      "Owned the stack end-to-end: mobile UI, navigation, cached API access, Express services, and payments.",
      "Product paths that match the scene — artist search, ratings, follow/upcoming shows, and listings for yourself or another artist.",
      "Store-ready delivery on Google Play and the App Store."
    ],
    "outcome": "Live as SoundSeen: Discover Artists on Google Play and the App Store — a community where listeners rate local talent and musicians claim profiles, share schedules, and get support.",
    "highlights": [
      "Full-stack React Native",
      "RTK Query + Express",
      "Stripe integration"
    ],
    "screenshots": [
      {
        "src": "https://res.cloudinary.com/dcrgvijkc/image/upload/v1786997104/portfolio/projects/soundseen/onboarding.png",
        "alt": "SoundSeen welcome screen for the live music scene",
        "caption": "Onboarding"
      },
      {
        "src": "https://res.cloudinary.com/dcrgvijkc/image/upload/v1786997105/portfolio/projects/soundseen/login.png",
        "alt": "SoundSeen login with Apple, Google, Facebook, and password",
        "caption": "Login"
      },
      {
        "src": "https://res.cloudinary.com/dcrgvijkc/image/upload/v1786997106/portfolio/projects/soundseen/home.png",
        "alt": "SoundSeen home with featured artists, upcoming shows, and recommendations",
        "caption": "Home"
      },
      {
        "src": "https://res.cloudinary.com/dcrgvijkc/image/upload/v1786997107/portfolio/projects/soundseen/listing.png",
        "alt": "SoundSeen modal to create a listing for yourself or another artist",
        "caption": "Create listing"
      },
      {
        "src": "https://res.cloudinary.com/dcrgvijkc/image/upload/v1786997107/portfolio/projects/soundseen/search.png",
        "alt": "SoundSeen artist search grid",
        "caption": "Search"
      }
    ],
    "applicationCategory": "EntertainmentApplication",
    "visual": "signal"
  },
  {
    "slug": "entertainment-oxygen",
    "title": "eoFlix",
    "seoLabel": "Entertainment industry marketplace app",
    "seoDescription": "React Native marketplace connecting filmmakers, cast, crew, and fans — festival discovery, showcasing work, and community from script to screen.",
    "tagline": "A marketplace for entertainment professionals.",
    "description": "The Entertainment Oxygen mobile app — shipped as eoFlix — a marketplace where filmmakers, cast, crew, and fans discover festival films, showcase work, and connect from script to screen.",
    "industries": [
      "entertainment",
      "marketplace"
    ],
    "role": "React Native engineer · built the app at Salsoft",
    "year": "2019–2023",
    "status": "shipped",
    "featured": true,
    "listed": true,
    "technologies": [
      "React Native",
      "TypeScript",
      "Redux",
      "REST APIs",
      "Realtime chat"
    ],
    "liveUrl": "https://play.google.com/store/apps/details?id=com.entertainmentoxygen",
    "liveLabel": "Play Store",
    "challenge": "The entertainment industry is still who-you-know. Independent talent, festivals, and crews had no shared marketplace — streaming lived in one product, casting in another, and collaboration happened off-platform.",
    "solution": "Built the production React Native app at Salsoft: profiles and showcases, project discovery, 1:1 and group chat, and festival film surfaces — so professionals can network and collaborate in the same product fans use to watch.",
    "architecture": [
      "React Native client for Android and iOS store delivery",
      "Professional marketplace: profiles, showcases, and project discovery",
      "Realtime messaging for 1:1 and group collaboration",
      "API-driven catalog for indie, short, and feature festival films",
      "Auth, onboarding, and media upload for talent profiles"
    ],
    "engineering": [
      "Owned the mobile app at Salsoft — from product surfaces to store-ready delivery for Entertainment Oxygen.",
      "Combined marketplace, social, and media in one navigation model instead of three disconnected apps.",
      "Wired backend APIs for profiles, discovery, chat, and catalog rather than static content."
    ],
    "outcome": "Live on Google Play as eoFlix (Entertainment Oxygen Inc.) — 10K+ downloads, 4.3 rating. A free community for entertainment professionals, with festival streaming and virtual-ticket paths on the broader EO platform.",
    "highlights": [
      "Industry marketplace",
      "Built at Salsoft",
      "Play Store release"
    ],
    "logo": "https://res.cloudinary.com/dcrgvijkc/image/upload/v1786997109/portfolio/projects/entertainment-oxygen/logo.png",
    "applicationCategory": "EntertainmentApplication",
    "visual": "frame"
  },
  {
    "slug": "noqodi",
    "title": "noqodi",
    "seoLabel": "Escrow wallet and payments mobile app",
    "seoDescription": "React Native wallet for a UAE payment gateway — stored-value escrow for government and merchant services instead of one-shot card charges.",
    "tagline": "Escrow wallet for government and merchant payments.",
    "description": "The React Native mobile app for noqodi — a UAE payment gateway and escrow wallet. Users hold funds, then pay government and merchant services from a stored-value account instead of a one-shot card charge.",
    "industries": [
      "fintech"
    ],
    "role": "React Native engineer · mobile",
    "status": "shipped",
    "featured": true,
    "listed": true,
    "technologies": [
      "React Native",
      "TypeScript",
      "iOS",
      "Android"
    ],
    "liveUrl": "https://play.google.com/store/apps/details?id=ae.emaratech.noqodi",
    "liveLabel": "Play Store",
    "appStoreUrl": "https://apps.apple.com/us/app/noqodi/id1050481518",
    "challenge": "Government fees, court transfers, and merchant payouts can’t always settle in a single card swipe. Money has to be received, held, and released — escrow — with a wallet the user can actually operate on a phone.",
    "solution": "Built the mobile client in React Native: wallet account, top-up and pay flows for government and merchant services, and store delivery on iOS and Android. Mobile-only scope — the gateway stays on emaratech’s backend.",
    "architecture": [
      "React Native app for iOS and Android store delivery",
      "Stored-value wallet as the escrow account",
      "Payment surfaces for government entities and merchants",
      "Auth and onboarding against the noqodi account",
      "English and Arabic product surfaces"
    ],
    "engineering": [
      "Owned the mobile layer — React Native UI and navigation for a regulated payments product.",
      "Escrow as a first-class flow: hold, pay, withdraw — not a checkout button glued onto a website.",
      "Shipped to both App Store and Google Play for a UAE Central Bank–regulated wallet."
    ],
    "outcome": "Live as noqodi on the App Store and Google Play (50K+ Android downloads) — the mobile wallet for emaratech’s payment gateway, used for government and merchant escrow payments in the UAE.",
    "highlights": [
      "Escrow wallet",
      "React Native mobile",
      "UAE payments"
    ],
    "logo": "https://res.cloudinary.com/dcrgvijkc/image/upload/v1786997110/portfolio/projects/noqodi/logo.png",
    "applicationCategory": "FinanceApplication",
    "visual": "hub"
  },
  {
    "slug": "gurrl-talk",
    "title": "Gurrl Talk",
    "seoLabel": "Encrypted community chat app",
    "seoDescription": "Full-stack community product: React Native, Express, RTK Query, Socket.io, Redis, Stripe, React admin, and end-to-end encrypted chat.",
    "tagline": "A safe community chat for women.",
    "description": "A women-only peer community — realtime, end-to-end encrypted chat to seek and give feedback without the judgment of friends-and-family feeds. Built full-stack: React Native app, React admin panel, Express, RTK Query, Socket.io, Redis, and Stripe.",
    "industries": [
      "social"
    ],
    "role": "Full-stack engineer · React Native, React admin, realtime",
    "year": "2026",
    "status": "shipped",
    "featured": true,
    "listed": true,
    "technologies": [
      "React Native",
      "React",
      "RTK Query",
      "Express",
      "Socket.io",
      "Redis",
      "Stripe",
      "E2EE"
    ],
    "liveUrl": "https://play.google.com/store/apps/details?id=com.gurrltalk",
    "liveLabel": "Play Store",
    "challenge": "Women often can’t talk openly on public social apps — judgment, context collapse, and unsafe rooms. Peer advice needs a private, realtime space with encryption and moderation — not a generic chat clone whose operators can read every message.",
    "solution": "Shipped the product end-to-end: React Native client with RTK Query, a React admin panel for community operations, Express APIs, Socket.io rooms with Redis for presence and fan-out, Stripe for premium groups, and end-to-end encryption on chat.",
    "architecture": [
      "React Native client with RTK Query for profiles, rooms, and history",
      "React admin panel for community, groups, and moderation",
      "Express API for accounts, membership, and payments",
      "Socket.io for live chat with Redis pub/sub and presence",
      "End-to-end encryption for message contents",
      "Stripe for premium groups and in-app payments"
    ],
    "engineering": [
      "Owned mobile, admin, and backend: React Native + React JS, cached REST via RTK Query, live sockets, and payment webhooks.",
      "End-to-end encryption on chat so message contents stay with the participants, not the server.",
      "Realtime as a reliability problem — Redis-backed Socket.io so rooms don’t drop when the process restarts."
    ],
    "outcome": "Live on Google Play as Gurrl Talk — a private peer chat for women, with encrypted messaging, free and premium groups, and an operations console.",
    "highlights": [
      "End-to-end encryption",
      "React admin panel",
      "Socket.io + Redis"
    ],
    "screenshots": [
      {
        "src": "https://res.cloudinary.com/dcrgvijkc/image/upload/v1786997112/portfolio/projects/gurrl-talk/welcome.png",
        "alt": "Gurrl Talk welcome screen",
        "caption": "Welcome"
      },
      {
        "src": "https://res.cloudinary.com/dcrgvijkc/image/upload/v1786997114/portfolio/projects/gurrl-talk/get-started.png",
        "alt": "Gurrl Talk get started with Google, Apple, and password sign in",
        "caption": "Get started"
      },
      {
        "src": "https://res.cloudinary.com/dcrgvijkc/image/upload/v1786997119/portfolio/projects/gurrl-talk/create-account.png",
        "alt": "Gurrl Talk create account form",
        "caption": "Create account"
      },
      {
        "src": "https://res.cloudinary.com/dcrgvijkc/image/upload/v1786997119/portfolio/projects/gurrl-talk/home.png",
        "alt": "Gurrl Talk home with free and premium groups",
        "caption": "Groups"
      },
      {
        "src": "https://res.cloudinary.com/dcrgvijkc/image/upload/v1786997120/portfolio/projects/gurrl-talk/menu.png",
        "alt": "Gurrl Talk menu with profile, shop, helpline, and more",
        "caption": "Menu"
      }
    ],
    "logo": "https://res.cloudinary.com/dcrgvijkc/image/upload/v1786997121/portfolio/projects/gurrl-talk/logo.png",
    "applicationCategory": "SocialNetworkingApplication",
    "visual": "signal"
  },
  {
    "slug": "lancecraft",
    "title": "Lance Craft",
    "seoLabel": "Event hiring two-sided marketplace",
    "seoDescription": "Full-stack two-sided marketplace for event freelancers and businesses that hire them — React Native, APIs, and store delivery on iOS and Android.",
    "tagline": "Event marketplace — find work or hire the crew.",
    "description": "A two-sided marketplace for the event industry: freelancers find gigs, businesses hire planners, florists, and creatives. Built full-stack at Pixel Genesys — React Native clients and the APIs behind discovery, hiring, chat, and bookings.",
    "industries": [
      "events",
      "marketplace"
    ],
    "role": "Full-stack engineer · React Native and APIs",
    "year": "2024–2025",
    "status": "shipped",
    "featured": false,
    "listed": true,
    "technologies": [
      "React Native",
      "Node.js",
      "TypeScript",
      "Realtime chat"
    ],
    "liveUrl": "https://play.google.com/store/apps/details?id=com.genesysglobal.lancecraft.business",
    "liveLabel": "Play Store",
    "appStoreUrl": "https://apps.apple.com/us/app/lance-craft/id6479449678",
    "challenge": "Event work still lives in DMs and last-minute group texts. Freelancers can’t see real local gigs; businesses can’t hire a florist or planner without a private network. The industry needed a marketplace, not another job board.",
    "solution": "Shipped both sides of the market: a freelancer app to discover opportunities and a business app to hire, message, and book. Shared backend for profiles, jobs, communication, and reputation — so hiring isn’t a screenshot of a group chat.",
    "architecture": [
      "Two React Native clients — freelancer and business",
      "Shared API for jobs, profiles, hiring, and bookings",
      "Realtime chat for collaboration",
      "Local discovery of event opportunities",
      "Reputation and professional network as platform features"
    ],
    "engineering": [
      "Owned full-stack delivery: dual mobile surfaces on one job/hiring domain.",
      "Marketplace matching as product — find work and hire help — not two directories that never meet.",
      "Store-ready on the App Store and Google Play under Pixel Genesys."
    ],
    "outcome": "Live as Lance Craft on the App Store and Google Play — the event-industry marketplace for freelancers and the businesses that hire them.",
    "highlights": [
      "Two-sided marketplace",
      "Event hiring",
      "Full-stack delivery"
    ],
    "logo": "https://res.cloudinary.com/dcrgvijkc/image/upload/v1786997122/portfolio/projects/lancecraft/logo.png",
    "applicationCategory": "BusinessApplication",
    "visual": "hub"
  },
  {
    "slug": "the-landing-list",
    "title": "The Landing List",
    "seoLabel": "Home services, classifieds, and lost-and-found app",
    "seoDescription": "Full-stack local platform for hiring home-service vendors, posting classifieds, and lost-and-found — mobile client plus APIs.",
    "tagline": "Home services, classifieds, and lost & found.",
    "description": "A community marketplace for the home — hire verified local vendors, post classifieds, and run lost-and-found. Built full-stack at Pixel Genesys: React Native client and the APIs behind ads, vendors, chat, and listings.",
    "industries": [
      "local",
      "marketplace"
    ],
    "role": "Full-stack engineer · React Native and APIs",
    "year": "2025",
    "status": "shipped",
    "featured": false,
    "listed": true,
    "technologies": [
      "React Native",
      "TypeScript",
      "REST APIs",
      "Chat"
    ],
    "appStoreUrl": "https://apps.apple.com/us/app/the-landing-list/id6743402319",
    "challenge": "Home work is still a stack of Facebook posts, random contractors, and a neighborhood group for lost keys. Services, buy/sell, and lost-and-found needed one product — not three apps and a spreadsheet.",
    "solution": "Shipped the full stack: auth, vendor discovery with ratings, in-app contact, and a classifieds + lost-and-found board with search, filters, image upload, and post flows. Mobile UI and backend contracts in the same delivery.",
    "architecture": [
      "React Native client for iOS store delivery",
      "Auth: Google, email/password, and guest",
      "Classifieds and lost-and-found as first-class ad types",
      "Vendor directory with profiles, ratings, and direct contact",
      "Chat and call actions on listings",
      "Image upload and category-driven post forms"
    ],
    "engineering": [
      "Owned mobile and API work — listing CRUD, media, search, and messaging as one domain, not a UI glued to a CMS.",
      "Two posting surfaces (classifieds vs lost-and-found) sharing one ad pipeline with type-specific fields.",
      "Store-ready delivery on the App Store under Pixel Genesys."
    ],
    "outcome": "Live on the App Store as The Landing List — Pixel Genesys’ home platform for hiring local vendors and posting community ads.",
    "highlights": [
      "Full-stack delivery",
      "Classifieds + lost & found",
      "Vendor marketplace"
    ],
    "screenshots": [
      {
        "src": "https://res.cloudinary.com/dcrgvijkc/image/upload/v1786997124/portfolio/projects/the-landing-list/welcome.png",
        "alt": "The Landing List welcome and get started screen",
        "caption": "Welcome"
      },
      {
        "src": "https://res.cloudinary.com/dcrgvijkc/image/upload/v1786997124/portfolio/projects/the-landing-list/login.png",
        "alt": "The Landing List login screen",
        "caption": "Login"
      },
      {
        "src": "https://res.cloudinary.com/dcrgvijkc/image/upload/v1786997126/portfolio/projects/the-landing-list/signup.png",
        "alt": "The Landing List create account screen",
        "caption": "Sign up"
      },
      {
        "src": "https://res.cloudinary.com/dcrgvijkc/image/upload/v1786997126/portfolio/projects/the-landing-list/classifieds.png",
        "alt": "The Landing List classified ads grid with chat and call actions",
        "caption": "Classifieds"
      },
      {
        "src": "https://res.cloudinary.com/dcrgvijkc/image/upload/v1786997127/portfolio/projects/the-landing-list/select-category.png",
        "alt": "The Landing List select category for lost and found or classified ads",
        "caption": "Category"
      },
      {
        "src": "https://res.cloudinary.com/dcrgvijkc/image/upload/v1786997129/portfolio/projects/the-landing-list/post-ad.png",
        "alt": "The Landing List post ad form with image upload",
        "caption": "Post ad"
      }
    ],
    "applicationCategory": "BusinessApplication",
    "visual": "map"
  },
  {
    "slug": "flagship-towing",
    "title": "Flagship Towing",
    "seoLabel": "Marine membership and emergency dispatch app",
    "seoDescription": "MERN plus React Native: member app, React admin, coverage maps, and web signup for 24/7 marine towing and assistance memberships.",
    "tagline": "24/7 boat towing memberships.",
    "description": "Marine assistance for Florida and Texas boaters — memberships, on-water towing, and emergency access. MERN stack plus React Native: member app, React admin, and a web signup for new customers.",
    "industries": [
      "marine"
    ],
    "role": "Full-stack engineer · MERN and React Native",
    "year": "2025–2026",
    "status": "shipped",
    "featured": true,
    "listed": true,
    "technologies": [
      "React Native",
      "React",
      "Node.js",
      "Express",
      "MongoDB"
    ],
    "liveUrl": "https://play.google.com/store/apps/details?id=com.genesysglobal.flagship",
    "liveLabel": "Play Store",
    "appStoreUrl": "https://apps.apple.com/us/app/flagship-towing/id6747052086",
    "webUrl": "https://flagship-towing-member.projectstagingzone.com/signin.html",
    "webLabel": "Member web",
    "challenge": "A disabled vessel doesn’t wait on a call center. Members need coverage they can prove on the phone, a captain they can reach, and a way to join before they’re already in the water — without three disconnected systems.",
    "solution": "Built the product across three surfaces on one MERN backend: React Native for members (home, memberships, services, location, emergency), a React admin for operations, and a web flow for new customers to sign in and become members.",
    "architecture": [
      "MongoDB, Express, React, Node.js as the shared platform",
      "React Native member app — iOS and Android store delivery",
      "React admin for memberships, users, and service operations",
      "Web signup/signin for new customers",
      "Membership tiers: saltwater, freshwater/lake, and commercial",
      "Coverage map, vessel photos, authorized users, and emergency contacts"
    ],
    "engineering": [
      "One domain across app, admin, and web — memberships and service requests, not three copies of the user model.",
      "Emergency paths as product: call now, 911, Coast Guard, and on-water dispatch — not buried in a FAQ.",
      "Store delivery on Google Play and the App Store under Pixel Genesys."
    ],
    "outcome": "Live as Flagship Towing on the App Store (5.0) and Google Play — 24/7 towing, jumps, fuel, ungroundings, and propeller help for recreational and commercial members.",
    "highlights": [
      "MERN + React Native",
      "Admin + member web",
      "On-water emergency"
    ],
    "screenshots": [
      {
        "src": "https://res.cloudinary.com/dcrgvijkc/image/upload/v1786997131/portfolio/projects/flagship-towing/home.png",
        "alt": "Flagship Towing home with membership card, call now, and map",
        "caption": "Home"
      },
      {
        "src": "https://res.cloudinary.com/dcrgvijkc/image/upload/v1786997131/portfolio/projects/flagship-towing/memberships.png",
        "alt": "Flagship Towing saltwater, freshwater, and commercial memberships",
        "caption": "Memberships"
      },
      {
        "src": "https://res.cloudinary.com/dcrgvijkc/image/upload/v1786997132/portfolio/projects/flagship-towing/services.png",
        "alt": "Flagship Towing list of towing and marine assistance services",
        "caption": "Services"
      },
      {
        "src": "https://res.cloudinary.com/dcrgvijkc/image/upload/v1786997133/portfolio/projects/flagship-towing/safety.png",
        "alt": "Flagship Towing safety tips while a captain is en route",
        "caption": "Safety tips"
      },
      {
        "src": "https://res.cloudinary.com/dcrgvijkc/image/upload/v1786997134/portfolio/projects/flagship-towing/emergency.png",
        "alt": "Flagship Towing emergency contacts for 911, Coast Guard, and dispatch",
        "caption": "Emergency"
      }
    ],
    "logo": "https://res.cloudinary.com/dcrgvijkc/image/upload/v1786997135/portfolio/projects/flagship-towing/logo.png",
    "applicationCategory": "LifestyleApplication",
    "visual": "map"
  },
  {
    "slug": "zeus-lights",
    "title": "Zeus Lights",
    "seoLabel": "IoT LED lighting control platform",
    "seoDescription": "IoT stack: React Native, Next.js operations dashboard, NestJS, and MQTT for permanent LED lighting control.",
    "tagline": "IoT control for permanent LED lighting.",
    "description": "The homeowner app and operations stack for Zeus Illumination — permanent outdoor LED lighting controlled from a phone. Fullstack: React Native client, Next.js dashboard, NestJS APIs, and MQTT to the lighting controllers.",
    "industries": [
      "iot"
    ],
    "role": "Full-stack engineer · React Native, Next.js, NestJS, MQTT",
    "year": "2026",
    "status": "shipped",
    "featured": true,
    "listed": true,
    "technologies": [
      "React Native",
      "Next.js",
      "NestJS",
      "MQTT",
      "TypeScript"
    ],
    "liveUrl": "https://play.google.com/store/apps/details?id=com.genesysglobal.zeus.app",
    "liveLabel": "Play Store",
    "appStoreUrl": "https://apps.apple.com/app/zeus-lights/id6760841370",
    "webUrl": "https://zeusillumination.com/",
    "webLabel": "Website",
    "challenge": "Permanent roofline LEDs are useless if the app drops the controller after a new router, can’t schedule without internet, or treats a 200-foot facade as one dumb strip. Hardware, cloud, and phone have to agree on what the lights are actually doing.",
    "solution": "Built the stack end-to-end: React Native for live control (color, brightness, sections, custom designs), a Next.js dashboard for ops, NestJS as the API, and MQTT to talk to WLED-class controllers — including rediscovery after network changes and schedules that still run.",
    "architecture": [
      "React Native app for iOS and Android",
      "Next.js dashboard for installations and operations",
      "NestJS backend for accounts, devices, presets, and schedules",
      "MQTT to lighting controllers for realtime command and state",
      "Section-level control and bulb-by-bulb custom designs",
      "Sunrise/sunset schedules and warm-white spectrum"
    ],
    "engineering": [
      "IoT as a product problem: connection reliability, controller rediscovery, and UI that reflects actual device state — not a cached toggle.",
      "MQTT as the device bus; NestJS as the contract the dashboard and the phone both speak.",
      "Shipped store-ready on the App Store (and Android) under the Zeus / Pixel Genesys stack."
    ],
    "outcome": "Live as Zeus Lights on the App Store — permanent LED control for Austin-area homes: holidays, everyday ambiance, and security from one system.",
    "highlights": [
      "MQTT / IoT",
      "NestJS + Next.js",
      "React Native"
    ],
    "logo": "https://res.cloudinary.com/dcrgvijkc/image/upload/v1786997136/portfolio/projects/zeus-lights/logo.png",
    "applicationCategory": "UtilitiesApplication",
    "visual": "orbit"
  },
  {
    "slug": "downtime-dating",
    "title": "DownTime Dating",
    "seoLabel": "Schedule-based dating app",
    "seoDescription": "Full-stack dating product with schedule-based matching, React Native, admin, chat, and WebRTC audio/video calling — built for shift workers and busy professionals.",
    "tagline": "Dating for people who don’t work 9–5.",
    "description": "A dating app that matches on overlapping free days — for night shifts, weekends, and rotating hours. Built full-stack: React Native client, admin console, and the APIs behind matching, chat, and WebRTC calling. Live on Google Play; App Store under review.",
    "industries": [
      "dating",
      "social"
    ],
    "role": "Full-stack engineer · React Native, admin, APIs",
    "year": "2026",
    "status": "shipped",
    "featured": false,
    "listed": true,
    "technologies": [
      "React Native",
      "React",
      "TypeScript",
      "REST APIs",
      "Realtime chat",
      "WebRTC"
    ],
    "liveUrl": "https://play.google.com/store/apps/details?id=com.genesysglobal.downtime",
    "liveLabel": "Play Store",
    "webUrl": "https://downtimedatingapp.net/",
    "webLabel": "Website",
    "challenge": "Most dating apps assume Saturday night. Shift workers are free when everyone else is asleep — so they match with people they can never actually meet. Availability had to be a first-class matching signal, not a bio line.",
    "solution": "Shipped the product end-to-end: schedule-based matching, filters, incognito and visibility controls, read receipts, and chat plus WebRTC audio/video calling. A React admin for users, reports, and operations. iOS build submitted; Android is live.",
    "architecture": [
      "React Native app for Android (iOS in App Store review)",
      "React admin for users, moderation, and subscriptions",
      "API-backed profiles, schedules, and matching",
      "Chat with read receipts",
      "WebRTC audio and video calling",
      "Incognito mode and profile visibility controls"
    ],
    "engineering": [
      "Matching on overlapping free days — schedule as a domain object, not a filter afterthought.",
      "WebRTC for in-app audio and video calling.",
      "Owned mobile, admin, and backend so ops can moderate without shipping a new binary.",
      "Store path: Google Play shipped; App Store listing in review."
    ],
    "outcome": "Live on Google Play as DownTime Dating — schedule-based matching for shift workers and busy professionals. App Store submission is in review.",
    "highlights": [
      "Schedule-based matching",
      "Full-stack + admin",
      "WebRTC calling"
    ],
    "logo": "https://res.cloudinary.com/dcrgvijkc/image/upload/v1786997138/portfolio/projects/downtime-dating/logo.png",
    "applicationCategory": "SocialNetworkingApplication",
    "visual": "glass"
  },
  {
    "slug": "najednation",
    "title": "Najednation",
    "seoLabel": "Saudi fashion e-commerce mobile app",
    "seoDescription": "Expo (React Native) shopping app for modest fashion in Saudi Arabia — catalog, wishlists, guest checkout, gifts, and App Store delivery via EAS.",
    "tagline": "Modest fashion shopping for KSA.",
    "description": "The mobile shopping app for a Saudi fashion brand — abayas, dresses, bags, perfume, and more, with wishlists, guest checkout, and send-as-gift. Built in Expo (React Native) and shipped to the App Store with EAS.",
    "industries": [
      "fashion",
      "ecommerce"
    ],
    "role": "React Native engineer · Expo, EAS",
    "year": "2025",
    "status": "shipped",
    "featured": false,
    "listed": true,
    "technologies": [
      "Expo",
      "EAS",
      "React Native",
      "TypeScript",
      "REST APIs",
      "iOS"
    ],
    "appStoreUrl": "https://apps.apple.com/sa/app/najednation/id6749664787",
    "challenge": "A heritage fashion brand needed a phone-native store — not a wrapped website. Shoppers in KSA expect catalog, wishlist, checkout, and gifting in Arabic-market retail UX, including buying without an account.",
    "solution": "Built the shopping client in Expo: browse collections, save looks, guest checkout, send-as-gift. EAS Build and EAS Submit for iOS store delivery. Mobile scope — catalog and order APIs stay on the brand’s backend.",
    "architecture": [
      "Expo (React Native) app for iPhone and iPad (iOS 16+)",
      "EAS Build and EAS Submit for App Store binaries",
      "Product catalog: modest fashion, accessories, and beauty",
      "Wishlists and saved looks",
      "Guest checkout and send-as-gift flows",
      "KSA delivery and location-aware shopping"
    ],
    "engineering": [
      "Owned the mobile layer in Expo — UI and commerce flows, not a CLI eject.",
      "EAS for cloud builds and App Store submit — repeatable iOS shipping, not a local Xcode lottery.",
      "Guest checkout and gifting as first-class paths, not an afterthought login wall."
    ],
    "outcome": "Live on the App Store as Najednation — Home of Fashion. 5.0 rating. Modest fashion retail for shoppers in Saudi Arabia, shipped with Expo and EAS.",
    "highlights": [
      "Expo + EAS",
      "Fashion e-commerce",
      "App Store (KSA)"
    ],
    "logo": "https://res.cloudinary.com/dcrgvijkc/image/upload/v1786997139/portfolio/projects/najednation/logo.png",
    "applicationCategory": "ShoppingApplication",
    "visual": "frame"
  },
  {
    "slug": "manifestyrdreamz",
    "title": "Manifest Yr Dreamz",
    "seoLabel": "Journal, goals, and vision-board app",
    "seoDescription": "Full-stack journal product: gratitude, goals, notes, vision boards, reminders, in-app subscriptions, React Native, admin, and billing APIs.",
    "tagline": "Gratitude, goals, and a vision board in one journal.",
    "description": "A personal journal for gratitude, goal tracking, notes, and vision boards — with reminders and in-app subscriptions. Built full-stack at Pixel Genesys: React Native app, admin panel, and the APIs behind accounts, entries, and billing.",
    "industries": [
      "wellness"
    ],
    "role": "Full-stack engineer · React Native, admin, APIs",
    "year": "2025–2026",
    "status": "shipped",
    "featured": false,
    "listed": true,
    "technologies": [
      "React Native",
      "React",
      "TypeScript",
      "REST APIs",
      "In-app purchases"
    ],
    "liveUrl": "https://play.google.com/store/apps/details?id=com.pixelgenesys.journal.manifest",
    "liveLabel": "Play Store",
    "appStoreUrl": "https://apps.apple.com/us/app/manifest-yr-dreamz-journal/id6744982041",
    "challenge": "Gratitude apps, goal trackers, and vision boards usually live in three products. People drop the habit when planning, reflecting, and paying for premium are split across tools that don’t share an account.",
    "solution": "Shipped one journal: daily gratitude, goals with steps, notes, vision board, and reminders — plus subscriptions (trial, monthly) and a React admin for users, content, and billing ops. Store delivery on iOS and Android.",
    "architecture": [
      "React Native client for iOS and Android",
      "React admin for users, subscriptions, and support",
      "API-backed journals, goals, notes, and vision boards",
      "In-app purchases and subscription lifecycle",
      "Daily reminders to write, plan, and reflect"
    ],
    "engineering": [
      "Owned mobile, admin, and backend so gratitude/goals data and billing share one account model.",
      "Subscription flows as product: trial, purchase, cancel, and password recovery — not a StoreKit demo.",
      "Shipped on Google Play and the App Store under Pixel Genesys."
    ],
    "outcome": "Live as Manifest Yr Dreamz — Journal on the App Store and Google Play: gratitude, goals, notes, and a vision board with a paid tier.",
    "highlights": [
      "Full-stack + admin",
      "Subscriptions",
      "Journal + goals"
    ],
    "logo": "https://res.cloudinary.com/dcrgvijkc/image/upload/v1786997141/portfolio/projects/manifestyrdreamz/logo.png",
    "applicationCategory": "LifestyleApplication",
    "visual": "horizon"
  }
];
