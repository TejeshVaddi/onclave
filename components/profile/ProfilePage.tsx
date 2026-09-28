"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarCheck, ChefHat, ListChecks, Pencil, RotateCcw, Sparkles, Users } from "lucide-react";
import { useAppState } from "@/components/providers/AppStateProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { EditProfileModal } from "./EditProfileModal";
import { Avatar } from "@/components/ui/Avatar";
import { Badge, Tag } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { CommunityCard } from "@/components/cards/CommunityCard";
import { RecipeCard } from "@/components/cards/RecipeCard";
import { EventCard } from "@/components/cards/EventCard";
import { EventDetailModal } from "@/components/culture/EventDetailModal";
import { staticData } from "@/services/dataSource";
import { heritageList } from "@/data/heritages";
import { interestLabel } from "@/data/interests";
import { professionLabel } from "@/data/professions";
import { formatLocation } from "@/services/geocodeService";
import type { CulturalEvent } from "@/types";

export function ProfilePage() {
  const { user, updateUser, savedCommunityIds, savedRecipeIds, savedEventIds, toggleSavedCommunity, toggleSavedRecipe, toggleSavedEvent, resetDemo } = useAppState();
  const { toast } = useToast();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [activeEvent, setActiveEvent] = useState<CulturalEvent | null>(null);

  function retakeOnboarding() {
    // A full wipe, not just a field update — retaking the quiz means someone
    // else (or a genuinely fresh start) is using the app now, so the old
    // bio, saved communities/recipes/events, and connection requests
    // shouldn't bleed into the new profile.
    resetDemo();
    router.push("/onboarding");
  }

  const savedCommunities = useMemo(() => staticData.communities.filter((c) => savedCommunityIds.includes(c.id)), [savedCommunityIds]);
  const savedRecipes = useMemo(() => staticData.recipes.filter((r) => savedRecipeIds.includes(r.id)), [savedRecipeIds]);
  const savedEvents = useMemo(() => staticData.events.filter((e) => savedEventIds.includes(e.id)), [savedEventIds]);

  return (
    <div className="animate-fade-up">
      <Card className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-berry via-terracotta to-green opacity-90" aria-hidden />
        <div className="relative flex flex-col items-start gap-5 pt-10 sm:flex-row sm:items-end">
          <Avatar initials={user.initials} tone={user.avatarTone} size="xl" className="ring-4 ring-cream" />
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-semibold tracking-tight text-brown">{user.name}</h1>
            <p className="text-sm text-brown-muted">{formatLocation(user.location)}</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setEditing(true)} icon={<Pencil className="h-4 w-4" aria-hidden />}>
            Edit profile
          </Button>
        </div>

        {user.bio ? <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-brown">{user.bio}</p> : null}

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatBlock label="Heritage" value={user.heritages.length ? heritageList(user.heritages) : "Not set"} />
          <StatBlock label="Profession" value={professionLabel(user.profession)} />
          <StatBlock label="Interests" value={user.interests.length ? String(user.interests.length) : "0"} suffix={user.interests.length === 1 ? "topic" : "topics"} />
          <StatBlock label="Mentorship" value={user.wantsMentorship ? "Wanted" : "Not now"} />
        </div>
      </Card>

      <section className="mt-8">
        <SectionHeader eyebrow="Culture" title="My Cultural Interests" pillar="culture" />
        <div className="mt-3 flex flex-wrap gap-2">
          {user.interests.filter((i) => ["food", "language", "history", "religion", "music", "festivals", "arts", "family"].includes(i)).map((i) => (
            <Badge key={i} tone="culture">
              {interestLabel(i)}
            </Badge>
          ))}
          {user.heritages.map((h) => (
            <Tag key={h}>{heritageList([h])}</Tag>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <SectionHeader eyebrow="Profession" title="My Professional Interests" pillar="profession" />
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge tone="profession">{professionLabel(user.profession)}</Badge>
          {user.interests.filter((i) => ["stem", "medicine", "business", "law", "education", "creative-careers"].includes(i)).map((i) => (
            <Tag key={i}>{interestLabel(i)}</Tag>
          ))}
          {user.wantsMentorship ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-terracotta">
              <Sparkles className="h-3.5 w-3.5" aria-hidden /> Open to mentorship
            </span>
          ) : null}
        </div>
      </section>

      <section className="mt-10">
        <SectionHeader eyebrow="Saved" title="My Communities" pillar="community" action={<Badge tone="community" icon={<Users className="h-3 w-3" aria-hidden />}>{savedCommunities.length}</Badge>} />
        <div className="mt-3">
          {savedCommunities.length ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {savedCommunities.map((c) => (
                <CommunityCard key={c.id} community={c} saved onToggleSave={toggleSavedCommunity} compact />
              ))}
            </div>
          ) : (
            <EmptyState icon={<Users className="h-6 w-6" aria-hidden />} title="No saved communities yet" description="Browse Community and tap the bookmark icon to save one here." action={<Button variant="community" size="sm" href="/community">Find communities</Button>} />
          )}
        </div>
      </section>

      <section className="mt-10">
        <SectionHeader eyebrow="Saved" title="Saved Recipes" pillar="culture" action={<Badge tone="culture" icon={<ChefHat className="h-3 w-3" aria-hidden />}>{savedRecipes.length}</Badge>} />
        <div className="mt-3">
          {savedRecipes.length ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {savedRecipes.map((r) => (
                <RecipeCard key={r.id} recipe={r} saved onToggleSave={toggleSavedRecipe} />
              ))}
            </div>
          ) : (
            <EmptyState icon={<ChefHat className="h-6 w-6" aria-hidden />} title="No saved recipes yet" description="Browse Culture and tap the heart icon to save a recipe." action={<Button variant="culture" size="sm" href="/culture?tab=recipes">Find recipes</Button>} />
          )}
        </div>
      </section>

      <section className="mt-10">
        <SectionHeader eyebrow="Saved" title="Saved Events" pillar="culture" action={<Badge tone="culture" icon={<CalendarCheck className="h-3 w-3" aria-hidden />}>{savedEvents.length}</Badge>} />
        <div className="mt-3">
          {savedEvents.length ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {savedEvents.map((e) => (
                <EventCard key={e.id} event={e} saved onToggleSave={toggleSavedEvent} onLearnMore={setActiveEvent} />
              ))}
            </div>
          ) : (
            <EmptyState icon={<CalendarCheck className="h-6 w-6" aria-hidden />} title="No saved events yet" description="Browse Culture events and tap the bookmark icon to save one." action={<Button variant="culture" size="sm" href="/culture?tab=events">Find events</Button>} />
          )}
        </div>
      </section>

      <section className="mt-12 space-y-3">
        <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-dashed border-beige-deep p-4 sm:flex-row sm:items-center">
          <div>
            <p className="flex items-center gap-1.5 text-sm font-semibold text-brown">
              <ListChecks className="h-4 w-4" aria-hidden /> Retake the setup quiz
            </p>
            <p className="mt-0.5 text-xs text-brown-muted">Go through name, heritage, location, interests, profession, and mentorship again from scratch.</p>
          </div>
          <Button variant="outline" size="sm" icon={<ListChecks className="h-4 w-4" aria-hidden />} onClick={retakeOnboarding}>
            Retake onboarding quiz
          </Button>
        </div>

        <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-dashed border-beige-deep p-4 sm:flex-row sm:items-center">
          <div>
            <p className="flex items-center gap-1.5 text-sm font-semibold text-brown">
              <RotateCcw className="h-4 w-4" aria-hidden /> Start over
            </p>
            <p className="mt-0.5 text-xs text-brown-muted">Erase your profile, saved items, and connection requests, and go through onboarding again.</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            icon={<RotateCcw className="h-4 w-4" aria-hidden />}
            onClick={() => {
              resetDemo();
              toast({ title: "Profile cleared", description: "Your profile and saved items were cleared." });
            }}
          >
            Clear my profile
          </Button>
        </div>
      </section>

      <EditProfileModal user={user} open={editing} onClose={() => setEditing(false)} onSave={updateUser} />
      <EventDetailModal event={activeEvent} open={!!activeEvent} onClose={() => setActiveEvent(null)} saved={activeEvent ? savedEventIds.includes(activeEvent.id) : false} onToggleSave={toggleSavedEvent} />
    </div>
  );
}

function StatBlock({ label, value, suffix }: { label: string; value: string; suffix?: string }) {
  return (
    <div className="rounded-xl bg-beige-soft/70 px-3 py-2.5">
      <p className="text-[11px] font-bold uppercase tracking-wider text-brown-faint">{label}</p>
      <p className="mt-0.5 truncate text-sm font-semibold text-brown">
        {value} {suffix ? <span className="font-normal text-brown-muted">{suffix}</span> : null}
      </p>
    </div>
  );
}
