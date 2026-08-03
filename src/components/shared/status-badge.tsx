import { Badge } from "@/components/ui/badge";

type Status = "verified" | "pending" | "draft" | "archived";

interface StatusBadgeProps {
  status: Status;
  label?: string;
  className?: string;
}

const statusConfig: Record<Status, { label: string; variant: string }> = {
  verified: { label: "Verified", variant: "verified" },
  pending: { label: "Pending Review", variant: "pending" },
  draft: { label: "Draft", variant: "draft" },
  archived: { label: "Archived", variant: "archived" },
};

/**
 * Status Badge Component
 * Per Constellation Design System - Knowledge Unit states
 */
export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  const displayLabel = label || config.label;

  return (
    <Badge variant={config.variant as any} className={className}>
      <span className="inline-block w-2 h-2 rounded-full mr-1 bg-current opacity-80" />
      {displayLabel}
    </Badge>
  );
}

export default StatusBadge;
