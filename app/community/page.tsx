import type { Metadata } from "next";
import { CommunityFinder } from "@/components/community/CommunityFinder";

export const metadata: Metadata = { title: "Community" };

export default function CommunityPage() {
  return <CommunityFinder />;
}
