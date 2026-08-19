import mongoose, { Schema } from "mongoose";

const screenshotSchema = new Schema(
  {
    src: String,
    alt: String,
    caption: String,
    publicId: String,
  },
  { _id: false },
);

const projectSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    seoLabel: { type: String, required: true },
    seoDescription: { type: String, required: true },
    tagline: { type: String, default: "" },
    description: { type: String, default: "" },
    industries: { type: [String], default: [] },
    role: { type: String, default: "" },
    year: String,
    status: { type: String, enum: ["shipped", "active", "internal"], default: "shipped" },
    featured: { type: Boolean, default: false },
    listed: { type: Boolean, default: true },
    technologies: { type: [String], default: [] },
    github: String,
    liveUrl: String,
    liveLabel: String,
    appStoreUrl: String,
    webUrl: String,
    webLabel: String,
    challenge: String,
    solution: String,
    architecture: { type: [String], default: [] },
    engineering: { type: [String], default: [] },
    outcome: String,
    highlights: { type: [String], default: [] },
    screenshots: { type: [screenshotSchema], default: [] },
    iosScreenshots: { type: [screenshotSchema], default: [] },
    androidScreenshots: { type: [screenshotSchema], default: [] },
    logo: String,
    logoPublicId: String,
    banner: String,
    bannerPublicId: String,
    video: String,
    videoPublicId: String,
    videoUrl: String,
    ogImage: String,
    ogImagePublicId: String,
    applicationCategory: String,
    visual: { type: String, default: "orbit" },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const ProjectModel =
  mongoose.models.Project ?? mongoose.model("Project", projectSchema);

const experienceSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    role: String,
    company: String,
    period: String,
    year: String,
    location: String,
    summary: String,
    technologies: { type: [String], default: [] },
    responsibilities: { type: [String], default: [] },
    projects: { type: [String], default: [] },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const ExperienceModel =
  mongoose.models.Experience ?? mongoose.model("Experience", experienceSchema);

const skillSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    label: String,
    summary: String,
    items: {
      type: [{ name: String, note: String }],
      default: [],
    },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const SkillCategoryModel =
  mongoose.models.SkillCategory ?? mongoose.model("SkillCategory", skillSchema);

const principleSchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    title: String,
    statement: String,
    body: String,
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const PrincipleModel =
  mongoose.models.Principle ?? mongoose.model("Principle", principleSchema);

const industrySchema = new Schema({
  id: { type: String, required: true, unique: true },
  label: String,
  sortOrder: { type: Number, default: 0 },
});

export const IndustryModel =
  mongoose.models.Industry ?? mongoose.model("Industry", industrySchema);

const openSourceSchema = new Schema({
  slug: { type: String, required: true, unique: true },
  title: String,
  description: String,
  repoUrl: String,
  demoUrl: String,
  demoLabel: String,
  language: String,
  topics: { type: [String], default: [] },
  sortOrder: { type: Number, default: 0 },
});

export const OpenSourceModel =
  mongoose.models.OpenSource ?? mongoose.model("OpenSource", openSourceSchema);

