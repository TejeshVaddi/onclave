import type { Heritage } from "@/types";

/**
 * Heritage catalogue. Keywords feed the natural-language discovery parser.
 * Labels are intentionally neutral; users describe themselves in their own words.
 */
export const HERITAGES: Heritage[] = [
  { id: "indian", label: "Indian", origin: "India", region: "South Asia", cuisine: "Indian", keywords: ["indian", "india", "desi", "south asian", "tamil", "telugu", "punjabi", "gujarati", "bengali", "malayali", "marathi", "kannada"] },
  { id: "nigerian", label: "Nigerian", origin: "Nigeria", region: "West Africa", cuisine: "Nigerian", keywords: ["nigerian", "nigeria", "naija", "igbo", "yoruba", "hausa", "west african"] },
  { id: "mexican", label: "Mexican", origin: "Mexico", region: "Latin America", cuisine: "Mexican", keywords: ["mexican", "mexico", "chicano", "chicana", "latino", "latina", "latinx", "hispanic"] },
  { id: "vietnamese", label: "Vietnamese", origin: "Vietnam", region: "Southeast Asia", cuisine: "Vietnamese", keywords: ["vietnamese", "vietnam", "viet", "viet kieu"] },
  { id: "ethiopian", label: "Ethiopian", origin: "Ethiopia", region: "East Africa", cuisine: "Ethiopian", keywords: ["ethiopian", "ethiopia", "habesha", "amhara", "oromo", "tigray", "east african"] },
  { id: "pakistani", label: "Pakistani", origin: "Pakistan", region: "South Asia", cuisine: "Pakistani", keywords: ["pakistani", "pakistan", "urdu", "sindhi", "pashtun", "punjabi"] },
  { id: "filipino", label: "Filipino", origin: "the Philippines", region: "Southeast Asia", cuisine: "Filipino", keywords: ["filipino", "filipina", "philippines", "pinoy", "pinay", "tagalog"] },
  { id: "chinese", label: "Chinese", origin: "China", region: "East Asia", cuisine: "Chinese", keywords: ["chinese", "china", "cantonese", "mandarin", "taiwanese", "hokkien", "east asian"] },
  { id: "colombian", label: "Colombian", origin: "Colombia", region: "Latin America", cuisine: "Colombian", keywords: ["colombian", "colombia", "paisa", "costeño"] },
  { id: "korean", label: "Korean", origin: "Korea", region: "East Asia", cuisine: "Korean", keywords: ["korean", "korea"] },
  { id: "ghanaian", label: "Ghanaian", origin: "Ghana", region: "West Africa", cuisine: "Ghanaian", keywords: ["ghanaian", "ghana", "akan", "ewe"] },
  { id: "salvadoran", label: "Salvadoran", origin: "El Salvador", region: "Latin America", cuisine: "Salvadoran", keywords: ["salvadoran", "el salvador", "salvadoreño"] },
  { id: "bangladeshi", label: "Bangladeshi", origin: "Bangladesh", region: "South Asia", cuisine: "Bangladeshi", keywords: ["bangladeshi", "bangladesh", "bengali"] },
  { id: "iranian", label: "Iranian", origin: "Iran", region: "Middle East", cuisine: "Persian", keywords: ["iranian", "iran", "persian", "farsi"] },
  { id: "jamaican", label: "Jamaican", origin: "Jamaica", region: "Caribbean", cuisine: "Jamaican", keywords: ["jamaican", "jamaica", "caribbean", "west indian"] },
  { id: "egyptian", label: "Egyptian", origin: "Egypt", region: "North Africa", cuisine: "Egyptian", keywords: ["egyptian", "egypt", "arab"] },
  { id: "lebanese", label: "Lebanese", origin: "Lebanon", region: "Middle East", cuisine: "Lebanese", keywords: ["lebanese", "lebanon", "levantine", "arab"] },
  { id: "peruvian", label: "Peruvian", origin: "Peru", region: "Latin America", cuisine: "Peruvian", keywords: ["peruvian", "peru"] },
  { id: "turkish", label: "Turkish", origin: "Türkiye", region: "Middle East", cuisine: "Turkish", keywords: ["turkish", "turkey", "türkiye"] },
  { id: "sri-lankan", label: "Sri Lankan", origin: "Sri Lanka", region: "South Asia", cuisine: "Sri Lankan", keywords: ["sri lankan", "sri lanka", "sinhala", "tamil"] },
];

const byId = new Map(HERITAGES.map((h) => [h.id, h]));

export function getHeritage(id: string): Heritage | undefined {
  return byId.get(id);
}

export function heritageLabel(id: string): string {
  return byId.get(id)?.label ?? id;
}

/** "Nigerian" | "Nigerian and Indian" | "Nigerian, Indian, and Mexican" */
export function heritageList(ids: string[]): string {
  const labels = ids.map(heritageLabel);
  if (labels.length <= 1) return labels[0] ?? "";
  if (labels.length === 2) return `${labels[0]} and ${labels[1]}`;
  return `${labels.slice(0, -1).join(", ")}, and ${labels[labels.length - 1]}`;
}
