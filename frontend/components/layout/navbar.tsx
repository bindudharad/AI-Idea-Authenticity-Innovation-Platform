"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, Send } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import { motion } from "framer-motion";

import { NAV_ITEMS, isNavigationPathActive } from "@/config/navigation";
import { imageWithVersion, TEAM_VORTEX_ICON } from "@/lib/branding";
import { clearAuthSession, readAuthUser, readAccessToken, subscribeAuthSession } from "@/services/auth-session";
import { getNotifications, markNotificationRead } from "@/services/idea-service";
import { getSocketClient } from "@/services/socket-client";
import { useAppStore } from "@/store/useAppStore";
import type { NotificationResponse } from "@/types/api";

export function Navbar() {
  const pathname = usePathname() ?? "/";
  const router = useRouter();
  const [userName, setUserName] = useState<string | null>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notifications = useAppStore((state) => state.notifications);
  const setNotifications = useAppStore((state) => state.setNotifications);
  const prependNotification = useAppStore((state) => state.prependNotification);
  const markReadInStore = useAppStore((state) => state.markNotificationRead);
  const unreadCount = notifications.filter((item) => !item.read).length;

  useEffect(() => {
    const syncUser = () => {
      setUserName(readAuthUser()?.full_name ?? null);
    };

    syncUser();
    return subscribeAuthSession(syncUser);
  }, []);

  useEffect(() => {
    let active = true;

    void (async () => {
      const token = readAccessToken();
      const user = readAuthUser();
      if (!token || !user) {
        setNotifications([]);
        return;
      }

      try {
        const response = await getNotifications(token);
        if (active) {
          setNotifications(response);
        }
      } catch {
        if (active) {
          setNotifications([]);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [setNotifications]);

  useEffect(() => {
    const socket = getSocketClient();
    const user = readAuthUser();
    if (!socket || !user) {
      return;
    }

    socket.emit("notification:join", user.id);

    const handleNotification = (payload: {
      notificationId?: string;
      text?: string;
      type?: string;
      teamId?: string | null;
      ideaId?: number | null;
      createdAt?: string;
    }) => {
      const nextNotification: NotificationResponse = {
        id: payload.notificationId ?? `ephemeral-${Date.now()}`,
        text: payload.text ?? "New team event",
        type: payload.type ?? "info",
        read: false,
        team_id: payload.teamId ?? null,
        idea_id: payload.ideaId ?? null,
        created_at: payload.createdAt ?? new Date().toISOString(),
      };
      prependNotification(nextNotification);
    };

    socket.on("notification:new", handleNotification);
    return () => {
      socket.off("notification:new", handleNotification);
    };
  }, [prependNotification]);

  async function handleNotificationClick(notificationId: string) {
    markReadInStore(notificationId);
    const token = readAccessToken();
    if (!token) {
      return;
    }

    try {
      await markNotificationRead(notificationId, token);
    } catch {
      // keep optimistic state
    }
  }

  return (
    <header className="navbar z-50 h-[70px] shrink-0 border-b border-white/10 bg-[rgba(10,15,30,0.75)] backdrop-blur-xl">
      <div className="navbar-inner h-full">
        <div className="nav-left">
          <Link
            href="/"
            className="group flex min-w-0 items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 backdrop-blur-xl transition-all duration-200 hover:scale-[1.01] hover:border-cyan-200/18 hover:bg-white/[0.05]"
            data-cursor="interactive"
          >
            <div className="ai-core-orb flex h-9 w-9 items-center justify-center transition-transform duration-200 group-hover:scale-[1.05]">
              <Image
                src={imageWithVersion(TEAM_VORTEX_ICON)}
                alt="AI platform logo"
                width={28}
                height={28}
                className="h-7 w-7 object-contain opacity-95"
              />
            </div>
            <span className="nav-title hidden truncate text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-300 sm:block">
              AI Innovation Intelligence Platform
            </span>
          </Link>
        </div>

        <nav className="nav-center flex">
          {NAV_ITEMS.map((item) => {
            const isActive = isNavigationPathActive(pathname, item.href);

            return (
              <Link
                key={item.label}
                href={item.href}
                className={clsx(
                  "group relative rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 hover:scale-[1.02]",
                  isActive ? "text-cyan-300" : "text-slate-400 hover:text-white",
                )}
                data-cursor="interactive"
              >
                <span className="relative z-10 whitespace-nowrap">{item.label}</span>
                {isActive ? (
                  <motion.span
                    initial={false}
                    layoutId="navbar-active-underline"
                    className="absolute inset-x-3 -bottom-[13px] h-[2px] rounded-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-100"
                    transition={{ type: "spring", stiffness: 360, damping: 32 }}
                  />
                ) : (
                  <span className="absolute inset-x-3 -bottom-[13px] h-[2px] rounded-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-0 transition-all duration-200 group-hover:opacity-60" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="nav-right">
          <div className="relative">
            <button
              type="button"
              onClick={() => setNotificationsOpen((open) => !open)}
              className="relative rounded-full p-2 text-slate-400 transition-all duration-300 hover:scale-[1.03] hover:bg-white/5 hover:text-cyan-300 active:scale-[0.98]"
              aria-label="Notifications"
              data-cursor="interactive"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 ? (
                <span className="absolute -right-0.5 -top-0.5 flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full bg-cyan-400 px-1 text-[10px] font-bold text-slate-950">
                  {Math.min(unreadCount, 9)}
                </span>
              ) : (
                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-cyan-400/60" />
              )}
            </button>

            {notificationsOpen ? (
              <div className="absolute right-0 top-12 z-50 w-[340px] rounded-3xl border border-white/10 bg-[#06111f]/95 p-3 shadow-[0_24px_60px_rgba(2,6,23,0.55)] backdrop-blur-xl">
                <div className="flex items-center justify-between px-2 py-2">
                  <p className="text-sm font-semibold text-white">Notifications</p>
                  <span className="text-[11px] uppercase tracking-[0.16em] text-slate-500">{unreadCount} unread</span>
                </div>
                <div className="max-h-[360px] space-y-2 overflow-y-auto pr-1">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <button
                        key={notification.id}
                        type="button"
                        onClick={() => void handleNotificationClick(notification.id)}
                        className={`w-full rounded-2xl border p-3 text-left transition ${
                          notification.read
                            ? "border-white/10 bg-black/15"
                            : "border-cyan-300/20 bg-cyan-400/10"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm leading-6 text-white">{notification.text}</p>
                          {!notification.read ? <span className="mt-1 h-2 w-2 rounded-full bg-cyan-300" /> : null}
                        </div>
                        <p className="mt-2 text-[11px] uppercase tracking-[0.16em] text-slate-500">
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                      </button>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-white/12 bg-white/[0.03] p-4 text-sm text-slate-300">
                      No notifications yet.
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>

          <div className="hidden h-5 w-px bg-white/10 sm:block" />

          {userName ? (
            <div className="flex items-center gap-3">
              <Link href="/profile" className="group flex items-center gap-2" data-cursor="interactive">
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-cyan-300/20 bg-white/[0.04] text-[10px] font-bold text-cyan-300 ring-1 ring-cyan-300/10 transition-all duration-300 group-hover:border-cyan-300/40">
                  {userName.substring(0, 2).toUpperCase()}
                </span>
                <span className="hidden text-sm font-medium text-slate-300 transition group-hover:text-white sm:block">
                  {userName.split(" ")[0]}
                </span>
              </Link>
              <button
                type="button"
                onClick={() => {
                  clearAuthSession();
                  router.replace("/login");
                  router.refresh();
                }}
                className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 transition hover:text-red-300"
                data-cursor="interactive"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 transition hover:bg-white/5 hover:text-white"
                data-cursor="interactive"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-3.5 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#020617] transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
                data-cursor="interactive"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
