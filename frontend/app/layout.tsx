import type { Metadata } from "next";
import type { ReactNode } from "react";
import { IBM_Plex_Sans, Sora } from "next/font/google";
import { AppLayoutShell } from "@/components/layout/app-layout-shell";
import { NavigationProvider } from "@/context/navigation-context";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AI Innovation Intelligence Platform",
  description: "SaaS workspace for idea similarity detection, innovation intelligence, market forecasting, and startup-ready planning.",
  icons: {
    icon: "/team/team_vortex_icon.png",
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
      </head>
      <body className={`${sora.variable} ${plexSans.variable} min-h-screen overflow-x-hidden`} suppressHydrationWarning>
        <NavigationProvider>
          <AppLayoutShell>{children}</AppLayoutShell>
        </NavigationProvider>
      </body>
    </html>
  );
}
