import type { Profession } from "@/types";

export const PROFESSIONS: Profession[] = [
  { id: "software-engineering", label: "Software Engineering", industry: "Technology", keywords: ["software", "software engineer", "engineering", "engineer", "developer", "coding", "programming", "computer science", "cs", "tech"] },
  { id: "data-science", label: "Data Science & AI", industry: "Technology", keywords: ["data science", "data scientist", "machine learning", "ai", "artificial intelligence", "analytics", "data"] },
  { id: "product-design", label: "Product & UX Design", industry: "Technology", keywords: ["product design", "ux", "ui", "designer", "product manager", "product management"] },
  { id: "medicine", label: "Medicine", industry: "Healthcare", keywords: ["medicine", "doctor", "physician", "medical", "pre-med", "premed", "md", "surgeon", "pediatrics", "residency"] },
  { id: "nursing", label: "Nursing & Allied Health", industry: "Healthcare", keywords: ["nursing", "nurse", "physical therapy", "pharmacy", "pharmacist", "dentist", "dentistry", "public health"] },
  { id: "business", label: "Business & Entrepreneurship", industry: "Business", keywords: ["business", "entrepreneur", "entrepreneurship", "startup", "founder", "mba", "management"] },
  { id: "finance", label: "Finance & Accounting", industry: "Finance", keywords: ["finance", "banking", "investment", "accounting", "accountant", "cpa", "financial analyst"] },
  { id: "law", label: "Law", industry: "Legal", keywords: ["law", "lawyer", "attorney", "legal", "law school", "paralegal", "immigration"] },
  { id: "public-policy", label: "Government & Public Policy", industry: "Public Sector", keywords: ["policy", "government", "public policy", "politics", "civil service", "foreign service", "diplomacy"] },
  { id: "education", label: "Education & Academia", industry: "Education", keywords: ["education", "teacher", "teaching", "professor", "academia", "phd", "research"] },
  { id: "engineering", label: "Mechanical, Civil & Electrical Engineering", industry: "Engineering", keywords: ["mechanical engineering", "civil engineering", "electrical engineering", "aerospace", "hardware"] },
  { id: "arts-media", label: "Arts, Media & Journalism", industry: "Creative", keywords: ["journalism", "journalist", "film", "filmmaker", "writer", "artist", "media", "creative", "music industry"] },
  { id: "architecture", label: "Architecture & Urban Planning", industry: "Design & Construction", keywords: ["architecture", "architect", "urban planning", "construction"] },
  { id: "social-work", label: "Social Work & Nonprofit", industry: "Nonprofit", keywords: ["social work", "nonprofit", "non-profit", "community organizing", "counseling"] },
];

const byId = new Map(PROFESSIONS.map((p) => [p.id, p]));

export function getProfession(id: string | null | undefined): Profession | undefined {
  return id ? byId.get(id) : undefined;
}

export function professionLabel(id: string | null | undefined): string {
  return getProfession(id)?.label ?? (id ? id : "Not set");
}

export const INDUSTRIES = Array.from(new Set(PROFESSIONS.map((p) => p.industry)));
