import type { Community, HeritageId } from "@/types";

/**
 * Large public Reddit communities, so every heritage always has real
 * communities to join. Each subreddit below was confirmed to exist against
 * the Internet Archive's index of pages that were really served (Reddit
 * itself shows an identical empty page for real and made-up subreddits, so
 * fetching it proves nothing). Checked 2026-10-14.
 */
interface Sub {
  name: string;
  /** What the community is about. */
  about: string;
  kind: "country" | "food" | "diaspora" | "city" | "region";
  heritages: HeritageId[];
}

const SUBS: Sub[] = [
  { name: "ABCDesis", about: "the South Asian diaspora", kind: "diaspora", heritages: ["indian", "pakistani", "bangladeshi", "sri-lankan"] },
  { name: "india", about: "India", kind: "country", heritages: ["indian"] },
  { name: "IndianFood", about: "Indian food", kind: "food", heritages: ["indian"] },
  { name: "indiansinamerica", about: "Indians living in America", kind: "diaspora", heritages: ["indian"] },
  { name: "Nigeria", about: "Nigeria", kind: "country", heritages: ["nigerian"] },
  { name: "Naija", about: "Nigerian life and culture", kind: "country", heritages: ["nigerian"] },
  { name: "NigerianFood", about: "Nigerian food", kind: "food", heritages: ["nigerian"] },
  { name: "africa", about: "the African continent", kind: "region", heritages: ["nigerian", "ghanaian", "ethiopian"] },
  { name: "mexico", about: "Mexico", kind: "country", heritages: ["mexican"] },
  { name: "Chicano", about: "Chicano culture", kind: "diaspora", heritages: ["mexican"] },
  { name: "MexicanFood", about: "Mexican food", kind: "food", heritages: ["mexican"] },
  { name: "latinos", about: "Latino communities", kind: "diaspora", heritages: ["mexican", "colombian", "salvadoran", "peruvian"] },
  { name: "VietNam", about: "Vietnam", kind: "country", heritages: ["vietnamese"] },
  { name: "VietnameseFood", about: "Vietnamese food", kind: "food", heritages: ["vietnamese"] },
  { name: "asianamerican", about: "Asian American life and culture", kind: "diaspora", heritages: ["vietnamese", "filipino", "chinese", "korean"] },
  { name: "Ethiopia", about: "Ethiopia", kind: "country", heritages: ["ethiopian"] },
  { name: "EthiopianFood", about: "Ethiopian food", kind: "food", heritages: ["ethiopian"] },
  { name: "Habesha", about: "Habesha culture", kind: "diaspora", heritages: ["ethiopian"] },
  { name: "pakistan", about: "Pakistan", kind: "country", heritages: ["pakistani"] },
  { name: "PakistaniFood", about: "Pakistani food", kind: "food", heritages: ["pakistani"] },
  { name: "Philippines", about: "the Philippines", kind: "country", heritages: ["filipino"] },
  { name: "Filipino", about: "Filipino culture", kind: "diaspora", heritages: ["filipino"] },
  { name: "filipinofood", about: "Filipino food", kind: "food", heritages: ["filipino"] },
  { name: "China", about: "China", kind: "country", heritages: ["chinese"] },
  { name: "chinalife", about: "life in China", kind: "country", heritages: ["chinese"] },
  { name: "ChineseFood", about: "Chinese food", kind: "food", heritages: ["chinese"] },
  { name: "Colombia", about: "Colombia", kind: "country", heritages: ["colombian"] },
  { name: "Bogota", about: "Bogotá", kind: "city", heritages: ["colombian"] },
  { name: "medellin", about: "Medellín", kind: "city", heritages: ["colombian"] },
  { name: "korea", about: "Korea", kind: "country", heritages: ["korean"] },
  { name: "Korean", about: "the Korean language and culture", kind: "diaspora", heritages: ["korean"] },
  { name: "KoreanFood", about: "Korean food", kind: "food", heritages: ["korean"] },
  { name: "Ghana", about: "Ghana", kind: "country", heritages: ["ghanaian"] },
  { name: "AfricanFood", about: "African food", kind: "food", heritages: ["ghanaian", "nigerian", "ethiopian"] },
  { name: "ElSalvador", about: "El Salvador", kind: "country", heritages: ["salvadoran"] },
  { name: "centralamerica", about: "Central America", kind: "region", heritages: ["salvadoran"] },
  { name: "bangladesh", about: "Bangladesh", kind: "country", heritages: ["bangladeshi"] },
  { name: "BangladeshiFood", about: "Bangladeshi food", kind: "food", heritages: ["bangladeshi"] },
  { name: "bengali", about: "Bengali culture", kind: "diaspora", heritages: ["bangladeshi"] },
  { name: "iran", about: "Iran", kind: "country", heritages: ["iranian"] },
  { name: "PersianFood", about: "Persian food", kind: "food", heritages: ["iranian"] },
  { name: "NewIran", about: "Iran and the Iranian diaspora", kind: "diaspora", heritages: ["iranian"] },
  { name: "MiddleEast", about: "the Middle East", kind: "region", heritages: ["iranian", "egyptian", "lebanese"] },
  { name: "Jamaica", about: "Jamaica", kind: "country", heritages: ["jamaican"] },
  { name: "JamaicanFood", about: "Jamaican food", kind: "food", heritages: ["jamaican"] },
  { name: "caribbean", about: "the Caribbean", kind: "region", heritages: ["jamaican"] },
  { name: "Egypt", about: "Egypt", kind: "country", heritages: ["egyptian"] },
  { name: "EgyptianFood", about: "Egyptian food", kind: "food", heritages: ["egyptian"] },
  { name: "arabs", about: "Arab culture", kind: "diaspora", heritages: ["egyptian", "lebanese"] },
  { name: "lebanon", about: "Lebanon", kind: "country", heritages: ["lebanese"] },
  { name: "LebaneseFood", about: "Lebanese food", kind: "food", heritages: ["lebanese"] },
  { name: "PERU", about: "Peru", kind: "country", heritages: ["peruvian"] },
  { name: "PeruvianFood", about: "Peruvian food", kind: "food", heritages: ["peruvian"] },
  { name: "Turkey", about: "Türkiye", kind: "country", heritages: ["turkish"] },
  { name: "turkish", about: "the Turkish language and culture", kind: "diaspora", heritages: ["turkish"] },
  { name: "TurkishFood", about: "Turkish food", kind: "food", heritages: ["turkish"] },
  { name: "srilanka", about: "Sri Lanka", kind: "country", heritages: ["sri-lankan"] },
  { name: "SriLankanFood", about: "Sri Lankan food", kind: "food", heritages: ["sri-lankan"] },
];

const describe = (s: Sub): string => {
  switch (s.kind) {
    case "food":
      return `Reddit community about ${s.about}: recipes, cooking questions, and places to eat.`;
    case "diaspora":
      return `Reddit community about ${s.about}, for people at home and abroad.`;
    case "city":
    case "country":
    case "region":
      return `Reddit community about ${s.about}.`;
  }
};

export const ONLINE_COMMUNITIES: Community[] = SUBS.map((s) => ({
  id: `oc-reddit-${s.name.toLowerCase()}`,
  name: `r/${s.name}`,
  platform: "reddit",
  description: describe(s),
  locationLabel: "Online",
  isOnline: true,
  heritages: s.heritages,
  type: s.kind === "diaspora" ? "cultural" : "social",
  tags: [s.kind === "food" ? "Food" : s.kind === "diaspora" ? "Diaspora" : "Discussion"],
  externalUrl: `https://www.reddit.com/r/${s.name}/`,
}));
