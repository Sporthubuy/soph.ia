export default function ReviewLoading() {
  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-6 animate-pulse">
      <div className="h-8 w-48 rounded bg-[var(--sky-3)]" />
      <div className="h-4 w-72 rounded bg-[var(--sky-3)]" />
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-40 rounded-xl bg-[var(--sky-2)] border border-[var(--edge)]" />
        ))}
      </div>
    </div>
  );
}
