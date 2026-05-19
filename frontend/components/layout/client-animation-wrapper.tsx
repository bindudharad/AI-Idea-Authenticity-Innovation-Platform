"use client";

import { ReactNode } from "react";

export function ClientAnimationWrapper({ children }: { children: ReactNode }) {
  // Loading screens bypassed to fix infinite loading issue
  // Components preserved for future re-enable
  return <>{children}</>;
}
