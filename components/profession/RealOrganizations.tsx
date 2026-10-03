import { ExternalLink } from "lucide-react";
import type { HeritageId, ProfessionId } from "@/types";
import { orgsFor } from "@/data/professionalOrgs";

/**
 * Real professional associations where a person can find actual mentors in
 * this field and community. The mentors on Onclave's demo are example
 * profiles, so this is the honest bridge to real people.
 */
export function RealOrganizations({ profession, heritages, firstName }: { profession: ProfessionId; heritages: HeritageId[]; firstName: string }) {
  const orgs = orgsFor(profession, heritages);
  if (!orgs.length) return null;
  return (
    <section className="mt-6 border-t border-beige pt-5">
      <h2 className="text-xs font-bold uppercase tracking-wide text-brown-faint">Find real mentors like {firstName}</h2>
      <p className="mt-1 text-sm text-brown-muted">These real associations run chapters, mentoring, and networking for people in this field.</p>
      <ul className="mt-3 space-y-2">
        {orgs.map((o) => (
          <li key={o.url}>
            <a
              href={o.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start justify-between gap-3 rounded-2xl border border-beige bg-cream px-4 py-3 transition hover:border-terracotta/50"
            >
              <span>
                <span className="block text-sm font-semibold text-brown group-hover:underline">{o.name}</span>
                <span className="mt-0.5 block text-xs text-brown-muted">{o.blurb}</span>
              </span>
              <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-brown-faint" aria-hidden />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
