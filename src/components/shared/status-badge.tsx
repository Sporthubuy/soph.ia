import {
  TriangleAlert,
  LoaderCircle,
  Send,
  IterationCw,
  CircleCheck,
  CircleX,
  Clock,
  PencilLine,
  type LucideIcon,
} from "lucide-react";

/**
 * Status pill — icon + label on a hue-tinted gradient with a soft bottom glow.
 * Tones come from the Constellation status tokens (--verified / --pending /
 * --draft / --archived / --danger / --azure) so the badge re-skins with the
 * rest of the app. Domain statuses map onto these tones via ALIASES.
 */

export type StatusVariant =
  | "draft"
  | "pending"
  | "in-progress"
  | "submitted"
  | "in-review"
  | "success"
  | "failed"
  | "expired";

type Tone = { label: string; icon: LucideIcon; text: string; rgb: string };

const TONES: Record<StatusVariant, Tone> = {
  draft: { label: "Draft", icon: PencilLine, text: "var(--draft)", rgb: "147 164 196" },
  pending: { label: "Pending", icon: TriangleAlert, text: "var(--pending)", rgb: "251 191 36" },
  "in-progress": { label: "In progress", icon: LoaderCircle, text: "var(--azure)", rgb: "91 155 255" },
  submitted: { label: "Submitted", icon: Send, text: "#818cf8", rgb: "129 140 248" },
  "in-review": { label: "In review", icon: IterationCw, text: "var(--pending)", rgb: "245 158 11" },
  success: { label: "Success", icon: CircleCheck, text: "var(--verified)", rgb: "52 211 153" },
  failed: { label: "Failed", icon: CircleX, text: "var(--danger)", rgb: "251 106 104" },
  expired: { label: "Expired", icon: Clock, text: "var(--archived)", rgb: "91 100 120" },
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
  draft: "draft",
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

export interface StatusBadgeProps {
  /** A domain status string (e.g. "approved") — mapped to a tone. */
  status?: string;
  /** Or set the tone directly. */
  variant?: StatusVariant;
  /** Override the displayed text (defaults to the status/tone label). */
  label?: string;
  size?: keyof typeof SIZES;
  className?: string;
}

export const StatusBadge = ({
  status,
  variant,
  label,
  size = "md",
  className,
}: StatusBadgeProps) => {
  const v = variant ?? resolveVariant(status ?? "pending");
  const tone = TONES[v];
  const s = SIZES[size];
  const Glyph = tone.icon;
  const text = label ?? status ?? tone.label;

  return (
    <span
      className={`inline-flex items-center ${s.gap} ${s.pad} rounded-[10px] border font-medium leading-none capitalize ${className ?? ""}`}
      style={{
        color: tone.text,
        borderColor: `rgb(${tone.rgb} / 0.28)`,
        background: `linear-gradient(180deg, rgb(${tone.rgb} / 0.05), rgb(${tone.rgb} / 0.16))`,
        boxShadow: `inset 0 -8px 14px -9px rgb(${tone.rgb} / 0.5)`,
      }}
    >
      <Glyph size={s.icon} strokeWidth={2} className="flex-shrink-0" aria-hidden />
      {text}
    </span>
  );
};

export default StatusBadge;
