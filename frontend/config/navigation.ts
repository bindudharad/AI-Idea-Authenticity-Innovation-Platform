import {
  BarChart3,
  CircleDollarSign,
  Compass,
  FileSearch,
  Home,
  MapPinned,
} from "lucide-react";

export const NAV_ITEMS = [
  { label: "Home", href: "/", icon: Home },
  { label: "Dashboard", href: "/dashboard", icon: BarChart3 },
  { label: "Analysis", href: "/analysis", icon: FileSearch },
  { label: "Market", href: "/market", icon: Compass },
  { label: "Location", href: "/location", icon: MapPinned },
  { label: "Funding", href: "/investor", icon: CircleDollarSign },
] as const;

export function isNavigationPathActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
