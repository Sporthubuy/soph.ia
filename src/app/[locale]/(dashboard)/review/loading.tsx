export default function ReviewLoading() {
  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-6 animate-pulse">
      <div className="h-8 w-48 rounded bg-[#e2e8f0]" />
      <div className="h-4 w-72 rounded bg-[#e2e8f0]" />
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-40 rounded-xl bg-white border border-[#e2e8f0]" />
        ))}
      </div>
    </div>
  );
}
