export default function ProjectsLoading() {
  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 animate-pulse">
      <div className="flex justify-between gap-4">
        <div className="h-8 w-40 rounded bg-[var(--sky-3)]" />
        <div className="h-10 w-36 rounded-lg bg-[var(--sky-3)]" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-36 rounded-lg bg-[var(--sky-2)] border border-[var(--edge)]" />
        ))}
      </div>
    </div>
  );
}
