import { ReactNode } from "react";

import { Card } from "@/ui/card";

type TimelineCardProps = {
  eyebrow: string;
  title: string;
  children: ReactNode;
};

export function TimelineCard({ eyebrow, title, children }: TimelineCardProps) {
  return (
    <Card className="panel-hover">
      <p className="panel-heading">{eyebrow}</p>
      <h2 className="panel-subtitle">{title}</h2>
      <div className="mt-6">{children}</div>
    </Card>
  );
}
