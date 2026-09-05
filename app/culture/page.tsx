import type { Metadata } from "next";
import { Suspense } from "react";
import { CultureHub } from "@/components/culture/CultureHub";

export const metadata: Metadata = { title: "Culture" };

export default function CulturePage() {
  return (
    <Suspense fallback={null}>
      <CultureHub />
    </Suspense>
  );
}
