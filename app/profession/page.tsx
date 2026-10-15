import type { Metadata } from "next";
import { PeopleFinder } from "@/components/profession/PeopleFinder";

export const metadata: Metadata = { title: "Profession" };

export default function ProfessionPage() {
  return <PeopleFinder />;
}
