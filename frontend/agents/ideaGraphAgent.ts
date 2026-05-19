export async function runIdeaGraphAgent(input: {
  ideaName: string;
  technologies: string[];
  patents: Array<{ title: string; patentNumber: string; applicant: string }>;
  githubRepos: Array<{ name: string; description: string }>;
  wikipedia: Array<{ title: string; snippet: string }>;
}) {
  const nodes: Array<{ id: string; type: string; label: string; description: string }> = [];
  const edges: Array<{ source: string; target: string; weight: number; label: string }> = [];

  const addNode = (id: string, type: string, label: string, description: string) => {
    if (!nodes.find((node) => node.id === id)) {
      nodes.push({ id, type, label, description });
    }
  };

  const connect = (source: string, target: string, weight: number) => {
    if (!edges.find((edge) => edge.source === source && edge.target === target)) {
      edges.push({ source, target, weight, label: `${weight}%` });
    }
  };

  addNode("idea-root", "idea", input.ideaName, "User-submitted startup or hackathon concept.");

  input.technologies.slice(0, 5).forEach((technology, index) => {
    const id = `tech-${index}-${slugify(technology)}`;
    addNode(id, "technology", technology, `Core technology signal: ${technology}`);
    connect("idea-root", id, 90 - index * 6);
  });

  input.wikipedia.slice(0, 4).forEach((item, index) => {
    const id = `research-${index}-${slugify(item.title)}`;
    addNode(id, "research", item.title, item.snippet);
    connect("idea-root", id, 82 - index * 5);
  });

  input.patents.slice(0, 4).forEach((item, index) => {
    const id = `patent-${index}-${slugify(item.patentNumber)}`;
    addNode(id, "research", item.title, `${item.applicant} · ${item.patentNumber}`);
    connect("idea-root", id, 78 - index * 4);
  });

  input.githubRepos.slice(0, 4).forEach((item, index) => {
    const id = `repo-${index}-${slugify(item.name)}`;
    addNode(id, "startup", item.name, item.description);
    connect("idea-root", id, 80 - index * 5);
  });

  return { nodes, edges };
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
