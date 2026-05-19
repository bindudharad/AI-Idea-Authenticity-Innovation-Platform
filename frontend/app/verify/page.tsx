type VerifyPageProps = {
  searchParams?: {
    idea?: string;
  };
};

export default function VerifyPage({ searchParams }: VerifyPageProps) {
  const idea = searchParams?.idea ?? "Idea not provided";

  return (
    <div className="flex min-h-screen items-center justify-center bg-black p-8 text-white">
      <div className="max-w-xl rounded-xl border border-white/10 bg-white/5 p-8">
        <h1 className="mb-4 text-2xl font-bold">Idea Verification</h1>
        <p className="mb-4 text-slate-300">This idea was analyzed by the AI Innovation Engine.</p>

        <div className="rounded-lg border border-white/10 bg-black/40 p-4">
          <p className="text-sm text-slate-400">Verified Idea</p>
          <p className="text-lg font-semibold">{idea}</p>
        </div>

        <p className="mt-6 text-sm text-slate-400">Verified by AI Idea Authenticity Platform</p>
      </div>
    </div>
  );
}
