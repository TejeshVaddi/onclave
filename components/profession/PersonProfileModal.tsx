"use client";

import { useState, type ReactNode } from "react";
import { Loader2, Mail, MessageSquareText, Sparkles } from "lucide-react";
import type { Mentor } from "@/types";
import type { PersonDraft, PersonMoreInfo } from "@/services/gemini/types";
import { useAppState } from "@/components/providers/AppStateProvider";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { CopyButton } from "@/components/ui/CopyButton";
import { Textarea } from "@/components/ui/Input";
import { fetchPersonAssist } from "@/services/liveSearch";
import { heritageLabel } from "@/data/heritages";
import { interestLabel } from "@/data/interests";
import { getProfession } from "@/data/professions";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-5 border-t border-beige pt-4">
      <h3 className="text-xs font-bold uppercase tracking-wide text-brown-faint">{title}</h3>
      <div className="mt-2">{children}</div>
    </section>
  );
}

/** Contact details are shown as text to copy. Nothing in this panel is a link and nothing is sent. */
function ContactRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-beige bg-cream px-3.5 py-2.5">
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-wider text-brown-faint">{label}</p>
        <p className="mt-0.5 break-all text-sm text-brown select-all">{value}</p>
      </div>
      <CopyButton text={value} />
    </div>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5 text-sm text-brown">
      {items.map((t) => (
        <li key={t} className="flex gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-terracotta" aria-hidden />
          {t}
        </li>
      ))}
    </ul>
  );
}

type DraftTab = "email" | "linkedin" | "message";

function DraftPanel({ draft, onChange }: { draft: PersonDraft; onChange: (d: PersonDraft) => void }) {
  const [tab, setTab] = useState<DraftTab>("email");
  const tabs: { id: DraftTab; label: string; icon: ReactNode }[] = [
    { id: "email", label: "Email", icon: <Mail className="h-3.5 w-3.5" aria-hidden /> },
    { id: "linkedin", label: "LinkedIn note", icon: <MessageSquareText className="h-3.5 w-3.5" aria-hidden /> },
    { id: "message", label: "Direct message", icon: <MessageSquareText className="h-3.5 w-3.5" aria-hidden /> },
  ];

  return (
    <div className="mt-3">
      <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Message format">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition ${tab === t.id ? "border-terracotta bg-terracotta-soft text-terracotta-deep" : "border-beige-deep bg-cream text-brown-muted hover:text-brown"}`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {tab === "email" ? (
        <div className="mt-3 space-y-3">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Textarea id="draft-subject" label="Subject" rows={1} value={draft.subject} onChange={(e) => onChange({ ...draft, subject: e.target.value })} />
            </div>
            <CopyButton text={draft.subject} label="Copy subject" />
          </div>
          <Textarea id="draft-email" label="Message" rows={10} value={draft.email} onChange={(e) => onChange({ ...draft, email: e.target.value })} />
          <CopyButton text={draft.email} label="Copy email" />
        </div>
      ) : null}
      {tab === "linkedin" ? (
        <div className="mt-3 space-y-3">
          <Textarea id="draft-linkedin" label="Connection note (kept short for LinkedIn)" rows={4} value={draft.linkedinNote} onChange={(e) => onChange({ ...draft, linkedinNote: e.target.value })} />
          <CopyButton text={draft.linkedinNote} label="Copy note" />
        </div>
      ) : null}
      {tab === "message" ? (
        <div className="mt-3 space-y-3">
          <Textarea id="draft-dm" label="Short message for any platform" rows={5} value={draft.directMessage} onChange={(e) => onChange({ ...draft, directMessage: e.target.value })} />
          <CopyButton text={draft.directMessage} label="Copy message" />
        </div>
      ) : null}
    </div>
  );
}

