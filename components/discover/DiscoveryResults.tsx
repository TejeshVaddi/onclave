"use client";

import { useState } from "react";
import { Briefcase, CalendarDays, ChefHat, Info, Landmark, MapPin, Users } from "lucide-react";
import type { DiscoveryResult } from "@/types";
import { useAppState } from "@/components/providers/AppStateProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { CommunityCard } from "@/components/cards/CommunityCard";
import { RecipeCard } from "@/components/cards/RecipeCard";
import { PlaceCard } from "@/components/cards/PlaceCard";
import { EventCard } from "@/components/cards/EventCard";
import { MentorCard } from "@/components/cards/MentorCard";
import { EventDetailModal } from "@/components/culture/EventDetailModal";
import { ConnectionRequestModal } from "@/components/profession/ConnectionRequestModal";
import { EmptyState } from "@/components/ui/EmptyState";
import type { CulturalEvent, Mentor } from "@/types";

function ResultGroup({ icon: Icon, title, count, pillar, children }: { icon: typeof Users; title: string; count: number; pillar: "community" | "culture" | "profession"; children: React.ReactNode }) {
  if (!count) return null;
  const color = pillar === "community" ? "text-green" : pillar === "culture" ? "text-berry" : "text-terracotta";
  return (
    <div className="mt-8 first:mt-0">
      <h3 className={`flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] ${color}`}>
        <Icon className="h-4 w-4" aria-hidden />
        {title}
        <span className="font-normal text-brown-faint normal-case tracking-normal">({count})</span>
      </h3>
      <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{children}</div>
    </div>
  );
}

export function DiscoveryResults({ result }: { result: DiscoveryResult }) {
  const { savedCommunityIds, savedRecipeIds, savedEventIds, toggleSavedCommunity, toggleSavedRecipe, toggleSavedEvent, hasRequested, requestConnection } = useAppState();
  const { toast } = useToast();
  const [activeEvent, setActiveEvent] = useState<CulturalEvent | null>(null);
  const [activeMentor, setActiveMentor] = useState<Mentor | null>(null);

  function handleSend(mentorId: string, message: string) {
    requestConnection(mentorId, message);
    toast({ title: "Request saved", description: "Mentors here are example profiles, so nothing was sent.", pillar: "profession" });
    setActiveMentor(null);
  }

  if (result.totalResults === 0) {
    return (
      <EmptyState
        className="mt-8"
        title="No matches yet for that query"
        description="Try mentioning a heritage, an interest, or a timeframe, like “this weekend” or “Nigerian food.”"
      />
    );
  }

  return (
    <div>
      {result.notes.length > 0 ? (
        <div className="mb-6 space-y-2">
          {result.notes.map((note) => (
            <p key={note} className="flex items-start gap-2 rounded-xl bg-beige-soft/70 px-3.5 py-2.5 text-sm leading-relaxed text-brown-muted">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-terracotta" aria-hidden />
              {note}
            </p>
          ))}
        </div>
      ) : null}

      <ResultGroup icon={Users} title="Community" count={result.community.length} pillar="community">
        {result.community.map((r) => (
          <CommunityCard key={r.id} community={r.item} saved={savedCommunityIds.includes(r.item.id)} onToggleSave={toggleSavedCommunity} reasons={r.reasons} score={r.score} compact />
        ))}
      </ResultGroup>

      <ResultGroup icon={ChefHat} title="Culture · Recipes" count={result.culture.recipes.length} pillar="culture">
        {result.culture.recipes.map((r) => (
          <RecipeCard key={r.id} recipe={r.item} saved={savedRecipeIds.includes(r.item.id)} onToggleSave={toggleSavedRecipe} reasons={r.reasons} score={r.score} />
        ))}
      </ResultGroup>

      <ResultGroup icon={MapPin} title="Culture · Food Near You" count={result.culture.places.filter((p) => p.item.kind === "food").length} pillar="culture">
        {result.culture.places
          .filter((p) => p.item.kind === "food")
          .map((r) => (
            <PlaceCard key={r.id} place={r.item} reasons={r.reasons} score={r.score} />
          ))}
      </ResultGroup>

      <ResultGroup icon={Landmark} title="Culture · Places" count={result.culture.places.filter((p) => p.item.kind === "cultural").length} pillar="culture">
        {result.culture.places
          .filter((p) => p.item.kind === "cultural")
          .map((r) => (
            <PlaceCard key={r.id} place={r.item} reasons={r.reasons} score={r.score} />
          ))}
      </ResultGroup>

      <ResultGroup icon={CalendarDays} title="Culture · Events" count={result.culture.events.length} pillar="culture">
        {result.culture.events.map((r) => (
          <EventCard key={r.id} event={r.item} saved={savedEventIds.includes(r.item.id)} onToggleSave={toggleSavedEvent} onLearnMore={setActiveEvent} reasons={r.reasons} score={r.score} />
        ))}
      </ResultGroup>

      <ResultGroup icon={Briefcase} title="Profession · Mentors" count={result.profession.length} pillar="profession">
        {result.profession.map((r) => (
          <MentorCard key={r.id} mentor={r.item} requested={hasRequested(r.item.id)} onRequest={setActiveMentor} reasons={r.reasons} score={r.score} />
        ))}
      </ResultGroup>

      <EventDetailModal event={activeEvent} open={!!activeEvent} onClose={() => setActiveEvent(null)} saved={activeEvent ? savedEventIds.includes(activeEvent.id) : false} onToggleSave={toggleSavedEvent} />
      <ConnectionRequestModal mentor={activeMentor} open={!!activeMentor} onClose={() => setActiveMentor(null)} onSend={handleSend} />
    </div>
  );
}
