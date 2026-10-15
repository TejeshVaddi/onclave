import type { LiveResultItem, LiveSource } from "@/services/gemini/types";

/**
 * Existence checks for search results. A language model can name a plausible
 * place, event, group, or person that does not exist, so nothing it returns is
 * shown until the server has loaded the page the result points to and found
 * the result's name on it. Results whose page is missing, unreachable, or
 * about something else are dropped.
 *
 * Server-only: this makes outbound requests from a Route Handler.
 */

const FETCH_TIMEOUT_MS = 7_000;
const MAX_BYTES = 700_000;
const OVERALL_BUDGET_MS = 16_000;

const BROWSER_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
// Social platforms serve their public preview tags to link-preview crawlers
// even when they show a login wall to browsers.
const PREVIEW_UA = "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uagent.php)";

/** Hosts that commonly block server-side requests but have stable, specific public URLs. */
const PLATFORM_HOSTS = [
  "facebook.com",
  "instagram.com",
  "linkedin.com",
  "x.com",
  "twitter.com",
  "nextdoor.com",
  "discord.gg",
  "discord.com",
  "reddit.com",
  "meetup.com",
  "eventbrite.com",
  "youtube.com",
  "tiktok.com",
  "whatsapp.com",
  "t.me",
];

const GENERIC_WORDS = new Set([
  "the", "a", "an", "of", "and", "for", "in", "at", "to", "on", "by", "with",
  "restaurant", "kitchen", "cafe", "grill", "market", "center", "centre", "church", "temple",
  "mosque", "association", "community", "group", "society", "club", "network", "festival",
  "celebration", "annual", "museum", "bakery", "grocery", "house", "inc", "llc", "org",
  "northern", "virginia", "washington", "dc", "new", "old", "great", "american", "united",
  "states", "city", "national", "international", "foundation", "council", "united",
]);

export interface PageProbe {
  /** The page loaded and we could read it. */
  readable: boolean;
  /** The site refused automated requests (login wall, 403, rate limit) rather than the page being missing. */
  blocked: boolean;
  status: number;
  finalUrl: string;
  title: string;
  /** Lowercased, accent-stripped visible text (and title and description), capped in length. */
  text: string;
  /** Raw HTML, capped, for checking links and addresses. */
  html: string;
}

const EMPTY_PROBE = (url: string, status = 0, blocked = false): PageProbe => ({
  readable: false,
  blocked,
  status,
  finalUrl: url,
  title: "",
  text: "",
  html: "",
});

/** Refuse anything that is not a plain public http(s) host (this server must not be a way into private networks). */
export function isPublicHttpUrl(raw: string): boolean {
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return false;
  }
  if (u.protocol !== "https:" && u.protocol !== "http:") return false;
  if (u.port && u.port !== "80" && u.port !== "443") return false;
  const host = u.hostname.toLowerCase();
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local") || host.endsWith(".internal")) return false;
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) {
    const [a, b] = host.split(".").map(Number);
    if (a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168)) return false;
  }
  if (host.includes(":") || host === "[::1]") return false;
  return host.includes(".");
}

export function normalizeText(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, n: string) => String.fromCharCode(Number(n)));
}

function metaContent(html: string, key: string): string {
  const re = new RegExp(`<meta[^>]+(?:property|name)=["']${key}["'][^>]*content=["']([^"']*)["']`, "i");
  const re2 = new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]*(?:property|name)=["']${key}["']`, "i");
  return decodeEntities((html.match(re) ?? html.match(re2))?.[1] ?? "");
}

function readableText(html: string): string {
  return decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/\s+/g, " ")
    .trim();
}

async function readCapped(res: Response): Promise<string> {
  if (!res.body) return "";
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (total < MAX_BYTES) {
    const { done, value } = await reader.read();
    if (done || !value) break;
    chunks.push(value);
    total += value.byteLength;
  }
  reader.cancel().catch(() => {});
  const merged = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) {
    merged.set(c, offset);
    offset += c.byteLength;
  }
  return new TextDecoder("utf-8", { fatal: false }).decode(merged);
}