export function PersonProfileModal({ person: p, open, onClose }: { person: Mentor | null; open: boolean; onClose: () => void }) {
  const { user } = useAppState();
  const [info, setInfo] = useState<PersonMoreInfo | null>(null);
  const [infoSources, setInfoSources] = useState<string[]>([]);
  const [infoState, setInfoState] = useState<"idle" | "loading" | "error">("idle");
  const [infoError, setInfoError] = useState("");
  const [draft, setDraft] = useState<PersonDraft | null>(null);
  const [draftState, setDraftState] = useState<"idle" | "loading" | "error">("idle");
  const [draftError, setDraftError] = useState("");

  if (!p) return null;
  const person = p;

  const personRef = {
    name: person.name,
    title: person.title,
    organization: person.company,
    fieldFit: person.fieldFit ?? person.bio,
    mentoringEvidence: person.openTo,
    evidenceUrl: person.evidenceUrl ?? "",
  };

  async function askMore() {
    setInfoState("loading");
    setInfoError("");
    const res = await fetchPersonAssist({ action: "more-info", person: personRef });
    if (res.info) {
      setInfo(res.info);
      setInfoSources((res.sources ?? []).map((s) => s.title).filter(Boolean).slice(0, 5));
      setInfoState("idle");
    } else {
      setInfoError(res.configured === false ? "Search isn't connected on this site yet." : (res.error ?? "Couldn't find more public information."));
      setInfoState("error");
    }
  }

  async function writeDraft() {
    setDraftState("loading");
    setDraftError("");
    const res = await fetchPersonAssist({
      action: "draft",
      person: personRef,
      sender: {
        name: user.name,
        heritages: user.heritages.map(heritageLabel),
        professionLabel: user.profession ? (getProfession(user.profession)?.label ?? "") : "",
        interests: user.interests.map(interestLabel),
        city: user.location.city,
        state: user.location.state ?? "",
      },
    });
    if (res.draft) {
      setDraft(res.draft);
      setDraftState("idle");
    } else {
      setDraftError(res.configured === false ? "Search isn't connected on this site yet." : (res.error ?? "Couldn't write a draft right now."));
      setDraftState("error");
    }
  }

  const c = person.contacts ?? {};
  const contactRows: [string, string][] = [];
  if (c.email) contactRows.push(["Email", c.email]);
  if (c.linkedin) contactRows.push(["LinkedIn", c.linkedin]);
  if (c.website) contactRows.push(["Website", c.website]);
  for (const s of c.social ?? []) contactRows.push(["Profile", s]);
  const place = [person.city, person.state].filter(Boolean).join(", ");
  const sourceHost = person.evidenceUrl ? new URL(person.evidenceUrl).hostname.replace(/^www\./, "") : "";

  return (
    <Modal open={open} onClose={onClose} size="lg" title={person.name} description={`${person.title} at ${person.company}`}>
      <div className="flex items-start gap-3">
        <Avatar initials={person.initials} tone={person.avatarTone} size="lg" />
        <div className="flex flex-wrap items-center gap-2">
          {person.culturalFit ? <Badge tone="profession">{person.culturalFit}</Badge> : null}
          {place ? <span className="text-sm text-brown-muted">{place}</span> : null}
        </div>
      </div>

      <Section title="Why they fit your interests">
        <p className="text-sm leading-relaxed text-brown">{person.fieldFit ?? person.bio}</p>
      </Section>

      <Section title="Open to questions">
        <p className="rounded-2xl bg-terracotta-soft px-4 py-3 text-sm italic text-terracotta-deep">“{person.openTo}”</p>
        {person.sourceTitle ? (
          <p className="mt-2 text-xs text-brown-faint">
            From: {person.sourceTitle}
            {sourceHost ? ` (${sourceHost})` : ""}
          </p>
        ) : null}
      </Section>

      <Section title="Ways to reach them">
        {contactRows.length ? (
          <div className="space-y-2">
            {contactRows.map(([label, value]) => (
              <ContactRow key={`${label}-${value}`} label={label} value={value} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-brown-muted">
            Their page doesn&apos;t print an email or profile address. To reach them, look up {person.name} on {sourceHost || "the site that lists them"} or through {person.company}.
          </p>
        )}
        <p className="mt-2 text-xs text-brown-faint">Shown only when printed on the page that describes them. Copy and use in your own email or app.</p>
      </Section>

      <Section title="More about them">
        {info ? (
          <div className="space-y-4 text-sm">
            <p className="leading-relaxed text-brown">{info.summary}</p>
            {info.careerHighlights.length ? (
              <div>
                <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-brown-faint">Career</p>
                <List items={info.careerHighlights} />
              </div>
            ) : null}
            {info.mentoringTopics.length ? (
              <div>
                <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-brown-faint">Can help with</p>
                <List items={info.mentoringTopics} />
              </div>
            ) : null}
            {info.publicWork.length ? (
              <div>
                <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-brown-faint">Public work</p>
                <List items={info.publicWork.map((w) => (w.where ? `${w.title} (${w.where})` : w.title))} />
              </div>
            ) : null}
            {info.contactGuidance ? (
              <div>
                <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-brown-faint">How they invite contact</p>
                <p className="text-brown">{info.contactGuidance}</p>
              </div>
            ) : null}
            {infoSources.length ? <p className="text-xs text-brown-faint">Sources: {infoSources.join(", ")}</p> : null}
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" size="sm" onClick={askMore} loading={infoState === "loading"} icon={<Sparkles className="h-3.5 w-3.5" aria-hidden />}>
              {infoState === "loading" ? "Looking them up…" : "Ask for more info"}
            </Button>
            {infoState === "error" ? <span className="text-sm text-brown-muted">{infoError}</span> : <span className="text-xs text-brown-muted">Searches public professional pages for their background and work.</span>}
          </div>
        )}
      </Section>

      <Section title="A message you could send">
        {draft ? (
          <>
            <DraftPanel draft={draft} onChange={setDraft} />
            <div className="mt-3 flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={writeDraft} loading={draftState === "loading"}>
                Write a different draft
              </Button>
              <span className="text-xs text-brown-faint">Written with AI from your profile. Edit it, fill in the [brackets], then send it yourself.</span>
            </div>
          </>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="profession" size="sm" onClick={writeDraft} disabled={draftState === "loading"} icon={draftState === "loading" ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> : <Mail className="h-3.5 w-3.5" aria-hidden />}>
              {draftState === "loading" ? "Writing…" : "Write a message for me"}
            </Button>
            {draftState === "error" ? <span className="text-sm text-brown-muted">{draftError}</span> : <span className="text-xs text-brown-muted">Drafts an email, a LinkedIn note, and a short direct message using your profile.</span>}
          </div>
        )}
      </Section>
    </Modal>
  );
}
