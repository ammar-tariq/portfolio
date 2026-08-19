const TITLE_RE =
  /\b(software|engineer|developer|programmer|frontend|front[- ]end|backend|back[- ]end|full[- ]?stack|mobile|ios|android|react native|sre|devops|machine learning|data engineer|ai engineer|ml engineer|web engineer|site reliability)\b/i;

export function isSoftwareRole(title: string) {
  return TITLE_RE.test(title);
}

export function looksRemote(location: string, title = "", description = "") {
  const hay = `${location} ${title} ${description}`.toLowerCase();
  return /\b(remote|work from home|wfh|distributed|anywhere|worldwide)\b/.test(hay);
}
