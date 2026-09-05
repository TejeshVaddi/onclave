import type { Metadata } from "next";
import { MentorFinder } from "@/components/profession/MentorFinder";

export const metadata: Metadata = { title: "Profession" };

export default function ProfessionPage() {
  return <MentorFinder />;
}
