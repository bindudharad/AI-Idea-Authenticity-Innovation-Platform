"use client";

import { ReactNode } from "react";

export function RouteTransition({ children }: { children: ReactNode }) {
  return <div className="transition-opacity duration-200">{children}</div>;
}
