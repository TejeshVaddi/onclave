"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, MapPin, Sparkles } from "lucide-react";
import { LogoMark } from "@/components/layout/Logo";
import { Button } from "@/components/ui/Button";
import { Chip, ChipRow } from "@/components/ui/Chip";
import { Input } from "@/components/ui/Input";
import { Segmented } from "@/components/ui/Segmented";
import { useAppState } from "@/components/providers/AppStateProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { HERITAGES } from "@/data/heritages";
import { INTERESTS } from "@/data/interests";
import { PROFESSIONS } from "@/data/professions";
import { geocode, suggestCities } from "@/services/geocodeService";
import { toggleIn } from "@/lib/hooks";
import { cn, initialsOf } from "@/lib/utils";

const STEPS = ["Name", "Heritage", "Location", "Interests", "Profession", "Mentorship"] as const;

export function OnboardingFlow() {
  const router = useRouter();
  const { user, updateUser } = useAppState();
  const { toast } = useToast();

  const [step, setStep] = useState(0);
  const [name, setName] = useState(user.name);
  const [heritages, setHeritages] = useState<string[]>(user.heritages);
  const [city, setCity] = useState(user.location.city);
  const [state, setState] = useState(user.location.state ?? "");
  const [country, setCountry] = useState(user.location.country || "United States");
  const [interests, setInterests] = useState<string[]>(user.interests);
  const [profession, setProfession] = useState<string>(user.profession ?? "");
  const [wantsMentorship, setWantsMentorship] = useState<"yes" | "no">(user.wantsMentorship ? "yes" : "no");

  const citySuggestions = useMemo(() => suggestCities(city), [city]);

  const canAdvance = [
    name.trim().length > 0,
    heritages.length > 0,
    city.trim().length > 1,
    interests.length > 0,
    profession.length > 0,
    true,
  ][step];

  function next() {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
      return;
    }
    finish();
  }

  function back() {
    if (step === 0) return;
    setStep((s) => s - 1);
  }

  function finish() {
    const location = geocode({ city, state, country });
    const finalName = name.trim() || user.name;
    updateUser({
      name: finalName,
      initials: initialsOf(finalName),
      heritages,
      location,
      interests,
      profession: profession || null,
      wantsMentorship: wantsMentorship === "yes",
      onboardingComplete: true,
    });
    toast({ title: "Profile saved", description: "Your Community, Culture, and Profession feeds are now personalized.", variant: "success" });
    router.push("/");
  }

  function skip() {
    updateUser({ onboardingComplete: true });
    router.push("/");
  }

  return (
    <div className="flex min-h-dvh flex-col bg-cream">
      <header className="flex items-center justify-between px-5 py-5 md:px-10">
        <div className="flex items-center gap-2.5">
          <LogoMark size={30} />
          <span className="text-lg font-bold tracking-tight text-brown">Onclave</span>
        </div>
        <button type="button" onClick={skip} className="text-sm font-medium text-brown-muted underline-offset-4 hover:underline">
          Skip for now
        </button>
      </header>

      <div className="mx-auto flex w-full max-w-xl flex-1 flex-col px-5 pb-10 md:px-0">
        <div className="mb-8 flex items-center gap-1.5" role="progressbar" aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={STEPS.length}>
          {STEPS.map((label, i) => (
            <div key={label} className="flex flex-1 flex-col gap-1.5">
              <div className={cn("h-1.5 rounded-full transition-colors", i <= step ? "bg-brown" : "bg-beige")} />
              <span className={cn("hidden text-[11px] font-medium sm:block", i === step ? "text-brown" : "text-brown-faint")}>{label}</span>
            </div>
          ))}
        </div>

        <div className="flex-1 animate-fade-up" key={step}>
          {step === 0 && (
            <StepShell title="What should we call you?" description="This is how you'll appear across your profile and to mentors you connect with.">
              <Input
                label="Name"
                id="onboarding-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                autoComplete="name"
                autoFocus
              />
            </StepShell>
          )}

          {step === 1 && (
            <StepShell
              title="What is your heritage?"
              description="Select all that apply. This shapes the communities, recipes, and events we surface for you."
            >
              <ChipRow>
                {HERITAGES.map((h) => (
                  <Chip key={h.id} selected={heritages.includes(h.id)} pillar="culture" onClick={() => setHeritages((prev) => toggleIn(prev, h.id))}>
                    {h.label}
                  </Chip>
                ))}
              </ChipRow>
            </StepShell>
          )}

          {step === 2 && (
            <StepShell title="Where do you live?" description="We use this to find nearby communities, restaurants, and events.">
              <div className="space-y-4">
                <div className="relative">
                  <Input
                    label="City"
                    id="onboarding-city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Your city"
                    autoComplete="off"
                  />
                  {citySuggestions.length > 0 && city.length > 1 && (
                    <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl border border-beige-deep bg-cream shadow-lift">
                      {citySuggestions.map((s) => (
                        <li key={s}>
                          <button
                            type="button"
                            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-brown hover:bg-beige-soft"
                            onClick={() => {
                              const [c, st] = s.split(", ");
                              setCity(c);
                              setState(st ?? "");
                            }}
                          >
                            <MapPin className="h-3.5 w-3.5 text-brown-faint" aria-hidden />
                            {s}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="State / Province" value={state} onChange={(e) => setState(e.target.value)} placeholder="State / Province" />
                  <Input label="Country" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Country" />
                </div>
              </div>
            </StepShell>
          )}

          {step === 3 && (
            <StepShell title="What are you interested in?" description="Pick a few. We'll use these across Community, Culture, and Profession.">
              <ChipRow>
                {INTERESTS.map((i) => (
                  <Chip key={i.id} selected={interests.includes(i.id)} pillar={i.pillar} onClick={() => setInterests((prev) => toggleIn(prev, i.id))}>
                    {i.label}
                  </Chip>
                ))}
              </ChipRow>
            </StepShell>
          )}

          {step === 4 && (
            <StepShell title="What profession or field interests you?" description="This powers your mentor recommendations and career-focused events.">
              <ChipRow>
                {PROFESSIONS.map((p) => (
                  <Chip key={p.id} selected={profession === p.id} pillar="profession" onClick={() => setProfession(p.id)}>
                    {p.label}
                  </Chip>
                ))}
              </ChipRow>
            </StepShell>
          )}

          {step === 5 && (
            <StepShell title="Would you like mentorship recommendations?" description="We'll surface mentors who share your background or field.">
              <Segmented
                label="Mentorship preference"
                value={wantsMentorship}
                onChange={setWantsMentorship}
                options={[
                  { id: "yes", label: "Yes, show me mentors" },
                  { id: "no", label: "Not right now" },
                ]}
                className="w-full [&>button]:flex-1"
              />
              <div className="mt-8 rounded-2xl border border-beige-deep bg-beige-soft/60 p-5">
                <p className="flex items-center gap-2 text-sm font-semibold text-brown">
                  <Sparkles className="h-4 w-4 text-terracotta" aria-hidden />
                  {name.trim() ? `${name.trim().split(" ")[0]}, you're almost set` : "You're almost set"}
                </p>
                <p className="mt-1 text-sm text-brown-muted">
                  We&apos;ll personalize Community, Culture, and Profession around{" "}
                  <span className="font-medium text-brown">{heritages.map((h) => HERITAGES.find((x) => x.id === h)?.label).join(", ") || "your background"}</span>
                  {city ? (
                    <>
                      {" "}
                      near <span className="font-medium text-brown">{city}</span>
                    </>
                  ) : null}
                  .
                </p>
              </div>
            </StepShell>
          )}
        </div>

        <div className="mt-8 flex items-center justify-between gap-3">
          <Button variant="ghost" onClick={back} disabled={step === 0} icon={<ArrowLeft className="h-4 w-4" aria-hidden />}>
            Back
          </Button>
          <Button
            variant="primary"
            onClick={next}
            disabled={!canAdvance}
            iconRight={step === STEPS.length - 1 ? <Check className="h-4 w-4" aria-hidden /> : <ArrowRight className="h-4 w-4" aria-hidden />}
          >
            {step === STEPS.length - 1 ? "Finish setup" : "Continue"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function StepShell({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-brown text-balance md:text-3xl">{title}</h1>
      <p className="mt-2 text-[15px] text-brown-muted">{description}</p>
      <div className="mt-6">{children}</div>
    </div>
  );
}
