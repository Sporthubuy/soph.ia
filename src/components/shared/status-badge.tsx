import {
  TriangleAlert,
  LoaderCircle,
  Send,
  IterationCw,
  CircleCheck,
  CircleX,
  Clock,
  type LucideIcon,
} from "lucide-react";

/**
 * Status pill — icon + label on a hue-tinted gradient with a soft bottom glow.
 * Matches the reference badge set (Pending / In progress / Submitted / In review
 * / Success / Failed / Expired). Domain statuses map onto these tones.
 */

export type StatusVariant =
  | "pending"
  | "in-progress"
  | "submitted"
  | "in-review"
  | "success"
  | "failed"
  | "expired";

type Tone = { label: string; icon: LucideIcon; text: string; rgb: string };

const TONES: Record<StatusVariant, Tone> = {
  pending: { label: "Pending", icon: TriangleAlert, text: "#fbbf24", rgb: "245 158 11" },
  "in-progress": { label: "In progress", icon: LoaderCircle, text: "#60a5fa", rgb: "59 130 246" },
  submitted: { label: "Submitted", icon: Send, text: "#818cf8", rgb: "99 102 241" },
  "in-review": { label: "In review", icon: IterationCw, text: "#facc15", rgb: "234 179 8" },
  success: { label: "Success", icon: CircleCheck, text: "#4ade80", rgb: "34 197 94" },
  failed: { label: "Failed", icon: CircleX, text: "#f87171", rgb: "239 68 68" },
  expired: { label: "Expired", icon: Clock, text: "#94a3b8", rgb: "148 163 184" },
};

/** Map the platform's domain statuses onto the badge tones. */
const ALIASES: Record<string, StatusVariant> = {
  approved: "success",
  verified: "success",
  active: "success",
  deployed: "success",
  done: "success",
  proposed: "in-review",
  review: "in-review",
  in_review: "in-review",
  draft: "pending",
  pending: "pending",
  running: "in-progress",
  in_progress: "in-progress",
  building: "in-progress",
  submitted: "submitted",
  rejected: "failed",
  failed: "failed",
  error: "failed",
  archived: "expired",
  idle: "expired",
  expired: "expired",
};

export const resolveVariant = (status: string): StatusVariant =>
  ALIASES[status.toLowerCase().trim()] ?? "pending";

const SIZES = {
  sm: { pad: "px-2 py-0.5 text-[11px]", gap: "gap-1", icon: 12 },
  md: { pad: "px-2.5 py-1 text-[13px]", gap: "gap-1.5", icon: 14 },
} as const;

export const StatusBadge = ({
  status,
  variant,
  label,
  size = "md",
  className,
}: {
  /** A domain status string (e.g. "approved") — mapped to a tone. */
  status?: string;
  /** Or set the tone directly. */
  variant?: StatusVariant;
  /** Override the displayed text (defaults to the status/tone label). */
  label?: string;
  size?: keyof typeof SIZES;
  className?: string;
}) => {
  const v = variant ?? resolveVariant(status ?? "pending");
  const t = TONES[v];
  const s = SIZES[size];
  const Glyph = t.icon;
  const text = label ?? (status ? status : t.label);

  return (
    <span
      className={`inline-flex items-center ${s.gap} ${s.pad} rounded-[10px] border font-medium leading-none capitalize ${className ?? ""}`}
      style={{
        color: t.text,
        borderColor: `rgb(${t.rgb} / 0.28)`,
        background: `linear-gradient(180deg, rgb(${t.rgb} / 0.05), rgb(${t.rgb} / 0.16))`,
        boxShadow: `inset 0 -8px 14px -9px rgb(${t.rgb} / 0.5)`,
      }}
    >
      <Glyph size={s.icon} strokeWidth={2} className="flex-shrink-0" aria-hidden />
      {text}
    </span>
  );
};
