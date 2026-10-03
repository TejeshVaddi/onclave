import type { CommunityDetail } from "@/types";

/**
 * Specifics for the demo communities that don't have their own verified
 * link: who it's for, how active it is, what members do, and how to join on
 * that platform. These are illustrative, since the groups themselves are
 * demo listings. The steps for joining describe how each platform works.
 */
const FACEBOOK_JOIN = ["Open Facebook and search for the group name", "Tap Join and answer the short membership questions", "Read the pinned post for the group rules"];
const MEETUP_JOIN = ["Create a free Meetup account", "Search for the group name and tap Join", "RSVP to the next event on the group page"];
const CAMPUS_JOIN = ["Find the organization in your school's student-organization directory", "Email the officers listed there to ask about the next meeting", "Follow the club's social accounts for event announcements"];
const DISCORD_JOIN = ["Find the server through a Discord server directory or an invite from a friend", "Read the rules channel and pick your roles", "Say hello in the introductions channel"];
const NEXTDOOR_JOIN = ["Sign up on Nextdoor with your home address", "Search for the group name or neighborhood", "Join and introduce yourself in the first thread"];
const ORG_JOIN = ["Look up the organization's website or contact page", "Email or call to ask about the next gathering", "Visit in person at a public event first"];

export const COMMUNITY_DETAILS: Record<string, CommunityDetail> = {
  "c-nigerians-dmv": {
    whoFor: "Nigerians and friends of the community across DC, Maryland, and Virginia",
    cadence: "Active daily, with a few new posts every hour",
    activities: ["Event announcements and cultural nights", "Housing and job tips", "Business recommendations"],
    howToJoin: FACEBOOK_JOIN,
  },
  "c-nsa-gmu": {
    whoFor: "Nigerian and Nigerian-American students, and anyone curious about the culture",
    cadence: "General meetings every two weeks during the semester",
    activities: ["Cultural nights and Independence Day celebration", "Mentorship pairings with upperclassmen", "Study sessions"],
    howToJoin: CAMPUS_JOIN,
  },
  "c-naija-pros-dc": {
    whoFor: "Early- and mid-career Nigerian professionals in tech, healthcare, finance, and government",
    cadence: "One mixer or panel each month",
    activities: ["Panels on career moves", "Monthly mixers", "Mentor matching"],
    howToJoin: MEETUP_JOIN,
  },
  "c-igbo-nova": {
    whoFor: "Igbo families and friends in Northern Virginia, including kids learning the language",
    cadence: "Language classes weekly, large gatherings a few times a year",
    activities: ["Igbo Cultural Day", "Youth language classes", "Support for new families"],
    howToJoin: ORG_JOIN,
  },
  "c-yoruba-discord": {
    whoFor: "Second-generation speakers and learners rebuilding Yoruba fluency",
    cadence: "Weekly voice practice, daily proverb of the day",
    activities: ["Voice-chat practice", "Proverbs and idioms", "Beginner help channel"],
    howToJoin: DISCORD_JOIN,
  },
  "c-nigerian-fellowship": {
    whoFor: "Nigerian families and newcomers looking for a church community",
    cadence: "Sunday services and midweek youth gatherings",
    activities: ["Sunday worship", "Youth ministry", "Welcome program for new families"],
    howToJoin: ORG_JOIN,
  },
  "c-west-african-neighbors": {
    whoFor: "West African families in Chantilly and Centreville",
    cadence: "A few neighborhood posts each week",
    activities: ["Carpools", "Weekend markets", "Holiday potlucks"],
    howToJoin: NEXTDOOR_JOIN,
  },
  "c-isa-gmu": {
    whoFor: "Indian and Indian-American students, and anyone who wants to join the fun",
    cadence: "Meetings every other week, big events each semester",
    activities: ["Garba, Holi, and Diwali on campus", "Cricket socials", "Alumni mentorship night each spring"],
    howToJoin: CAMPUS_JOIN,
  },
  "c-nova-indian-families": {
    whoFor: "Parents and families in Northern Virginia with Indian roots",
    cadence: "Very active, many posts every day",
    activities: ["Class and tutor recommendations", "Temple and festival schedules", "Tiffin and catering tips"],
    howToJoin: FACEBOOK_JOIN,
  },
  "c-desi-pros-dc": {
    whoFor: "South Asian professionals across the DC region",
    cadence: "Monthly industry spotlight events",
    activities: ["Industry spotlight talks", "Resume-review circle", "Networking mixers"],
    howToJoin: MEETUP_JOIN,
  },
  "c-temple-youth-fairfax": {
    whoFor: "Hindu kids and teens, and parents looking for weekend values classes",
    cadence: "Weekly classes on weekends",
    activities: ["Weekly seva projects", "Bhajan practice", "Classes on Hindu values and scripture"],
    howToJoin: ORG_JOIN,
  },
  "c-mexicanos-virginia": {
    whoFor: "Mexicans and Mexican-Americans in Virginia, with posts in Spanish",
    cadence: "Active daily",
    activities: ["Event postings", "Consular paperwork tips", "Business recommendations and holiday celebrations"],
    howToJoin: FACEBOOK_JOIN,
  },
  "c-latino-student-alliance": {
    whoFor: "Latino students and allies, including first-generation college students",
    cadence: "General meetings every other week",
    activities: ["Hispanic Heritage Month programs", "First-gen college workshops", "Cultural showcases"],
    howToJoin: CAMPUS_JOIN,
  },
  "c-folklorico-nova": {
    whoFor: "Beginners of all ages who want to learn regional Mexican dance",
    cadence: "Practice every Sunday afternoon",
    activities: ["Beginner folklórico practice", "Costume fittings", "Regional festival performances"],
    howToJoin: MEETUP_JOIN,
  },
  "c-latinos-in-tech-dc": {
    whoFor: "Engineers, designers, and founders from across Latin America in the DC area",
    cadence: "Monthly talks and mentorship circles",
    activities: ["Tech talks", "Mentorship circles", "Job referrals"],
    howToJoin: MEETUP_JOIN,
  },
  "c-habesha-yp-dc": {
    whoFor: "Ethiopian and Eritrean young professionals in the DMV",
    cadence: "Coffee meetups twice a month",
    activities: ["Coffee ceremonies", "Career panels", "Community service days"],
    howToJoin: MEETUP_JOIN,
  },
  "c-ethiopian-community-center": {
    whoFor: "Ethiopian families, seniors, and newcomers in Maryland",
    cadence: "Office open on weekdays, programs through the week",
    activities: ["Amharic classes for kids", "Senior day programs", "Immigration help desk"],
    howToJoin: ORG_JOIN,
  },
  "c-tewahedo-youth": {
    whoFor: "Ethiopian Orthodox teens and young adults in the DC area",
    cadence: "Weekly fellowship, bigger gatherings on holidays",
    activities: ["Ge'ez liturgy study", "Mezmur choir", "Volunteer days"],
    howToJoin: ORG_JOIN,
  },
  "c-esa-umd": {
    whoFor: "Ethiopian and Ethiopian-American students at Maryland and their friends",
    cadence: "General meetings every other week",
    activities: ["Cultural showcases", "Tutoring", "Mentorship pairing with upperclassmen and alumni"],
    howToJoin: CAMPUS_JOIN,
  },
  "c-psa-gmu": {
    whoFor: "Pakistani students and anyone curious about the culture",
    cadence: "Meetings every other week",
    activities: ["Basant celebrations", "Qawwali nights", "Chai chats and study groups"],
    howToJoin: CAMPUS_JOIN,
  },
  "c-pak-pros-dc": {
    whoFor: "Pakistani-American professionals in medicine, finance, law, and tech",
    cadence: "Quarterly dinners, one career fair each year",
    activities: ["Mentorship dinners", "Annual career fair", "Networking"],
    howToJoin: MEETUP_JOIN,
  },
  "c-urdu-mushaira": {
    whoFor: "Poetry lovers, listeners, and readers, including beginners",
    cadence: "One mushaira evening each month",
    activities: ["Monthly mushaira", "Reading group", "Translation help for heritage listeners"],
    howToJoin: FACEBOOK_JOIN,
  },
  "c-eden-center-community": {
    whoFor: "Vietnamese families and anyone who loves the Eden Center neighborhood",
    cadence: "Active daily",
    activities: ["Tết and Mid-Autumn festival updates", "New bakery and restaurant news", "Neighborhood notices"],
    howToJoin: FACEBOOK_JOIN,
  },
  "c-vsa-gmu": {
    whoFor: "Vietnamese-American students and allies",
    cadence: "General meetings every other week",
    activities: ["Culture show and Tết celebration", "Big-little mentorship program", "Study nights"],
    howToJoin: CAMPUS_JOIN,
  },
  "c-viet-yp-dc": {
    whoFor: "Vietnamese-American professionals in the DC area",
    cadence: "Monthly happy hours and volunteering days",
    activities: ["Happy hours in Clarendon", "Volunteering", "Lunar New Year gala"],
    howToJoin: MEETUP_JOIN,
  },
  "c-chinese-community-center-nova": {
    whoFor: "Chinese families, kids learning Chinese, and seniors",
    cadence: "Classes every weekend, office on weekdays",
    activities: ["Weekend Chinese school", "Calligraphy and guzheng classes", "Lunar New Year gala"],
    howToJoin: ORG_JOIN,
  },
  "c-cssa-gmu": {
    whoFor: "Chinese and Chinese-American students and scholars",
    cadence: "Events monthly, orientation each fall",
    activities: ["Orientation help for new students", "Mid-Autumn gatherings", "Career panels"],
    howToJoin: CAMPUS_JOIN,
  },
  "c-mandarin-exchange-discord": {
    whoFor: "Learners and heritage speakers of Mandarin and Cantonese",
    cadence: "Voice rooms open most evenings",
    activities: ["Structured study rooms", "HSK prep", "Casual voice chats"],
    howToJoin: DISCORD_JOIN,
  },
  "c-colombianos-dmv": {
    whoFor: "Colombians in Washington, Maryland, and Virginia, with posts in Spanish",
    cadence: "Active daily",
    activities: ["Events and soccer meetups", "Local business tips", "20 de Julio celebrations"],
    howToJoin: FACEBOOK_JOIN,
  },
  "c-colombian-pros-dc": {
    whoFor: "Colombian and Colombian-American professionals in policy, engineering, and business",
    cadence: "Monthly breakfast or panel",
    activities: ["Mentoring breakfasts", "Industry panels", "Networking"],
    howToJoin: MEETUP_JOIN,
  },
  "c-salsa-cumbia-nova": {
    whoFor: "Dancers of every level, no partner needed",
    cadence: "Weekly social dance with a beginner lesson",
    activities: ["Beginner lessons", "Social dancing", "Monthly live vallenato"],
    howToJoin: MEETUP_JOIN,
  },
  "c-fil-yp-dc": {
    whoFor: "Filipino-American professionals in the DC area",
    cadence: "Monthly dinners and volunteering",
    activities: ["Kamayan dinners", "Career panels", "Volunteering with Filipino-American nonprofits"],
    howToJoin: MEETUP_JOIN,
  },
  "c-interfaith-newcomers": {
    whoFor: "Newly arrived immigrant families and the neighbors who want to help them",
    cadence: "A few posts each week",
    activities: ["Finding a house of worship nearby", "Rides and translation help", "Welcome visits"],
    howToJoin: NEXTDOOR_JOIN,
  },
  "c-multifaith-family-network": {
    whoFor: "Parents across faith traditions in Loudoun and Fairfax",
    cadence: "Active weekly",
    activities: ["Holiday potluck invitations", "Carpools to religious school", "Halal, kosher, and vegetarian caterer tips"],
    howToJoin: NEXTDOOR_JOIN,
  },
  "c-new-to-nova": {
    whoFor: "Anyone who just moved to the DC area",
    cadence: "Very active, many posts daily",
    activities: ["Furniture swaps", "School district questions", "Where-to-find-it recommendations"],
    howToJoin: NEXTDOOR_JOIN,
  },
  "c-global-neighbors-tysons": {
    whoFor: "Immigrant and first-generation neighbors around Tysons and Vienna",
    cadence: "A few posts each week, monthly meetups",
    activities: ["Potlucks", "Language-exchange nights", "Kids' playdates"],
    howToJoin: NEXTDOOR_JOIN,
  },
  "c-firstgen-discord": {
    whoFor: "First-generation and immigrant-family college students",
    cadence: "Study rooms open most evenings",
    activities: ["Study rooms", "FAFSA and aid help", "A channel for questions with no one at home to ask"],
    howToJoin: DISCORD_JOIN,
  },
  "c-immigrant-professionals-discord": {
    whoFor: "First- and second-generation professionals",
    cadence: "Active daily",
    activities: ["Work-authorization questions", "Resume swaps", "Industry-specific channels"],
    howToJoin: DISCORD_JOIN,
  },
  "c-world-culture-discord": {
    whoFor: "Anyone who wants to share or learn music, dance, and celebration traditions",
    cadence: "Weekly dance tutorial nights",
    activities: ["Dance tutorials", "Music sharing", "Festival Q&A"],
    howToJoin: DISCORD_JOIN,
  },
};

export function getCommunityDetail(id: string): CommunityDetail | undefined {
  return COMMUNITY_DETAILS[id];
}
