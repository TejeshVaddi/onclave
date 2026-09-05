import type { User } from "@/types";

/**
 * Demo profile loaded when no saved profile exists. Judges can open the app
 * and immediately see a personalized experience without signing in.
 */
export const DEMO_USER: User = {
  id: "u-demo-alex",
  name: "Alex Okafor",
  initials: "AO",
  avatarTone: "green",
  heritages: ["nigerian"],
  location: {
    city: "Fairfax",
    state: "VA",
    country: "United States",
    lat: 38.8462,
    lng: -77.3064,
  },
  interests: ["food", "music", "festivals", "community", "stem"],
  profession: "software-engineering",
  wantsMentorship: true,
  bio: "High school senior in Fairfax County. Second-generation Nigerian-American figuring out how to stay close to my roots while building a career in tech.",
  onboardingComplete: true,
  updatedAt: "2026-09-01T12:00:00.000Z",
};
