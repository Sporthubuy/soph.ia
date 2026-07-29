export default function DashboardLoading() {
  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 animate-pulse">
      <div className="h-8 w-48 rounded bg-[#e2e8f0]" />
      <div className="h-4 w-72 rounded bg-[#e2e8f0]" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-3">
          <div className="h-12 rounded-lg bg-white border border-[#e2e8f0]" />
          <div className="h-20 rounded-lg bg-white border border-[#e2e8f0]" />
          <div className="h-20 rounded-lg bg-white border border-[#e2e8f0]" />
          <div className="h-20 rounded-lg bg-white border border-[#e2e8f0]" />
        </div>
        <div className="h-64 rounded-lg bg-white border border-[#e2e8f0]" />
      </div>
    </div>
  );
}