const settingsSchema = new Schema(
  {
    _id: { type: String, default: "site" },
    profile: { type: Schema.Types.Mixed, default: {} },
    social: { type: Schema.Types.Mixed, default: {} },
    navItems: { type: Schema.Types.Mixed, default: [] },
    seo: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

export const SettingsModel =
  mongoose.models.Settings ?? mongoose.model("Settings", settingsSchema);

const architectureSchema = new Schema(
  {
    _id: { type: String, default: "architecture" },
    identityGraph: { type: Schema.Types.Mixed, default: {} },
    systemArchitecture: { type: Schema.Types.Mixed, default: [] },
    aiPipeline: { type: Schema.Types.Mixed, default: [] },
    aiConcepts: { type: Schema.Types.Mixed, default: [] },
  },
  { timestamps: true },
);

export const ArchitectureModel =
  mongoose.models.Architecture ?? mongoose.model("Architecture", architectureSchema);

const pageViewSchema = new Schema(
  {
    path: { type: String, required: true, index: true },
    referrer: { type: String, default: "" },
    country: { type: String, default: "" },
    region: { type: String, default: "" },
    city: { type: String, default: "" },
    lat: Number,
    lng: Number,
    visitorHash: { type: String, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

pageViewSchema.index({ createdAt: 1 });

export const PageViewModel =
  mongoose.models.PageView ?? mongoose.model("PageView", pageViewSchema);

const visitNotifySchema = new Schema(
  {
    sessionId: { type: String, required: true, unique: true },
    location: String,
    paths: { type: [String], default: [] },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

visitNotifySchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 14 });

export const VisitNotifyModel =
  mongoose.models.VisitNotify ?? mongoose.model("VisitNotify", visitNotifySchema);

const applicationFileSchema = new Schema(
  {
    url: String,
    publicId: String,
  },
  { _id: false },
);

const jobApplicationSchema = new Schema(
  {
    company: { type: String, required: true },
    role: { type: String, required: true },
    jobUrl: String,
    location: String,
    jd: { type: String, default: "" },
    aboutCompany: { type: String, default: "" },
    extraQuestions: { type: String, default: "" },
    keywords: { type: [String], default: [] },
    resume: { type: Schema.Types.Mixed, default: {} },
    coverLetter: { type: String, default: "" },
    answers: {
      type: [
        {
          question: String,
          answer: String,
          createdAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
    sends: {
      type: [
        {
          to: String,
          cc: String,
          subject: String,
          via: String,
          messageId: String,
          threadId: String,
          attached: { type: [String], default: [] },
          createdAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
    replies: {
      type: [
        {
          messageId: String,
          threadId: String,
          from: String,
          subject: String,
          snippet: String,
          classification: String,
          receivedAt: Date,
        },
      ],
      default: [],
    },
    inboxStatus: { type: String, enum: ["replied", "interview", "rejected", "offer"] },
    files: {
      resumePdf: applicationFileSchema,
      resumeTxt: applicationFileSchema,
      resumeHtml: applicationFileSchema,
      coverLetter: applicationFileSchema,
      answers: applicationFileSchema,
    },
    status: { type: String, enum: ["draft", "applied", "archived"], default: "draft" },
    warning: String,
    sentAt: Date,
    lastReplyAt: Date,
  },
  { timestamps: true },
);

jobApplicationSchema.index({ createdAt: -1 });
jobApplicationSchema.index({ "sends.threadId": 1 });

export const JobApplicationModel =
  mongoose.models.JobApplication ?? mongoose.model("JobApplication", jobApplicationSchema);

const gmailSyncSchema = new Schema(
  {
    _id: { type: String, default: "gmail" },
    historyId: String,
    watchExpiration: Date,
    lastSyncAt: Date,
    lastError: String,
  },
  { timestamps: true },
);

export const GmailSyncModel =
  mongoose.models.GmailSync ?? mongoose.model("GmailSync", gmailSyncSchema);

const adminPushTokenSchema = new Schema(
  {
    token: { type: String, required: true, unique: true, index: true },
    userAgent: { type: String, default: "" },
  },
  { timestamps: true },
);

export const AdminPushTokenModel =
  mongoose.models.AdminPushToken ?? mongoose.model("AdminPushToken", adminPushTokenSchema);

const adminNotifySchema = new Schema(
  {
    _id: { type: String, default: "notify" },
    lastDigestOn: String,
  },
  { timestamps: true },
);

export const AdminNotifyModel =
  mongoose.models.AdminNotify ?? mongoose.model("AdminNotify", adminNotifySchema);

const watchAts = [
  "greenhouse",
  "lever",
  "ashby",
  "workable",
  "recruitee",
  "personio",
  "breezy",
  "smartrecruiters",
  "bamboohr",
] as const;

const companyWatchSchema = new Schema(
  {
    name: { type: String, required: true },
    ats: { type: String, required: true, enum: watchAts },
    token: { type: String, required: true },
    enabled: { type: Boolean, default: true },
    lastPolledAt: Date,
    lastError: String,
  },
  { timestamps: true },
);

companyWatchSchema.index({ ats: 1, token: 1 }, { unique: true });

export const CompanyWatchModel =
  mongoose.models.CompanyWatch ?? mongoose.model("CompanyWatch", companyWatchSchema);

const jobSourceEnum = [
  ...watchAts,
  "remote-ok",
  "remotive",
  "himalayas",
  "arbeitnow",
  "we-work-remotely",
  "jobicy",
  "working-nomads",
  "the-muse",
  "hn-who-is-hiring",
  "landing-jobs",
  "usajobs",
];

const jobListingSchema = new Schema(
  {
    source: { type: String, required: true, enum: jobSourceEnum, index: true },
    canonicalKey: { type: String, required: true, unique: true },
    applyUrl: { type: String, required: true },
    sourceUrls: { type: [String], default: [] },
    atsJobId: String,
    boardToken: String,
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, default: "" },
    remote: { type: Boolean, default: false },
    descriptionText: { type: String, default: "" },
    postedAt: Date,
    titleCompanyLocationHash: { type: String, required: true, index: true },
    priorityScore: { type: Number, default: 0, index: true },
    eligibilityNotes: { type: String, default: "" },
    visaLanguage: { type: Boolean, default: false },
    citizenshipRequirement: { type: Boolean, default: false },
    stackMatches: { type: [String], default: [] },
    status: {
      type: String,
      enum: ["seen", "saved", "skipped", "drafted", "applied", "hidden"],
      default: "seen",
      index: true,
    },
    applicationId: String,
  },
  { timestamps: true },
);

jobListingSchema.index({ status: 1, priorityScore: -1, createdAt: -1 });
jobListingSchema.index({ applyUrl: 1 });

export const JobListingModel =
  mongoose.models.JobListing ?? mongoose.model("JobListing", jobListingSchema);

const jobPollStateSchema = new Schema(
  {
    _id: { type: String, default: "jobs" },
    lastRunAt: Date,
    lastError: String,
    adapterErrors: {
      type: [{ adapter: String, error: String }],
      default: [],
    },
    lastAdded: { type: Number, default: 0 },
    lastUpdated: { type: Number, default: 0 },
    lastSkippedRole: { type: Number, default: 0 },
    lastWatchIndex: { type: Number, default: 0 },
    enabledBoards: {
      type: [String],
      default: [
        "remote-ok",
        "remotive",
        "himalayas",
        "arbeitnow",
        "we-work-remotely",
        "jobicy",
        "working-nomads",
        "the-muse",
        "hn-who-is-hiring",
        "landing-jobs",
      ],
    },
    includeCompanyAts: { type: Boolean, default: false },
    enabledBoardsVersion: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const JobPollStateModel =
  mongoose.models.JobPollState ?? mongoose.model("JobPollState", jobPollStateSchema);
