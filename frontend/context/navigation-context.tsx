"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type NavigationContextType = {
  activeSection: string;
  setActiveSection: (section: string) => void;
  isSidebarOpen: boolean;
  desktopSidebarWidth: number;
  openSidebar: () => void;
  closeSidebar: () => void;
  scrollToSection: (sectionId: string) => void;
};

export const SIDEBAR_WIDTH = 240;
export const SIDEBAR_COLLAPSED = 80;

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [activeSection, setActiveSection] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const desktopSidebarWidth = isSidebarOpen ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED;

  const getSectionFromPath = useCallback((path: string) => {
    if (path === "/" || path.startsWith("/dashboard")) return "Dashboard";
    if (path.startsWith("/analysis")) return "Analysis";
    if (path.startsWith("/market")) return "Market";
    if (path.startsWith("/blueprint")) return "Build Plan";
    if (path.startsWith("/investor")) return "Funding";
    if (path.startsWith("/team")) return "Team";
    return "";
  }, []);

  useEffect(() => {
    const section = getSectionFromPath(pathname ?? "");
    if (section) {
      setActiveSection(section);
    }
  }, [pathname, getSectionFromPath]);

  useEffect(() => {
    const sections = document.querySelectorAll("section[id]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          const sectionMap: Record<string, string> = {
            Dashboard: "Dashboard",
            Analysis: "Analysis",
            Market: "Market",
            "Build Plan": "Build Plan",
            Funding: "Funding",
            Team: "Team",
          };

          const nextSection = sectionMap[entry.target.id];
          if (nextSection) {
            setActiveSection(nextSection);
          }
        });
      },
      { threshold: 0.5 },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [pathname]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const openSidebar = () => {
    setIsSidebarOpen(true);
  };
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <NavigationContext.Provider
      value={{
        activeSection,
        setActiveSection,
        isSidebarOpen,
        desktopSidebarWidth,
        openSidebar,
        closeSidebar,
        scrollToSection,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }
  return context;
}
