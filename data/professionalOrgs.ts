import type { HeritageId, ProfessionId } from "@/types";

/**
 * Real, well-known professional associations that run chapters, mentorship,
 * and networking for specific communities. These are organizations, never
 * named private individuals: they are the honest way to "find a real person
 * like this mentor", since the mentor profiles in the demo are examples.
 */
export type OrgAudience = "black" | "latino" | "asian" | "south-asian" | "filipino" | "general";

export interface ProfessionalOrg {
  name: string;
  url: string;
  blurb: string;
  audience: OrgAudience;
  professions: ProfessionId[];
}

const TECH: ProfessionId[] = ["software-engineering", "data-science", "engineering"];
const HEALTH: ProfessionId[] = ["medicine", "nursing"];

export const PROFESSIONAL_ORGS: ProfessionalOrg[] = [
  { name: "National Society of Black Engineers", url: "https://www.nsbe.org", blurb: "Chapters at universities and in cities, with mentoring and career fairs.", audience: "black", professions: TECH },
  { name: "Society of Hispanic Professional Engineers", url: "https://shpe.org", blurb: "Student and professional chapters, scholarships, and an annual convention.", audience: "latino", professions: TECH },
  { name: "Society of Asian Scientists and Engineers", url: "https://www.saseconnect.org", blurb: "Mentoring, career development, and local chapters for Asian heritage STEM students and professionals.", audience: "asian", professions: [...TECH, "education"] },
  { name: "Student National Medical Association", url: "https://snma.org", blurb: "Mentorship and pipeline programs for Black and underrepresented medical students.", audience: "black", professions: HEALTH },
  { name: "Latino Medical Student Association", url: "https://lmsa.net", blurb: "Mentoring and community health programs for Latino medical students.", audience: "latino", professions: HEALTH },
  { name: "Asian Pacific American Medical Student Association", url: "https://apamsa.org", blurb: "Mentorship, advocacy, and community for Asian and Pacific Islander medical students.", audience: "asian", professions: HEALTH },
  { name: "American Association of Physicians of Indian Origin", url: "https://aapiusa.org", blurb: "A large physician network with mentoring and local chapters.", audience: "south-asian", professions: HEALTH },
  { name: "Association of Pakistani-descent Physicians of North America", url: "https://appna.org", blurb: "Mentoring and networking for physicians and trainees of Pakistani descent.", audience: "south-asian", professions: HEALTH },
  { name: "National Black Nurses Association", url: "https://www.nbna.org", blurb: "Chapters across the country with scholarships and leadership programs.", audience: "black", professions: ["nursing"] },
  { name: "National Association of Hispanic Nurses", url: "https://nahnnet.org", blurb: "Mentorship and scholarships for Hispanic nurses and nursing students.", audience: "latino", professions: ["nursing"] },
  { name: "Philippine Nurses Association of America", url: "https://www.pnaa.net", blurb: "Chapters nationwide supporting Filipino nurses and nursing students.", audience: "filipino", professions: ["nursing"] },
  { name: "Ascend Pan-Asian Leaders", url: "https://www.ascendleadership.org", blurb: "Leadership development and networking for Pan-Asian professionals.", audience: "asian", professions: ["business", "finance", "public-policy"] },
  { name: "National Black MBA Association", url: "https://nbmbaa.org", blurb: "Local chapters, mentoring, and an annual career expo.", audience: "black", professions: ["business", "finance"] },
  { name: "Prospanica", url: "https://www.prospanica.org", blurb: "The Association of Hispanic MBAs and professionals, with local chapters.", audience: "latino", professions: ["business", "finance"] },
  { name: "TiE Global", url: "https://www.tie.org", blurb: "A network for entrepreneurs with chapters worldwide, rooted in South Asian founders.", audience: "south-asian", professions: ["business", "software-engineering"] },
  { name: "Hispanic National Bar Association", url: "https://hnba.com", blurb: "Mentoring and networking for Latino lawyers and law students.", audience: "latino", professions: ["law", "public-policy"] },
  { name: "National Asian Pacific American Bar Association", url: "https://www.napaba.org", blurb: "Mentorship and advocacy for Asian Pacific American attorneys.", audience: "asian", professions: ["law", "public-policy"] },
  { name: "National Bar Association", url: "https://www.nationalbar.org", blurb: "The nation's oldest national association of Black attorneys and judges.", audience: "black", professions: ["law", "public-policy"] },
  { name: "Congressional Hispanic Caucus Institute", url: "https://www.chci.org", blurb: "Internships and leadership programs for Latino students and young professionals.", audience: "latino", professions: ["public-policy", "law"] },
  { name: "Asian Pacific American Institute for Congressional Studies", url: "https://www.apaics.org", blurb: "Fellowships and internships for Asian Pacific American students in public service.", audience: "asian", professions: ["public-policy"] },
  { name: "Congressional Black Caucus Foundation", url: "https://www.cbcfinc.org", blurb: "Fellowships and leadership programs in public policy.", audience: "black", professions: ["public-policy"] },
  { name: "National Association of Black Journalists", url: "https://www.nabj.org", blurb: "Mentoring, student chapters, and an annual convention.", audience: "black", professions: ["arts-media"] },
  { name: "National Association of Hispanic Journalists", url: "https://nahj.org", blurb: "Mentorship and training for Latino journalists and students.", audience: "latino", professions: ["arts-media"] },
  { name: "Asian American Journalists Association", url: "https://www.aaja.org", blurb: "Chapters and mentoring for Asian American and Pacific Islander journalists.", audience: "asian", professions: ["arts-media"] },
  { name: "National Organization of Minority Architects", url: "https://noma.net", blurb: "Chapters and student programs supporting minority architects.", audience: "black", professions: ["architecture"] },
  { name: "AIGA, the professional association for design", url: "https://www.aiga.org", blurb: "Local chapters, mentoring, and events for designers.", audience: "general", professions: ["product-design", "arts-media", "architecture"] },
  { name: "National Association of Social Workers", url: "https://www.socialworkers.org", blurb: "Local chapters, career resources, and continuing education.", audience: "general", professions: ["social-work"] },
  { name: "/dev/color", url: "https://www.devcolor.org", blurb: "A community and mentoring network for Black software engineers.", audience: "black", professions: ["software-engineering", "data-science"] },
  { name: "Blacks in Technology", url: "https://www.blacksintechnology.net", blurb: "A global community with local chapters for Black technologists.", audience: "black", professions: ["software-engineering", "data-science", "product-design"] },
  { name: "Techqueria", url: "https://www.techqueria.org", blurb: "A community for Latinx tech professionals with local meetups.", audience: "latino", professions: ["software-engineering", "data-science", "product-design"] },
  { name: "Black in AI", url: "https://blackinai.org", blurb: "Mentoring and community for Black researchers and practitioners in AI.", audience: "black", professions: ["data-science"] },
  { name: "LatinX in AI", url: "https://www.latinxinai.org", blurb: "Mentoring and community for Latinx people working in AI.", audience: "latino", professions: ["data-science"] },
  { name: "National Association of Black Accountants", url: "https://www.nabainc.org", blurb: "Student and professional chapters for Black accounting and finance professionals.", audience: "black", professions: ["finance"] },
  { name: "ALPFA", url: "https://www.alpfa.org", blurb: "The Association of Latino Professionals for America, with chapters in finance and accounting.", audience: "latino", professions: ["finance", "business"] },
  { name: "National Alliance of Black School Educators", url: "https://www.nabse.org", blurb: "Networking and mentoring for Black educators and school leaders.", audience: "black", professions: ["education"] },
  { name: "Association for Computing Machinery", url: "https://www.acm.org", blurb: "Student and professional chapters, with mentoring and learning resources.", audience: "general", professions: ["software-engineering", "data-science"] },
  { name: "IEEE", url: "https://www.ieee.org", blurb: "Student branches and local sections for electrical and computer engineers.", audience: "general", professions: ["software-engineering", "engineering"] },
  { name: "American Society of Mechanical Engineers", url: "https://www.asme.org", blurb: "Local sections and student chapters for mechanical engineers.", audience: "general", professions: ["engineering"] },
  { name: "American Society of Civil Engineers", url: "https://www.asce.org", blurb: "Local sections and student chapters for civil engineers.", audience: "general", professions: ["engineering"] },
  { name: "AI4ALL", url: "https://ai-4-all.org", blurb: "Programs that open doors to AI for students from underrepresented backgrounds.", audience: "general", professions: ["data-science"] },
  { name: "American Medical Association", url: "https://www.ama-assn.org", blurb: "Resources and student sections for aspiring and practicing physicians.", audience: "general", professions: ["medicine"] },
  { name: "Association of American Medical Colleges", url: "https://www.aamc.org", blurb: "Guidance for pre-med students on applying to medical school.", audience: "general", professions: ["medicine"] },
  { name: "American Nurses Association", url: "https://www.nursingworld.org", blurb: "Career resources and state chapters for nurses.", audience: "general", professions: ["nursing"] },
  { name: "SCORE", url: "https://www.score.org", blurb: "Free mentoring from experienced business owners, with local chapters.", audience: "general", professions: ["business", "finance"] },
  { name: "American Bar Association", url: "https://www.americanbar.org", blurb: "Law student programs and mentoring through local bar associations.", audience: "general", professions: ["law"] },
  { name: "Partnership for Public Service", url: "https://ourpublicservice.org", blurb: "Fellowships and career guidance for people entering government.", audience: "general", professions: ["public-policy"] },
  { name: "National Education Association", url: "https://www.nea.org", blurb: "Resources and local affiliates for teachers and education professionals.", audience: "general", professions: ["education"] },
  { name: "Society of Professional Journalists", url: "https://www.spj.org", blurb: "Student and professional chapters with mentoring for journalists.", audience: "general", professions: ["arts-media"] },
  { name: "American Institute of Architects", url: "https://www.aia.org", blurb: "Local chapters and student programs for architects.", audience: "general", professions: ["architecture"] },
];

