import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Briefcase, Globe2, GraduationCap, MapPin } from "lucide-react";
import { MENTORS } from "@/data/mentors";
import { getMentor } from "@/services/mentorService";
import { MentorProfileActions } from "@/components/profession/MentorProfileActions";
import { Avatar } from "@/components/ui/Avatar";
import { Badge, Tag } from "@/components/ui/Badge";
import { availabilityLabel } from "@/services/mentorService";

export function generateStaticParams() {
  return MENTORS.map((m) => ({ id: m.id }));
}

export async function generateMetadata({ params }: PageProps<"/profession/[id]">): Promise<Metadata> {
  const { id } = await params;
  const mentor = await getMentor(id);
  return { title: mentor ? mentor.name : "Mentor" };
}

export default async function MentorDetailPage({ params }: PageProps<"/profession/[id]">) {
  const { id } = await params;
  const mentor = await getMentor(id);
  if (!mentor) notFound();

  return (
    <div className="mx-auto max-w-2xl animate-fade-up">
      <Link href="/profession" className="inline-flex items-center gap-1.5 text-sm font-medium text-brown-muted hover:text-brown">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to mentors
      </Link>

      <div className="mt-4 rounded-3xl border border-beige bg-white/50 p-6 shadow-soft md:p-8">
        <div className="flex items-start gap-4">
          <Avatar initials={mentor.initials} tone={mentor.avatarTone} size="xl" />
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-semibold tracking-tight text-brown">{mentor.name}</h1>
            <p className="mt-0.5 text-[15px] text-brown-muted">
              {mentor.title} at <span className="font-medium text-brown">{mentor.company}</span>
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-brown-muted">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-terracotta" aria-hidden /> {mentor.city}, {mentor.state}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Briefcase className="h-4 w-4 text-terracotta" aria-hidden /> {mentor.yearsExperience} years experience
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          <Badge tone="profession">{mentor.heritageLabel}</Badge>
          <Badge tone={mentor.availability === "open" ? "success" : "neutral"}>{availabilityLabel(mentor.availability)}</Badge>
        </div>

        <p className="mt-5 text-[15px] leading-relaxed text-brown">{mentor.bio}</p>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wide text-brown-faint">Can mentor in</h2>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {mentor.mentorsIn.map((s) => (
                <Tag key={s}>{s}</Tag>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wide text-brown-faint">Personal interests</h2>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {mentor.interests.map((s) => (
                <Tag key={s}>{s}</Tag>
              ))}
            </div>
          </div>
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-beige pt-5 text-sm sm:grid-cols-3">
          {mentor.education ? (
            <div>
              <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-brown-faint">
                <GraduationCap className="h-3.5 w-3.5" aria-hidden /> Education
              </dt>
              <dd className="mt-1 text-brown">{mentor.education}</dd>
            </div>
          ) : null}
          <div>
            <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-brown-faint">
              <Globe2 className="h-3.5 w-3.5" aria-hidden /> Languages
            </dt>
            <dd className="mt-1 text-brown">{mentor.languages.join(", ")}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-brown-faint">Industry</dt>
            <dd className="mt-1 text-brown">{mentor.industry}</dd>
          </div>
        </dl>

        <p className="mt-6 rounded-2xl bg-terracotta-soft px-4 py-3 text-sm italic text-terracotta-deep">“{mentor.openTo}”</p>

        <MentorProfileActions mentor={mentor} />
      </div>
    </div>
  );
}
