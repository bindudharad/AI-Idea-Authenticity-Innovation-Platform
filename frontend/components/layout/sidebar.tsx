"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { NAV_ITEMS, isNavigationPathActive } from "@/config/navigation";
import { useNavigation } from "@/context/navigation-context";
import { TEAM_VORTEX_ICON, imageWithVersion } from "@/lib/branding";
import { clearAuthSession, readAuthUser, subscribeAuthSession } from "@/services/auth-session";

function SidebarItem({
  href,
  label,
  Icon,
  active,
  compact = false,
}: {
  href: string;
  label: string;
  Icon: LucideIcon;
  active: boolean;
  compact?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      title={compact ? label : undefined}
      className={clsx(
        "menu-item group relative flex min-h-11 items-center rounded-xl border-l-[3px] border-l-transparent text-sm font-medium transition-all duration-200 ease-out active:scale-[0.98]",
        compact ? "justify-center px-2 py-2" : "gap-3 px-3 py-2.5",
        active
          ? "active bg-emerald-400/12 text-white shadow-[0_0_24px_rgba(34,197,94,0.08)]"
          : "text-slate-300 hover:translate-x-1 hover:bg-white/[0.05] hover:text-white",
      )}
      data-cursor="interactive"
    >
      <Icon
        className={clsx(
          "h-5 w-5 flex-shrink-0 transition-all duration-200",
          active ? "text-emerald-300 drop-shadow-[0_0_8px_rgba(34,197,94,0.25)]" : "text-slate-400 group-hover:scale-[1.06] group-hover:text-white",
        )}
      />
      {compact ? null : <span className="truncate text-slate-200">{label}</span>}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname() ?? "/";
  const router = useRouter();
  const { isSidebarOpen, openSidebar, closeSidebar, desktopSidebarWidth } = useNavigation();
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const syncUser = () => {
      setUserName(readAuthUser()?.full_name ?? null);
    };

    syncUser();
    return subscribeAuthSession(syncUser);
  }, []);

  return (
    <aside
      className="sidebar z-40 flex h-screen flex-col overflow-hidden border-r border-white/10 bg-[rgba(10,15,30,0.75)] backdrop-blur-[20px] transition-[width] duration-300 ease-in-out"
      style={{ width: `${desktopSidebarWidth}px` }}
    >
      <div
        className={clsx(
          "flex h-16 items-center border-b border-white/10",
          isSidebarOpen ? "justify-between px-4" : "justify-center px-2",
        )}
      >
        {isSidebarOpen ? (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={closeSidebar}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-slate-300 transition-all duration-200 hover:scale-[1.03] hover:bg-white/[0.08] hover:text-white active:scale-[0.97]"
              aria-label="Close sidebar"
              data-cursor="interactive"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-3 rounded-2xl border border-cyan-300/12 bg-cyan-400/[0.05] px-3 py-2 shadow-[0_0_24px_rgba(34,211,238,0.08)]">
              <Image src={imageWithVersion(TEAM_VORTEX_ICON)} alt="Platform logo" width={24} height={24} className="h-6 w-6 object-contain" />
              <span className="truncate text-sm font-medium tracking-[0.08em] text-slate-100">AI Platform</span>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={openSidebar}
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-300/12 bg-cyan-400/[0.05] transition-all duration-200 hover:scale-[1.08] hover:border-cyan-300/20 hover:bg-cyan-400/[0.08] active:scale-[0.97]"
            aria-label="Open sidebar"
            data-cursor="interactive"
          >
            <Image src={imageWithVersion(TEAM_VORTEX_ICON)} alt="Platform logo" width={28} height={28} className="h-7 w-7 object-contain" />
          </button>
        )}
      </div>

      {isSidebarOpen ? (
        <nav className="flex flex-1 flex-col gap-3 overflow-hidden px-3 py-4">
          {NAV_ITEMS.map((item) => (
            <SidebarItem
              key={item.label}
              href={item.href}
              label={item.label}
              Icon={item.icon}
              active={isNavigationPathActive(pathname, item.href)}
            />
          ))}
        </nav>
      ) : (
        <nav className="flex flex-1 flex-col items-center gap-3 overflow-hidden px-2 py-4">
          {NAV_ITEMS.map((item) => (
            <SidebarItem
              key={item.label}
              href={item.href}
              label={item.label}
              Icon={item.icon}
              active={isNavigationPathActive(pathname, item.href)}
              compact
            />
          ))}
        </nav>
      )}

      {isSidebarOpen ? (
        <div className="border-t border-white/10 px-3 py-4">
          {userName ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
              <p className="text-xs font-semibold text-white">{userName.split(" ")[0]}</p>
              <button
                type="button"
                onClick={() => {
                  clearAuthSession();
                  router.replace("/login");
                  router.refresh();
                }}
                className="mt-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400 transition hover:text-red-300"
                data-cursor="interactive"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/login"
                className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-center text-xs font-semibold uppercase tracking-[0.14em] text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
                data-cursor="interactive"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-3 py-2 text-center text-xs font-bold uppercase tracking-[0.14em] text-[#020617] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                data-cursor="interactive"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      ) : null}
    </aside>
  );
}
