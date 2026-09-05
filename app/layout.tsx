import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppStateProvider } from "@/components/providers/AppStateProvider";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { AppShell } from "@/components/layout/AppShell";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Onclave",
    template: "%s · Onclave",
  },
  description:
    "Onclave helps diaspora communities connect with their people, explore and preserve their culture, and find professional mentorship.",
  applicationName: "Onclave",
  appleWebApp: { capable: true, title: "Onclave", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#FFFDF2",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-cream text-brown">
        <AppStateProvider>
          <ToastProvider>
            <AppShell>{children}</AppShell>
          </ToastProvider>
        </AppStateProvider>
      </body>
    </html>
  );
}
