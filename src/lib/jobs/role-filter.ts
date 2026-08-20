export function looksRemote(location: string, title = "", description = "") {
  const hay = `${location} ${title} ${description}`.toLowerCase();
  return /\b(remote|work from home|wfh|distributed|anywhere|worldwide)\b/.test(hay);
}