async function fetchOnce(url: string, userAgent: string): Promise<PageProbe> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: { "user-agent": userAgent, accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.5", "accept-language": "en-US,en;q=0.9" },
    });
    const finalUrl = res.url || url;
    if (!isPublicHttpUrl(finalUrl)) return EMPTY_PROBE(url, res.status);
    if ([401, 403, 405, 406, 429, 451, 999].includes(res.status)) return EMPTY_PROBE(finalUrl, res.status, true);
    if (!res.ok) return EMPTY_PROBE(finalUrl, res.status);
    const type = res.headers.get("content-type") ?? "";
    if (type && !/html|text|xml/i.test(type)) return EMPTY_PROBE(finalUrl, res.status);
    const html = await readCapped(res);
    const title = decodeEntities((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "").replace(/\s+/g, " ").trim());
    const description = metaContent(html, "og:description") || metaContent(html, "description");
    const ogTitle = metaContent(html, "og:title");
    const body = readableText(html).slice(0, 80_000);
    const text = normalizeText(`${title} ${ogTitle} ${description} ${body}`);
    return { readable: text.length > 0, blocked: false, status: res.status, finalUrl, title: title || ogTitle, text, html: html.slice(0, MAX_BYTES) };
  } catch {
    return EMPTY_PROBE(url);
  } finally {
    clearTimeout(timer);
  }
}

export function hostOf(url: string): string {
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return "";
  }
}

function isPlatformHost(host: string): boolean {
  return PLATFORM_HOSTS.some((p) => host === p || host.endsWith(`.${p}`));
}

function toggleWww(url: string): string | null {
  try {
    const u = new URL(url);
    u.hostname = u.hostname.startsWith("www.") ? u.hostname.slice(4) : `www.${u.hostname}`;
    return u.toString();
  } catch {
    return null;
  }
}

/**
 * Loads a page. Models often add or drop a leading "www.", so a host that
 * does not resolve is retried the other way. A platform that blocks a
 * browser-like request is retried as a link-preview crawler.
 */
export async function probePage(url: string, retryAsPreview = true): Promise<PageProbe> {
  if (!isPublicHttpUrl(url)) return EMPTY_PROBE(url);
  let first = await fetchOnce(url, BROWSER_UA);
  if (!first.readable && first.status === 0) {
    const alt = toggleWww(url);
    if (alt && isPublicHttpUrl(alt)) {
      const second = await fetchOnce(alt, BROWSER_UA);
      if (second.readable || second.status !== 0) first = second;
    }
  }
  if (first.readable || !retryAsPreview) return first;
  if (first.blocked || isPlatformHost(hostOf(url))) {
    const second = await fetchOnce(first.finalUrl || url, PREVIEW_UA);
    if (second.readable) return second;
    return first.blocked || second.blocked ? { ...first, blocked: true } : first;
  }
  return first;
}

/** The distinctive words of a name: what must show up on a page for it to be about that name. */
export function distinctiveTokens(name: string): string[] {
  const all = normalizeText(name)
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1);
  const distinctive = all.filter((t) => !GENERIC_WORDS.has(t));
  return distinctive.length ? distinctive : all;
}

/** Share of a name's distinctive words found in the page text, 0 to 1. */
export function nameScore(name: string, pageText: string): number {
  const tokens = distinctiveTokens(name);
  if (!tokens.length) return 0;
  return tokens.filter((t) => pageText.includes(t)).length / tokens.length;
}

export interface Verdict {
  ok: boolean;
  finalUrl?: string;
  pageTitle?: string;
  reason: string;
}

/** Share of a name's distinctive words that appear in a web address (words run together there, so substring match). */
function addressScore(name: string, url: string): number {
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return 0;
  }
  const address = normalizeText(`${u.hostname.replace(/^www\./, "")}${u.pathname}`).replace(/[^a-z0-9]/g, "");
  const tokens = distinctiveTokens(name);
  if (!tokens.length) return 0;
  return tokens.filter((t) => t.length >= 3 && address.includes(t)).length / tokens.length;
}