const AUDIENCE_BY_HERITAGE: Record<HeritageId, OrgAudience[]> = {
  nigerian: ["black"],
  ethiopian: ["black"],
  ghanaian: ["black"],
  jamaican: ["black"],
  mexican: ["latino"],
  colombian: ["latino"],
  salvadoran: ["latino"],
  peruvian: ["latino"],
  chinese: ["asian"],
  vietnamese: ["asian"],
  korean: ["asian"],
  filipino: ["asian", "filipino"],
  indian: ["asian", "south-asian"],
  pakistani: ["asian", "south-asian"],
  bangladeshi: ["asian", "south-asian"],
  "sri-lankan": ["asian", "south-asian"],
};

/** Orgs for a profession, those matching the person's background first, then general ones. */
export function orgsFor(profession: ProfessionId, heritages: HeritageId[], limit = 4): ProfessionalOrg[] {
  const wanted = new Set<OrgAudience>(heritages.flatMap((h) => AUDIENCE_BY_HERITAGE[h] ?? []));
  const forProfession = PROFESSIONAL_ORGS.filter((o) => o.professions.includes(profession));
  const matching = forProfession.filter((o) => wanted.has(o.audience));
  const general = forProfession.filter((o) => o.audience === "general");
  return [...matching, ...general].slice(0, limit);
}
