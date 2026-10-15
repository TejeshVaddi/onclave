import type { CulturalEvent, EventCategory, HeritageId } from "@/types";

/**
 * Major cultural celebrations and national days, with real dates, so every
 * heritage always has real upcoming entries even where no local event
 * listing exists. Every page linked below was confirmed to exist on
 * Wikipedia, and the dates of celebrations that move each year were checked
 * against Wikipedia's own date tables (checked 2026-10-14). Fixed-date
 * celebrations roll forward to their next occurrence automatically. One-off
 * dates run through 2028; add later years from the same Wikipedia tables.
 */
type Rule = { month: number; day: number } | { date: string };

interface Celebration {
  id: string;
  name: string;
  rule: Rule;
  heritages: HeritageId[];
  category: EventCategory;
  description: string;
  url: string;
}

const CELEBRATIONS: Celebration[] = [
  { id: "republic-day-india", name: "Republic Day", rule: { month: 1, day: 26 }, heritages: ["indian"], category: "festival", description: "India marks the day its constitution took effect in 1950 with a large parade in Delhi and flag ceremonies in communities abroad.", url: "https://en.wikipedia.org/wiki/Republic_Day_(India)" },
  { id: "independence-day-india", name: "Independence Day", rule: { month: 8, day: 15 }, heritages: ["indian"], category: "festival", description: "India's national day, marking independence from British rule in 1947, celebrated with flag hoisting, parades, and community events.", url: "https://en.wikipedia.org/wiki/Independence_Day_(India)" },
  { id: "gandhi-jayanti", name: "Gandhi Jayanti", rule: { month: 10, day: 2 }, heritages: ["indian"], category: "community", description: "The birthday of Mahatma Gandhi, observed with prayers, service, and talks on nonviolence.", url: "https://en.wikipedia.org/wiki/Gandhi_Jayanti" },
  { id: "diwali-2026", name: "Diwali", rule: { date: "2026-11-08" }, heritages: ["indian", "sri-lankan"], category: "religious", description: "The festival of lights, celebrated with lamps, sweets, family gatherings, and fireworks.", url: "https://en.wikipedia.org/wiki/Diwali" },
  { id: "independence-day-pakistan", name: "Independence Day", rule: { month: 8, day: 14 }, heritages: ["pakistani"], category: "festival", description: "Pakistan's national day, marking independence in 1947.", url: "https://en.wikipedia.org/wiki/Independence_Day_(Pakistan)" },
  { id: "pakistan-day", name: "Pakistan Day", rule: { month: 3, day: 23 }, heritages: ["pakistani"], category: "festival", description: "Commemorates the 1940 Lahore Resolution, with parades and ceremonies.", url: "https://en.wikipedia.org/wiki/Pakistan_Day" },
  { id: "independence-day-bangladesh", name: "Independence Day", rule: { month: 3, day: 26 }, heritages: ["bangladeshi"], category: "festival", description: "Bangladesh's national day, marking the 1971 declaration of independence.", url: "https://en.wikipedia.org/wiki/Independence_Day_(Bangladesh)" },
  { id: "mother-language-day", name: "International Mother Language Day", rule: { month: 2, day: 21 }, heritages: ["bangladeshi"], category: "community", description: "Honors the 1952 Language Movement in Bangladesh and celebrates linguistic diversity.", url: "https://en.wikipedia.org/wiki/International_Mother_Language_Day" },
  { id: "pohela-boishakh", name: "Pohela Boishakh", rule: { month: 4, day: 14 }, heritages: ["bangladeshi"], category: "festival", description: "The Bengali New Year, celebrated with music, fairs, and traditional food.", url: "https://en.wikipedia.org/wiki/Pohela_Boishakh" },
  { id: "victory-day-bangladesh", name: "Victory Day", rule: { month: 12, day: 16 }, heritages: ["bangladeshi"], category: "community", description: "Marks Bangladesh's victory in the 1971 Liberation War.", url: "https://en.wikipedia.org/wiki/Victory_Day_(Bangladesh)" },
  { id: "independence-day-sri-lanka", name: "Independence Day", rule: { month: 2, day: 4 }, heritages: ["sri-lankan"], category: "festival", description: "Sri Lanka's national day, marking independence in 1948.", url: "https://en.wikipedia.org/wiki/Independence_Day_(Sri_Lanka)" },
  { id: "independence-day-nigeria", name: "Independence Day", rule: { month: 10, day: 1 }, heritages: ["nigerian"], category: "festival", description: "Nigeria's national day, marking independence from Britain in 1960.", url: "https://en.wikipedia.org/wiki/Independence_Day_(Nigeria)" },
  { id: "democracy-day-nigeria", name: "Democracy Day", rule: { month: 6, day: 12 }, heritages: ["nigerian"], category: "community", description: "Marks the return to democratic rule in Nigeria.", url: "https://en.wikipedia.org/wiki/Democracy_Day_(Nigeria)" },
  { id: "independence-day-ghana", name: "Independence Day", rule: { month: 3, day: 6 }, heritages: ["ghanaian"], category: "festival", description: "Ghana's national day, marking independence in 1957.", url: "https://en.wikipedia.org/wiki/Independence_Day_(Ghana)" },
  { id: "republic-day-ghana", name: "Republic Day", rule: { month: 7, day: 1 }, heritages: ["ghanaian"], category: "community", description: "Marks Ghana becoming a republic in 1960.", url: "https://en.wikipedia.org/wiki/Public_holidays_in_Ghana" },
  { id: "enkutatash", name: "Enkutatash", rule: { month: 9, day: 11 }, heritages: ["ethiopian"], category: "festival", description: "The Ethiopian New Year, celebrated with flowers, coffee, and family meals.", url: "https://en.wikipedia.org/wiki/Enkutatash" },
  { id: "meskel", name: "Meskel", rule: { month: 9, day: 27 }, heritages: ["ethiopian"], category: "religious", description: "An Ethiopian Orthodox festival of the finding of the True Cross, marked with bonfires called demera.", url: "https://en.wikipedia.org/wiki/Meskel" },
  { id: "timkat", name: "Timkat", rule: { month: 1, day: 19 }, heritages: ["ethiopian"], category: "religious", description: "The Ethiopian Orthodox celebration of Epiphany, with processions and blessing of water.", url: "https://en.wikipedia.org/wiki/Timkat" },
  { id: "adwa-victory", name: "Adwa Victory Day", rule: { month: 3, day: 2 }, heritages: ["ethiopian"], category: "community", description: "Commemorates Ethiopia's 1896 victory at the Battle of Adwa.", url: "https://en.wikipedia.org/wiki/Battle_of_Adwa" },
  { id: "mexican-independence", name: "Mexican Independence Day", rule: { month: 9, day: 16 }, heritages: ["mexican"], category: "festival", description: "Marks the 1810 call for independence, celebrated with El Grito, music, and food.", url: "https://en.wikipedia.org/wiki/Independence_Day_(Mexico)" },
  { id: "day-of-the-dead", name: "Day of the Dead", rule: { month: 11, day: 1 }, heritages: ["mexican"], category: "religious", description: "A Mexican tradition of honoring loved ones with ofrendas, marigolds, and food.", url: "https://en.wikipedia.org/wiki/Day_of_the_Dead" },
  { id: "cinco-de-mayo", name: "Cinco de Mayo", rule: { month: 5, day: 5 }, heritages: ["mexican"], category: "festival", description: "Commemorates the 1862 Battle of Puebla and is widely celebrated in the United States.", url: "https://en.wikipedia.org/wiki/Cinco_de_Mayo" },
  { id: "independence-day-colombia", name: "Independence Day", rule: { month: 7, day: 20 }, heritages: ["colombian"], category: "festival", description: "Colombia's national day, marking the 1810 cry of independence.", url: "https://en.wikipedia.org/wiki/Colombian_War_of_Independence" },
  { id: "battle-of-boyaca", name: "Battle of Boyacá Day", rule: { month: 8, day: 7 }, heritages: ["colombian"], category: "community", description: "Commemorates the 1819 battle that secured Colombian independence.", url: "https://en.wikipedia.org/wiki/Battle_of_Boyac%C3%A1" },
  { id: "fiestas-patrias-peru", name: "Fiestas Patrias", rule: { month: 7, day: 28 }, heritages: ["peruvian"], category: "festival", description: "Peru's national holiday, marking independence declared in 1821.", url: "https://en.wikipedia.org/wiki/Fiestas_Patrias_(Peru)" },
  { id: "inti-raymi", name: "Inti Raymi", rule: { month: 6, day: 24 }, heritages: ["peruvian"], category: "festival", description: "The Inca festival of the sun, reenacted each year in Cusco.", url: "https://en.wikipedia.org/wiki/Inti_Raymi" },
  { id: "independence-day-el-salvador", name: "Independence Day", rule: { month: 9, day: 15 }, heritages: ["salvadoran"], category: "festival", description: "El Salvador's national day, marking independence from Spain in 1821.", url: "https://en.wikipedia.org/wiki/Act_of_Independence_of_Central_America" },
  { id: "independence-day-philippines", name: "Independence Day", rule: { month: 6, day: 12 }, heritages: ["filipino"], category: "festival", description: "Marks the 1898 declaration of Philippine independence.", url: "https://en.wikipedia.org/wiki/Independence_Day_(Philippines)" },
  { id: "rizal-day", name: "Rizal Day", rule: { month: 12, day: 30 }, heritages: ["filipino"], category: "community", description: "Honors national hero José Rizal.", url: "https://en.wikipedia.org/wiki/Rizal_Day" },
  { id: "national-day-vietnam", name: "National Day", rule: { month: 9, day: 2 }, heritages: ["vietnamese"], category: "festival", description: "Marks Ho Chi Minh's 1945 declaration of independence.", url: "https://en.wikipedia.org/wiki/National_Day_(Vietnam)" },
  { id: "tet-2027", name: "Tết", rule: { date: "2027-02-06" }, heritages: ["vietnamese"], category: "festival", description: "The Vietnamese Lunar New Year, a time for family reunions, offerings, and special foods.", url: "https://en.wikipedia.org/wiki/T%E1%BA%BFt" },
  { id: "mid-autumn-2027", name: "Mid-Autumn Festival", rule: { date: "2027-09-15" }, heritages: ["chinese", "vietnamese"], category: "festival", description: "A harvest and moon festival celebrated with mooncakes, lanterns, and family gatherings.", url: "https://en.wikipedia.org/wiki/Mid-Autumn_Festival" },
  { id: "chinese-new-year-2027", name: "Chinese New Year", rule: { date: "2027-02-06" }, heritages: ["chinese"], category: "festival", description: "The Lunar New Year, celebrated with family dinners, red envelopes, lion dances, and fireworks.", url: "https://en.wikipedia.org/wiki/Chinese_New_Year" },
  { id: "national-day-china", name: "National Day", rule: { month: 10, day: 1 }, heritages: ["chinese"], category: "festival", description: "Marks the founding of the People's Republic of China in 1949.", url: "https://en.wikipedia.org/wiki/National_Day_of_the_People's_Republic_of_China" },
  { id: "chuseok-2027", name: "Chuseok", rule: { date: "2027-09-15" }, heritages: ["korean"], category: "festival", description: "The Korean harvest festival, celebrated with family gatherings and songpyeon.", url: "https://en.wikipedia.org/wiki/Chuseok" },
  { id: "liberation-day-korea", name: "Liberation Day", rule: { month: 8, day: 15 }, heritages: ["korean"], category: "community", description: "Marks Korea's liberation from Japanese rule in 1945.", url: "https://en.wikipedia.org/wiki/National_Liberation_Day_of_Korea" },
  { id: "hangul-day", name: "Hangul Day", rule: { month: 10, day: 9 }, heritages: ["korean"], category: "community", description: "Celebrates the creation of the Korean alphabet.", url: "https://en.wikipedia.org/wiki/Hangul_Day" },
  { id: "independence-day-jamaica", name: "Independence Day", rule: { month: 8, day: 6 }, heritages: ["jamaican"], category: "festival", description: "Jamaica's national day, marking independence in 1962.", url: "https://en.wikipedia.org/wiki/Jamaica_Independence_Act_1962" },
  { id: "emancipation-day", name: "Emancipation Day", rule: { month: 8, day: 1 }, heritages: ["jamaican"], category: "community", description: "Marks the end of slavery in the British Caribbean in 1834.", url: "https://en.wikipedia.org/wiki/Emancipation_Day" },
  { id: "revolution-day-egypt", name: "Revolution Day", rule: { month: 7, day: 23 }, heritages: ["egyptian"], category: "community", description: "Marks the 1952 revolution that ended the monarchy in Egypt.", url: "https://en.wikipedia.org/wiki/Egyptian_revolution_of_1952" },
  { id: "armed-forces-day-egypt", name: "Armed Forces Day", rule: { month: 10, day: 6 }, heritages: ["egyptian"], category: "community", description: "Commemorates the start of the 1973 October War.", url: "https://en.wikipedia.org/wiki/Armed_Forces_Day" },
  { id: "independence-day-lebanon", name: "Independence Day", rule: { month: 11, day: 22 }, heritages: ["lebanese"], category: "festival", description: "Lebanon's national day, marking independence from France in 1943.", url: "https://en.wikipedia.org/wiki/Lebanese_Independence_Day" },
  { id: "republic-day-turkey", name: "Republic Day", rule: { month: 10, day: 29 }, heritages: ["turkish"], category: "festival", description: "Marks the 1923 founding of the Republic of Türkiye.", url: "https://en.wikipedia.org/wiki/Republic_Day_(Turkey)" },
  { id: "national-sovereignty-day", name: "National Sovereignty and Children's Day", rule: { month: 4, day: 23 }, heritages: ["turkish"], category: "community", description: "A Turkish holiday marking the first meeting of the Grand National Assembly, dedicated to children.", url: "https://en.wikipedia.org/wiki/National_Sovereignty_and_Children's_Day" },
  { id: "yalda-night", name: "Yalda Night", rule: { month: 12, day: 21 }, heritages: ["iranian"], category: "festival", description: "The Persian winter solstice celebration, with poetry, pomegranates, and watermelon.", url: "https://en.wikipedia.org/wiki/Yalda_Night" },
  { id: "nowruz-2027", name: "Nowruz", rule: { date: "2027-03-21" }, heritages: ["iranian"], category: "festival", description: "The Persian New Year, beginning at the spring equinox (the evening of March 20 in the United States), celebrated with the haft-sin table and family visits.", url: "https://en.wikipedia.org/wiki/Nowruz" },
  { id: "defence-day-pakistan", name: "Defence Day", rule: { month: 9, day: 6 }, heritages: ["pakistani"], category: "community", description: "Honors Pakistan's armed forces and the 1965 war.", url: "https://en.wikipedia.org/wiki/Defence_Day" },
  { id: "sinhala-tamil-new-year", name: "Sinhala and Tamil New Year", rule: { month: 4, day: 13 }, heritages: ["sri-lankan"], category: "festival", description: "The traditional new year in Sri Lanka, celebrated with games, sweets, and family visits.", url: "https://en.wikipedia.org/wiki/Sinhalese_New_Year" },
  { id: "founders-day-ghana", name: "Founders' Day", rule: { month: 8, day: 4 }, heritages: ["ghanaian"], category: "community", description: "Honors the founding figures of Ghana's independence.", url: "https://en.wikipedia.org/wiki/Founders'_Day_(Ghana)" },
  { id: "hispanic-heritage-month", name: "Hispanic Heritage Month", rule: { month: 9, day: 15 }, heritages: ["mexican", "colombian", "salvadoran", "peruvian"], category: "community", description: "A month of events in the United States celebrating the histories and cultures of Hispanic and Latino Americans.", url: "https://en.wikipedia.org/wiki/National_Hispanic_Heritage_Month" },
  { id: "all-souls-day", name: "All Souls' Day", rule: { month: 11, day: 2 }, heritages: ["salvadoran", "colombian", "peruvian"], category: "religious", description: "A day to remember the departed, observed in Latin America with visits to cemeteries and special foods.", url: "https://en.wikipedia.org/wiki/All_Souls'_Day" },
  { id: "filipino-american-history-month", name: "Filipino American History Month", rule: { month: 10, day: 1 }, heritages: ["filipino"], category: "community", description: "A month in the United States honoring the history and contributions of Filipino Americans.", url: "https://en.wikipedia.org/wiki/Filipino_American_History_Month" },
  { id: "caribbean-american-heritage-month", name: "Caribbean-American Heritage Month", rule: { month: 6, day: 1 }, heritages: ["jamaican"], category: "community", description: "A June celebration in the United States of Caribbean American history and culture.", url: "https://en.wikipedia.org/wiki/Caribbean-American_Heritage_Month" },
  { id: "nayrouz", name: "Coptic New Year (Nayrouz)", rule: { month: 9, day: 11 }, heritages: ["egyptian"], category: "religious", description: "The Coptic Orthodox new year, marking the start of the Egyptian Coptic calendar.", url: "https://en.wikipedia.org/wiki/Nayrouz" },
  { id: "liberation-day-lebanon", name: "Resistance and Liberation Day", rule: { month: 5, day: 25 }, heritages: ["lebanese"], category: "community", description: "Marks the 2000 end of Israeli occupation of southern Lebanon.", url: "https://en.wikipedia.org/wiki/Resistance_and_Liberation_Day_(Lebanon)" },
  { id: "victory-day-turkey", name: "Victory Day", rule: { month: 8, day: 30 }, heritages: ["turkish"], category: "community", description: "Commemorates the 1922 victory at the Battle of Dumlupınar.", url: "https://en.wikipedia.org/wiki/Victory_Day_(Turkey)" },
  { id: "youth-sports-day-turkey", name: "Commemoration of Atatürk, Youth and Sports Day", rule: { month: 5, day: 19 }, heritages: ["turkish"], category: "community", description: "A Turkish holiday marking the start of the War of Independence, dedicated to youth and sports.", url: "https://en.wikipedia.org/wiki/Commemoration_of_Atat%C3%BCrk%2C_Youth_and_Sports_Day" },
  { id: "ferdowsi-day", name: "Ferdowsi Day", rule: { month: 5, day: 15 }, heritages: ["iranian"], category: "community", description: "Honors the Persian poet Ferdowsi, author of the Shahnameh.", url: "https://en.wikipedia.org/wiki/Ferdowsi" },
  { id: "childrens-day-nigeria", name: "Children's Day", rule: { month: 5, day: 27 }, heritages: ["nigerian"], category: "community", description: "A day in Nigeria dedicated to children, with school programs and celebrations.", url: "https://en.wikipedia.org/wiki/Public_holidays_in_Nigeria" },
  { id: "martyrs-day-lebanon", name: "Martyrs' Day", rule: { month: 5, day: 6 }, heritages: ["lebanese"], category: "community", description: "Commemorates Lebanese nationalists executed in 1915 and 1916.", url: "https://en.wikipedia.org/wiki/Martyrs'_Day_(Lebanon)" },
  { id: "reunification-day-vietnam", name: "Reunification Day", rule: { month: 4, day: 30 }, heritages: ["vietnamese"], category: "community", description: "Marks the 1975 end of the Vietnam War and the reunification of the country.", url: "https://en.wikipedia.org/wiki/Reunification_Day" },
  { id: "womens-day-vietnam", name: "Vietnamese Women's Day", rule: { month: 10, day: 20 }, heritages: ["vietnamese"], category: "community", description: "A day in Vietnam honoring women, with flowers and gifts.", url: "https://en.wikipedia.org/wiki/Public_holidays_in_Vietnam" },
  { id: "tet-2028", name: "Tết", rule: { date: "2028-01-26" }, heritages: ["vietnamese"], category: "festival", description: "The Vietnamese Lunar New Year, a time for family reunions, offerings, and special foods.", url: "https://en.wikipedia.org/wiki/T%E1%BA%BFt" },
  { id: "chinese-new-year-2028", name: "Chinese New Year", rule: { date: "2028-01-26" }, heritages: ["chinese"], category: "festival", description: "The Lunar New Year, celebrated with family dinners, red envelopes, lion dances, and fireworks.", url: "https://en.wikipedia.org/wiki/Chinese_New_Year" },
  { id: "mid-autumn-2028", name: "Mid-Autumn Festival", rule: { date: "2028-10-03" }, heritages: ["chinese", "vietnamese"], category: "festival", description: "A harvest and moon festival celebrated with mooncakes, lanterns, and family gatherings.", url: "https://en.wikipedia.org/wiki/Mid-Autumn_Festival" },
  { id: "dongzhi", name: "Dongzhi (Winter Solstice) Festival", rule: { month: 12, day: 22 }, heritages: ["chinese"], category: "festival", description: "The winter solstice festival, around December 21 to 22, celebrated with family meals of tangyuan or dumplings.", url: "https://en.wikipedia.org/wiki/Dongzhi" },
  { id: "mehregan", name: "Mehregan", rule: { month: 10, day: 8 }, heritages: ["iranian"], category: "festival", description: "An ancient Persian autumn festival celebrating friendship and the harvest.", url: "https://en.wikipedia.org/wiki/Mehregan" },
  { id: "tirgan", name: "Tirgan", rule: { month: 7, day: 4 }, heritages: ["iranian"], category: "festival", description: "A Persian summer festival with water play, poetry, and traditional foods.", url: "https://en.wikipedia.org/wiki/Tirgan" },
  { id: "march-first-movement", name: "March First Movement Day", rule: { month: 3, day: 1 }, heritages: ["korean"], category: "community", description: "Commemorates the 1919 independence movement against Japanese rule.", url: "https://en.wikipedia.org/wiki/March_First_Movement" },
  { id: "memorial-day-korea", name: "Memorial Day", rule: { month: 6, day: 6 }, heritages: ["korean"], category: "community", description: "Honors Koreans who died in service to the country.", url: "https://en.wikipedia.org/wiki/Memorial_Day_(South_Korea)" },
  { id: "chuseok-2028", name: "Chuseok", rule: { date: "2028-10-03" }, heritages: ["korean"], category: "festival", description: "The Korean harvest festival, celebrated with family gatherings and songpyeon.", url: "https://en.wikipedia.org/wiki/Chuseok" },
  { id: "thai-pongal", name: "Thai Pongal", rule: { month: 1, day: 14 }, heritages: ["sri-lankan", "indian"], category: "festival", description: "A Tamil harvest festival of thanksgiving, with the cooking of sweet pongal.", url: "https://en.wikipedia.org/wiki/Pongal_(festival)" },
  { id: "diwali-2028", name: "Diwali", rule: { date: "2028-10-17" }, heritages: ["indian", "sri-lankan"], category: "religious", description: "The festival of lights, celebrated with lamps, sweets, family gatherings, and fireworks.", url: "https://en.wikipedia.org/wiki/Diwali" },
  { id: "diwali-2027", name: "Diwali", rule: { date: "2027-10-29" }, heritages: ["indian", "sri-lankan"], category: "religious", description: "The festival of lights, celebrated with lamps, sweets, family gatherings, and fireworks.", url: "https://en.wikipedia.org/wiki/Diwali" },
];

