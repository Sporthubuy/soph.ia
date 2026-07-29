export default function KnowledgeLoading() {
  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 animate-pulse">
      <div className="flex justify-between gap-4">
        <div className="h-8 w-48 rounded bg-[#e2e8f0]" />
        <div className="h-10 w-36 rounded-lg bg-[#e2e8f0]" />
      </div>
      <div className="h-12 rounded-lg bg-white border border-[#e2e8f0]" />
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 rounded-lg bg-white border border-[#e2e8f0]" />
        ))}
      </div>
    </div>
  );
}
