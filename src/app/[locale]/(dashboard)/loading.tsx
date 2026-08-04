export default function DashboardLoading() {
  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 animate-pulse">
      <div className="h-8 w-48 rounded bg-[var(--sky-3)]" />
      <div className="h-4 w-72 rounded bg-[var(--sky-3)]" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-3">
          <div className="h-12 rounded-lg bg-[var(--sky-2)] border border-[var(--edge)]" />
          <div className="h-20 rounded-lg bg-[var(--sky-2)] border border-[var(--edge)]" />
          <div className="h-20 rounded-lg bg-[var(--sky-2)] border border-[var(--edge)]" />
          <div className="h-20 rounded-lg bg-[var(--sky-2)] border border-[var(--edge)]" />
        </div>
        <div className="h-64 rounded-lg bg-[var(--sky-2)] border border-[var(--edge)]" />
      </div>
    </div>
  );
}
