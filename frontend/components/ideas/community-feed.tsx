import { communityIdeas } from "@/services/mock-data";
import { CommunityIdea } from "@/types/idea";
import { Badge } from "@/ui/badge";
import { Card } from "@/ui/card";

type CommunityFeedProps = {
  ideas?: CommunityIdea[];
};

export function CommunityFeed({ ideas = communityIdeas }: CommunityFeedProps) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {ideas.map((idea) => (
        <Card key={idea.id}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-lg font-semibold text-white">{idea.title}</p>
              <p className="mt-3 text-sm leading-7 text-slate-300">{idea.description}</p>
            </div>
            <Badge tone="success">{idea.innovation}</Badge>
          </div>
          <div className="mt-5 flex items-center justify-between text-sm text-slate-400">
            <span>{idea.category}</span>
            <span>Popularity {idea.popularity}</span>
          </div>
        </Card>
      ))}
    </div>
  );
}
