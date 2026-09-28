import type { User } from "@/types";

/**
 * Blank starting profile. This is a demo, not a real product, so every
 * visitor (and anyone who resets or retakes the quiz) goes through
 * onboarding themselves rather than landing on a pre-filled persona —
 * `onboardingComplete: false` sends them straight to /onboarding from the
 * home page.
 */
export const DEMO_USER: User = {
  id: "u-guest",
  name: "",
  initials: "",
  avatarTone: "green",
  heritages: [],
  location: {
    city: "",
    country: "United States",
  },
  interests: [],
  profession: null,
  wantsMentorship: false,
  onboardingComplete: false,
  updatedAt: new Date(0).toISOString(),
};
