export default function AgentsLoading() {
  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 animate-pulse">
      <div className="flex justify-between gap-4">
        <div className="h-8 w-32 rounded bg-[var(--sky-3)]" />
        <div className="h-10 w-36 rounded-lg bg-[var(--sky-3)]" />
      </div>
      <div className="h-12 rounded-lg bg-[var(--sky-2)] border border-[var(--edge)]" />
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 rounded-lg bg-[var(--sky-2)] border border-[var(--edge)]" />
        ))}
      </div>
    </div>
  );
}
