export default function GraphLoading() {
  return (
    <div className="p-4 sm:p-8 max-w-[1600px] mx-auto space-y-6 animate-pulse">
      <div className="h-8 w-56 rounded bg-[#e2e8f0]" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 rounded-lg bg-white border border-[#e2e8f0]" />
        ))}
      </div>
      <div className="h-[min(70vh,640px)] min-h-[360px] rounded-lg bg-white border border-[#e2e8f0]" />
    </div>
  );
}
