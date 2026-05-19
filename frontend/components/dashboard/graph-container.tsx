import { ReactNode } from "react";

import { Card } from "@/ui/card";

type GraphContainerProps = {
  eyebrow: string;
  title: string;
  copy?: string;
  actions?: ReactNode;
  children: ReactNode;
};

export function GraphContainer({ eyebrow, title, copy, actions, children }: GraphContainerProps) {
  return (
    <Card className="panel-hover overflow-hidden p-0">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 px-6 py-5">
        <div>
          <p className="panel-heading">{eyebrow}</p>
          <h2 className="panel-subtitle">{title}</h2>
          {copy ? <p className="mt-3 text-sm leading-7 text-slate-300">{copy}</p> : null}
        </div>
        {actions}
      </div>
      <div className="px-4 py-4 md:px-6 md:py-6">{children}</div>
    </Card>
  );
}
