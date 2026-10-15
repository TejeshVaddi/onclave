import { liveSites } from "@/services/osm";

export const maxDuration = 30;

const MAX_URLS = 30;

/**
 * Tells the browser which of the websites it found on the map still load, so
 * a button never leads to a dead page. Browsers cannot check this themselves
 * (other sites do not allow it), so the server does.
 */
export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ alive: {} }, { status: 400 });
  }
  const urls = (body as { urls?: unknown })?.urls;
  if (!Array.isArray(urls) || urls.length > MAX_URLS || !urls.every((u) => typeof u === "string" && u.length <= 300)) {
    return Response.json({ alive: {} }, { status: 400 });
  }
  return Response.json({ alive: await liveSites(urls as string[]) });
}
