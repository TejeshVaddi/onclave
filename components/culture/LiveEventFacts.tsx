import type { LiveEventItem } from "@/services/gemini/types";

/** The specifics a live (web-found) event can carry beyond its name and blurb. */
export function LiveEventFacts({ item, className }: { item: LiveEventItem; className?: string }) {
  const rows: [string, string][] = [];
  if (item.organizer) rows.push(["Organizer", item.organizer]);
  if (item.performers?.length) rows.push(["Performers", item.performers.join(", ")]);
  if (item.price) rows.push(["Price", item.price]);
  if (item.ticketInfo) rows.push(["Tickets", item.ticketInfo]);
  if (item.address) rows.push(["Address", item.address]);
  if (!rows.length) return null;
  return (
    <dl className={className ?? "mt-2 space-y-1 text-xs"}>
      {rows.map(([k, v]) => (
        <div key={k} className="flex gap-2">
          <dt className="w-[4.5rem] shrink-0 font-semibold uppercase tracking-wide text-brown-faint">{k}</dt>
          <dd className="text-brown">{v}</dd>
        </div>
      ))}
    </dl>
  );
}
