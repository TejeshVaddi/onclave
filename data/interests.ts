import type { Interest } from "@/types";

export const INTERESTS: Interest[] = [
  { id: "food", label: "Food", pillar: "culture", keywords: ["food", "eat", "eating", "cook", "cooking", "cuisine", "restaurant", "restaurants", "recipe", "recipes", "dinner", "lunch", "snack", "grocery", "groceries", "ingredients", "market"] },
  { id: "language", label: "Language", pillar: "culture", keywords: ["language", "languages", "speak", "learn to speak", "fluent", "translation"] },
  { id: "history", label: "History", pillar: "culture", keywords: ["history", "historical", "heritage site", "museum", "museums", "roots"] },
  { id: "religion", label: "Religion", pillar: "culture", keywords: ["religion", "religious", "faith", "temple", "mosque", "church", "gurdwara", "prayer", "worship", "spiritual"] },
  { id: "music", label: "Music", pillar: "culture", keywords: ["music", "concert", "concerts", "afrobeats", "bollywood", "dance", "dancing", "performance", "band"] },
  { id: "festivals", label: "Festivals", pillar: "culture", keywords: ["festival", "festivals", "celebration", "celebrate", "holiday", "diwali", "eid", "lunar new year", "tet", "independence day", "carnival", "parade"] },
  { id: "arts", label: "Arts", pillar: "culture", keywords: ["art", "arts", "film", "theatre", "theater", "poetry", "literature", "craft", "crafts", "design", "fashion"] },
  { id: "family", label: "Family & Traditions", pillar: "culture", keywords: ["family", "traditions", "tradition", "parents", "grandparents", "elders", "kids"] },
  { id: "community", label: "Community", pillar: "community", keywords: ["community", "communities", "people", "friends", "meet", "meetup", "group", "groups", "belong", "network", "social"] },
  { id: "students", label: "Student Life", pillar: "community", keywords: ["student", "students", "college", "university", "campus", "school", "high school"] },
  { id: "volunteering", label: "Volunteering", pillar: "community", keywords: ["volunteer", "volunteering", "service", "nonprofit", "give back"] },
  { id: "sports", label: "Sports", pillar: "community", keywords: ["sports", "soccer", "cricket", "football", "basketball", "badminton", "run", "running"] },
  { id: "stem", label: "STEM", pillar: "profession", keywords: ["stem", "science", "engineering", "engineer", "tech", "technology", "coding", "programming", "software", "math", "robotics"] },
  { id: "medicine", label: "Medicine", pillar: "profession", keywords: ["medicine", "medical", "doctor", "doctors", "physician", "nurse", "nursing", "pre-med", "premed", "health", "healthcare", "dentist", "pharmacy"] },
  { id: "business", label: "Business", pillar: "profession", keywords: ["business", "entrepreneur", "entrepreneurship", "startup", "startups", "finance", "marketing", "consulting", "mba"] },
  { id: "law", label: "Law", pillar: "profession", keywords: ["law", "lawyer", "legal", "attorney", "policy", "government", "immigration law"] },
  { id: "education", label: "Education", pillar: "profession", keywords: ["education", "teaching", "teacher", "professor", "academia", "research"] },
  { id: "creative-careers", label: "Creative Careers", pillar: "profession", keywords: ["creative", "designer", "filmmaker", "writer", "journalism", "media", "content"] },
];

const byId = new Map(INTERESTS.map((i) => [i.id, i]));

export function getInterest(id: string): Interest | undefined {
  return byId.get(id);
}

export function interestLabel(id: string): string {
  return byId.get(id)?.label ?? id;
}
