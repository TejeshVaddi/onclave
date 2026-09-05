import type { Metadata } from "next";
import { DiscoverySearch } from "@/components/discover/DiscoverySearch";

export const metadata: Metadata = { title: "AI Discovery" };

export default function DiscoverPage() {
  return <DiscoverySearch />;
}
