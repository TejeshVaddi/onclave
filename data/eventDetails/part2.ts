import type { EventDetail } from "@/types";

/** Illustrative details for the demo events. See part1.ts for the note on what is and is not real. */
export const EVENT_DETAILS_2: Record<string, EventDetail> = {
  "e-coptic-food-bazaar": {
    lineup: [
      { name: "Parish kitchen volunteers", role: "Koshari, molokhia, and Egyptian pastries" },
      { name: "Craft market vendors", role: "Handmade goods benefiting parish programs" },
      { name: "Youth choir", role: "Hymns in Arabic and English" },
    ],
    schedule: [
      { time: "11:00 AM", item: "Food and craft market open" },
      { time: "1:00 PM", item: "Youth choir" },
      { time: "3:00 PM", item: "Church tours" },
      { time: "5:30 PM", item: "Last call for food" },
    ],
    organizerNote: "A Coptic Orthodox parish whose annual bazaar raises money for its charitable programs.",
    tickets: { how: "Free entry. Food is sold by the plate.", where: "Pay at the food tables, cash preferred." },
    goodToKnow: ["Fasting-friendly vegan plates available", "Church tours are open to visitors", "Parking in the church lot"],
  },
  "e-vesak-sri-lankan": {
    address: "5017 16th St NW, Washington, DC 20011",
    lineup: [
      { name: "Resident monks", role: "Chanting and short Dhamma talk" },
      { name: "Volunteer cooks", role: "Shared vegetarian meal" },
    ],
    schedule: [
      { time: "5:00 PM", item: "Arrival and offerings" },
      { time: "5:30 PM", item: "Chanting and meditation" },
      { time: "6:30 PM", item: "Short talk" },
      { time: "7:00 PM", item: "Community dinner" },
    ],
    organizerNote: "A Buddhist temple in Washington, DC that welcomes visitors of any background to its observances.",
    tickets: { how: "Free. Donations support the temple.", where: "Donation box in the shrine room." },
    goodToKnow: ["Wear modest, light-colored clothing", "Shoes come off at the shrine room door", "No prior experience needed"],
  },
  "e-ghana-independence-social": {
    lineup: [
      { name: "Highlife band", role: "Live music" },
      { name: "Kente fashion moment", role: "Short runway show" },
      { name: "Buffet", role: "Waakye, jollof, kelewele, and grilled tilapia" },
    ],
    schedule: [
      { time: "6:00 PM", item: "Doors and buffet opens" },
      { time: "7:30 PM", item: "Kente fashion moment" },
      { time: "8:00 PM", item: "Highlife band" },
      { time: "10:00 PM", item: "Open dance floor" },
    ],
    organizerNote: "A Ghanaian restaurant in Arlington that hosts a yearly independence celebration with live music.",
    tickets: { how: "$15 per person covers the buffet.", where: "Buy at the restaurant or at the door." },
    goodToKnow: ["Wear kente or red, gold, and green", "Cash bar", "Ages 12 and up after 9 PM"],
  },
  "e-koreatown-chuseok-market": {
    lineup: [
      { name: "Street food stalls", role: "Tteokbokki, hotteok, corn dogs, and more" },
      { name: "K-pop dance cover teams", role: "Stage performances" },
      { name: "Lantern displays", role: "Neighborhood decoration" },
    ],
    schedule: [
      { time: "5:00 PM", item: "Stalls open" },
      { time: "6:30 PM", item: "Dance cover performances" },
      { time: "8:00 PM", item: "Lantern lighting" },
      { time: "9:30 PM", item: "Last call" },
    ],
    organizerNote: "An association of Korean business owners that runs seasonal events on the neighborhood's main street.",
    tickets: { how: "Free to walk around. Food costs vary by stall.", where: "Pay at stalls, cash and card." },
    goodToKnow: ["Street parking fills early", "Family friendly", "Many stalls have vegetarian options"],
  },
  "e-manila-bakery-anniversary": {
    lineup: [
      { name: "Bakery family", role: "Hosts" },
      { name: "Kamayan feast", role: "Banana-leaf spread of adobo, pancit, lumpia, and rice" },
      { name: "Anniversary cake", role: "Dessert" },
    ],
    schedule: [
      { time: "1:00 PM", item: "Welcome and blessing" },
      { time: "1:30 PM", item: "Kamayan feast" },
      { time: "3:00 PM", item: "Cake cutting" },
      { time: "3:30 PM", item: "Bakery tour" },
    ],
    organizerNote: "A neighborhood Filipino bakery celebrating ten years in Springfield.",
    tickets: { how: "$20 per person covers the feast.", where: "Buy at the bakery counter." },
    goodToKnow: ["Feast is eaten by hand", "Vegetarian dishes available", "Space is limited"],
  },
  "e-latino-heritage-concert": {
    address: "1551 Trap Rd, Vienna, VA 22182",
    lineup: [
      { name: "Cumbia ensemble from Colombia", role: "Headliner" },
      { name: "Andean folk group from Peru", role: "Featured act" },
      { name: "Salvadoran marimba trio", role: "Opening act" },
    ],
    schedule: [
      { time: "6:30 PM", item: "Gates open" },
      { time: "7:30 PM", item: "Salvadoran marimba trio" },
      { time: "8:15 PM", item: "Andean folk group" },
      { time: "9:15 PM", item: "Cumbia ensemble" },
    ],
    organizerNote: "A performing arts foundation that presents concerts at a national park venue each season.",
    tickets: { how: "$35 per person. Reserved seats sell out.", where: "Through the venue's box office." },
    goodToKnow: ["Check the venue's bag and picnic rules", "Parking is on site", "Bring a light jacket"],
    venueUrl: "https://www.wolftrap.org",
  },
  "e-south-asian-startup-night": {
    lineup: [
      { name: "Six early stage founders", role: "Pitch practice" },
      { name: "Three regional investors", role: "Feedback panel" },
      { name: "Community mentors", role: "Networking" },
    ],
    schedule: [
      { time: "6:00 PM", item: "Check-in and mingling" },
      { time: "6:45 PM", item: "Pitch practice rounds" },
      { time: "8:00 PM", item: "Investor feedback" },
      { time: "8:30 PM", item: "Networking" },
    ],
    organizerNote: "A volunteer network of South Asian professionals in the DC area.",
    tickets: { how: "$15 per person. Founders who pitch pay nothing.", where: "Register through the organizer's event page." },
    goodToKnow: ["Pitch slots go to the first 6 founders who ask", "Business casual", "Light refreshments served"],
  },
  "e-african-diaspora-health-fair": {
    address: "1901 Fort Pl SE, Washington, DC 20020",
    lineup: [
      { name: "Nigerian, Ghanaian, and Ethiopian doctors", role: "Panel on preventive care" },
      { name: "Community nurses", role: "Free screenings" },
      { name: "Healthy cooking demonstrations", role: "Chef-led demos" },
    ],
    schedule: [
      { time: "10:00 AM", item: "Screenings open" },
      { time: "11:30 AM", item: "Physicians' panel" },
      { time: "1:00 PM", item: "Cooking demos" },
      { time: "2:30 PM", item: "Raffle and wrap-up" },
    ],
    organizerNote: "A neighborhood museum that hosts community programs connected to its exhibitions.",
    tickets: { how: "Free. Screenings are first come, first served.", where: "Check in at the front desk." },
    goodToKnow: ["Screenings include blood pressure and blood sugar", "Interpreters available on request", "Wheelchair accessible"],
    venueUrl: "https://anacostia.si.edu",
  },
  "e-middle-eastern-arts-night": {
    lineup: [
      { name: "Oud player", role: "Live music" },
      { name: "Arabic and Persian poets", role: "Readings with translations" },
      { name: "Bakery pastry tasting", role: "Sweets" },
    ],
    schedule: [
      { time: "7:00 PM", item: "Doors and pastry tasting" },
      { time: "7:30 PM", item: "Poetry readings" },
      { time: "8:30 PM", item: "Oud performance" },
      { time: "9:00 PM", item: "Open mic" },
    ],
    organizerNote: "A family-owned Lebanese bakery that hosts monthly arts nights in its cafe.",
    tickets: { how: "$10 per person includes pastries and tea.", where: "Buy at the counter or reserve a table." },
    goodToKnow: ["Seating is limited", "Open mic sign-up at the door", "Vegetarian friendly"],
  },
  "e-caribbean-carnival-dc": {
    lineup: [
      { name: "Costume bands", role: "Feathered costumes parade" },
      { name: "Steel pan orchestra", role: "Live music" },
      { name: "Soca DJ trucks", role: "Parade music" },
      { name: "Food vendors", role: "Jerk, roti, doubles, and patties" },
    ],
    schedule: [
      { time: "11:00 AM", item: "Vendors open" },
      { time: "1:00 PM", item: "Parade starts" },
      { time: "4:00 PM", item: "Steel pan stage" },
      { time: "6:30 PM", item: "Soca party" },
    ],
    organizerNote: "A nationals association that works with other Caribbean groups to organize the region's carnival.",
    tickets: { how: "Free to watch. Costume band registration is separate.", where: "Costume bands are booked through each band." },
    goodToKnow: ["Roads close from morning", "Take Metro to Georgia Ave-Petworth", "Bring sunscreen and water"],
  },
  "e-hilsa-fish-festival": {
    lineup: [
      { name: "Grocery owners", role: "Hosts and cooking demonstrators" },
      { name: "Bengali home cooks", role: "Tasting plates" },
      { name: "Fish market pop-up", role: "Fresh and frozen fish" },
    ],
    schedule: [
      { time: "1:00 PM", item: "Doors and fish market pop-up" },
      { time: "1:30 PM", item: "Shorshe ilish demonstration" },
      { time: "2:30 PM", item: "Other hilsa preparations" },
      { time: "3:30 PM", item: "Tasting and questions" },
    ],
    organizerNote: "A Bengali grocery that hosts seasonal cooking demonstrations for its community.",
    tickets: { how: "$15 per person covers tastings.", where: "Pay at the register." },
    goodToKnow: ["Fish has small bones", "Vegetarian tasting available", "Parking in the plaza lot"],
  },
  "e-turkish-coffee-workshop": {
    lineup: [
      { name: "Cafe owner", role: "Instructor" },
      { name: "Group of up to 12", role: "Participants" },
    ],
    schedule: [
      { time: "3:00 PM", item: "Introduction to cezve and grind" },
      { time: "3:30 PM", item: "Brewing together" },
      { time: "4:15 PM", item: "Reading coffee grounds" },
      { time: "4:45 PM", item: "Baklava and tea" },
    ],
    organizerNote: "A Turkish bakery and cafe in Arlington that hosts small tastings and workshops.",
    tickets: { how: "$20 per person includes coffee and baklava.", where: "Reserve at the counter." },
    goodToKnow: ["Contains caffeine", "Reading grounds is for fun", "Seats are limited"],
  },
  "e-diwali-community-service": {
    lineup: [
      { name: "Temple volunteers", role: "Team leaders" },
      { name: "Local food bank", role: "Receiving partner" },
    ],
    schedule: [
      { time: "9:00 AM", item: "Check-in and safety briefing" },
      { time: "9:30 AM", item: "Food packing and neighborhood cleanup" },
      { time: "12:00 PM", item: "Thank-you lunch" },
    ],
    organizerNote: "A Hindu temple whose volunteers organize service projects before major festivals.",
    tickets: { how: "Free. Please sign up so the team can plan.", where: "Sign up through the temple's volunteer form." },
    goodToKnow: ["Wear closed-toe shoes", "Open to all faiths and ages 10 and up", "Gloves and water provided"],
  },
  "e-persian-film-night": {
    address: "8633 Colesville Rd, Silver Spring, MD 20910",
    lineup: [
      { name: "A contemporary Iranian film", role: "Feature screening" },
      { name: "A Persian studies professor", role: "Post-film discussion" },
    ],
    schedule: [
      { time: "7:00 PM", item: "Screening begins" },
      { time: "9:00 PM", item: "Discussion" },
    ],
    organizerNote: "A weekend school and cultural center for Iranian families that also screens films for the public.",
    tickets: { how: "$12 per person.", where: "Through the theater's box office." },
    goodToKnow: ["In Persian with English subtitles", "Ages 13 and up", "Metro: Silver Spring station"],
    venueUrl: "https://www.afi.com/silver",
  },
  "e-korean-drumming-workshop": {
    lineup: [
      { name: "Samulnori instructor", role: "Teacher" },
      { name: "Beginner class of up to 20", role: "Participants" },
    ],
    schedule: [
      { time: "2:00 PM", item: "Intro to the four instruments" },
      { time: "2:40 PM", item: "Basic rhythms" },
      { time: "3:30 PM", item: "Short group performance" },
    ],
    organizerNote: "A community center that teaches Korean music, language, and cooking to families.",
    tickets: { how: "$10 per person, instruments provided.", where: "Register at the front desk." },
    goodToKnow: ["No experience needed", "Ages 8 and up", "Wear comfortable clothes"],
  },
  "e-ethiopian-new-generation": {
    lineup: [
      { name: "Second-generation professionals in law, medicine, and tech", role: "Hosts and guests" },
      { name: "Cafe baristas", role: "Coffee service" },
    ],
    schedule: [
      { time: "6:30 PM", item: "Coffee and mingling" },
      { time: "7:15 PM", item: "Lightning talks from three guests" },
      { time: "8:00 PM", item: "Open conversation" },
    ],
    organizerNote: "A young professionals group for Ethiopian Americans in the DC area.",
    tickets: { how: "Free. RSVP encouraged.", where: "RSVP through the group's page." },
    goodToKnow: ["Ages 18 and up", "Coffee and light snacks included", "Casual dress"],
  },
  "e-lunar-new-year-preview": {
    lineup: [
      { name: "Center volunteers", role: "Lantern and calligraphy teachers" },
      { name: "Families", role: "Participants" },
    ],
    schedule: [
      { time: "5:00 PM", item: "Lantern building" },
      { time: "6:00 PM", item: "Calligraphy greetings" },
      { time: "6:45 PM", item: "Display your lantern" },
    ],
    organizerNote: "A community center serving Chinese families in Northern Virginia.",
    tickets: { how: "$8 per child or adult, supplies included.", where: "Register at the front desk." },
    goodToKnow: ["Great for ages 5 and up", "Take your lantern home", "Parking in the center lot"],
  },
  "e-nigerian-book-club": {
    lineup: [
      { name: "Volunteer host", role: "Discussion leader" },
      { name: "Fellow readers", role: "Participants" },
    ],
    schedule: [
      { time: "7:00 PM", item: "Welcome and introductions" },
      { time: "7:10 PM", item: "Book discussion" },
      { time: "8:15 PM", item: "Next month's pick" },
    ],
    organizerNote: "A volunteer professional network that also runs a monthly online book club.",
    tickets: { how: "Free. Sign up to get the video link.", where: "Through the organizer's sign-up form." },
    goodToKnow: ["No need to finish the book", "Camera optional", "Open to all backgrounds"],
  },
  "e-mexican-day-of-dead-workshop": {
    address: "2829 16th St NW, Washington, DC 20009",
    lineup: [
      { name: "Cultural institute educators", role: "Workshop leaders" },
      { name: "Families", role: "Ofrenda builders" },
    ],
    schedule: [
      { time: "4:00 PM", item: "Welcome and story of the ofrenda" },
      { time: "4:30 PM", item: "Papel picado and marigold making" },
      { time: "5:45 PM", item: "Building the community ofrenda" },
      { time: "6:30 PM", item: "Pan de muerto and hot chocolate" },
    ],
    organizerNote: "A cultural institute in Washington, DC that shares Mexican art, history, and traditions.",
    tickets: { how: "Free. Registration helps staff plan supplies.", where: "Register through the institute." },
    goodToKnow: ["Bring a photo of a loved one for the ofrenda", "Family friendly", "Metro: Columbia Heights station is nearby"],
  },
  "e-mawlid-gathering-2026": {
    lineup: [
      { name: "Nasheed group", role: "Singing" },
      { name: "Community imam", role: "Short talk" },
      { name: "Volunteer cooks", role: "Shared dinner" },
    ],
    schedule: [
      { time: "6:30 PM", item: "Welcome" },
      { time: "6:45 PM", item: "Nasheed" },
      { time: "7:30 PM", item: "Talk on the Prophet's life" },
      { time: "8:00 PM", item: "Community dinner" },
    ],
    organizerNote: "A community center and mosque in Annandale that welcomes neighbors of every background.",
    tickets: { how: "Free. No RSVP.", where: "Donations to the meal are welcome." },
    goodToKnow: ["Dress modestly", "Shoes come off at the prayer hall", "Separate seating is available"],
  },
  "e-all-souls-memorial-mass-2026": {
    lineup: [
      { name: "Parish priest", role: "Celebrant" },
      { name: "Parish choir", role: "Hymns in Spanish and English" },
    ],
    schedule: [
      { time: "7:00 PM", item: "Bilingual Mass" },
      { time: "8:00 PM", item: "Reception with pan de muerto and hot chocolate" },
    ],
    organizerNote: "A parish in Arlington with Spanish and English liturgies and a large Latino community.",
    tickets: { how: "Free. Everyone is welcome.", where: "No ticket or RSVP needed." },
    goodToKnow: ["Bring photos of loved ones if you wish", "Dress modestly", "Street parking nearby"],
  },
};
