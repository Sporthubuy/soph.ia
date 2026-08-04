export default function GraphLoading() {
  return (
    <div className="p-4 sm:p-8 max-w-[1600px] mx-auto space-y-6 animate-pulse">
      <div className="h-8 w-56 rounded bg-[var(--sky-3)]" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 rounded-lg bg-[var(--sky-2)] border border-[var(--edge)]" />
        ))}
      </div>
      <div className="h-[min(70vh,640px)] min-h-[360px] rounded-lg bg-[var(--sky-2)] border border-[var(--edge)]" />
    </div>
  );
}