const iso = (y: number, m: number, d: number) => `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

/** The next date on or after `today` for a celebration, or null if a one-off date has passed. */
function nextDate(rule: Rule, today: string): string | null {
  if ("date" in rule) return rule.date >= today ? rule.date : null;
  const year = Number(today.slice(0, 4));
  const thisYear = iso(year, rule.month, rule.day);
  return thisYear >= today ? thisYear : iso(year + 1, rule.month, rule.day);
}

/** Upcoming celebrations as events. They have no venue or tickets: each points to a page about the celebration. */
export function upcomingCelebrations(now = new Date()): CulturalEvent[] {
  const today = iso(now.getFullYear(), now.getMonth() + 1, now.getDate());
  const horizon = new Date(now.getTime() + 365 * 86_400_000);
  const limit = iso(horizon.getFullYear(), horizon.getMonth() + 1, horizon.getDate());
  return CELEBRATIONS.flatMap((c): CulturalEvent[] => {
    const date = nextDate(c.rule, today);
    // Only the coming year: a celebration further out would repeat one that is already listed.
    if (!date || date > limit) return [];
    return [
      {
        id: `cal-${c.id}-${date}`,
        name: c.name,
        date,
        venue: "Celebrated in communities everywhere",
        city: "",
        state: "",
        isVirtual: false,
        description: c.description,
        category: c.category,
        heritages: c.heritages,
        tags: ["Cultural calendar"],
        organizer: "Observed worldwide",
        price: "No ticket needed",
        externalUrl: c.url,
        art: "terracotta",
        kind: "celebration",
      },
    ];
  });
}