/**
 * Decides whether a result's own page proves it exists. A readable page must
 * contain the result's distinctive name words. Pages that are an empty app
 * shell (a lot of small sites) are judged by whether their address is named
 * for the result. Social platforms that hide content from crawlers are
 * accepted only when the link is a specific page (not a search or a bare
 * homepage) and it names the result or the platform appears among the search
 * sources.
 */
export async function verifyNamedPage(name: string, url: string, groundedHosts: Set<string>, minScore = 0.6): Promise<Verdict> {
  const probe = await probePage(url);
  const finalUrl = probe.finalUrl || url;
  const host = hostOf(finalUrl);
  const sparse = probe.text.length < 600;

  if (probe.readable && nameScore(name, probe.text) >= minScore) {
    return { ok: true, finalUrl, pageTitle: probe.title, reason: "name found on page" };
  }

  if (probe.readable && sparse && !isPlatformHost(host) && addressScore(name, finalUrl) >= minScore) {
    return { ok: true, finalUrl, pageTitle: probe.title, reason: "page is live and its address is named for the result" };
  }

  if ((probe.blocked || !probe.readable || sparse) && isPlatformHost(host) && (probe.blocked || probe.readable)) {
    let path = "/";
    try {
      path = new URL(url).pathname;
    } catch {
      /* handled below */
    }
    const specific = path.replace(/\/+$/, "").length > 1 && !/\/(search|login|signup|explore)(\/|$)/i.test(path);
    const slug = normalizeText(decodeURIComponent(path)).replace(/[^a-z0-9]+/g, " ");
    const slugHasName = distinctiveTokens(name).some((t) => t.length >= 3 && slug.includes(t));
    const searchedIt = [...groundedHosts].some((h) => h === host || h.endsWith(`.${host}`) || host.endsWith(`.${h}`));
    if (specific && (slugHasName || searchedIt)) return { ok: true, finalUrl: url, pageTitle: probe.title, reason: "specific platform page that hides content from crawlers" };
  }

  if (probe.readable) return { ok: false, reason: `page does not mention "${name}"` };
  return { ok: false, reason: probe.blocked ? "page blocks checks and is not a trusted specific platform page" : `page not reachable (status ${probe.status})` };
}

/** Hosts the search itself retrieved from, to corroborate pages that block our own check. */
export function hostsFromSources(sources: LiveSource[]): Set<string> {
  const hosts = new Set<string>();
  for (const s of sources) {
    for (const candidate of [s.title, s.url]) {
      const m = candidate.toLowerCase().match(/([a-z0-9-]+\.)+[a-z]{2,}/);
      if (m) hosts.add(m[0].replace(/^www\./, ""));
    }
  }
  return hosts;
}

function withinBudget<T>(work: Promise<T>, fallback: T): Promise<T> {
  return Promise.race([work, new Promise<T>((resolve) => setTimeout(() => resolve(fallback), OVERALL_BUDGET_MS))]);
}

const TODAY = () => new Date().toISOString().slice(0, 10);

/**
 * Keeps only results that were confirmed to exist. Every result needs its own
 * URL; the page behind it must exist and name it. Events must also be dated
 * today or later.
 */
export async function verifyResults(items: LiveResultItem[], sources: LiveSource[]): Promise<LiveResultItem[]> {
  const grounded = hostsFromSources(sources);
  const today = TODAY();

  const checked = await Promise.all(
    items.map(async (item): Promise<LiveResultItem | null> => {
      if (!item.externalUrl) return null;
      if (item.kind === "event" && (!item.date || item.date < today)) return null;
      // Events are named on their own page, but looser matching copes with titles like "Name | Venue".
      const minScore = item.kind === "event" ? 0.5 : 0.6;
      const verdict = await withinBudget(verifyNamedPage(item.name, item.externalUrl, grounded, minScore), { ok: false, reason: "timed out" } satisfies Verdict);
      if (!verdict.ok) return null;
      return { ...item, externalUrl: verdict.finalUrl ?? item.externalUrl, sourceTitle: verdict.pageTitle || undefined };
    }),
  );

  const seen = new Set<string>();
  return checked.filter((item): item is LiveResultItem => {
    if (!item) return false;
    const key = `${normalizeText(item.name)}|${hostOf(item.externalUrl ?? "")}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
