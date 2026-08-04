import {
  LayoutGrid,
  Layers,
  FileText,
  Waypoints,
  Bot,
  ShieldCheck,
  Users,
  Store,
  SlidersHorizontal,
  LogOut,
  Search,
  Menu,
  Plus,
  X,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Link2,
  Check,
  Globe,
  Lock,
  Eye,
  SquarePen,
  Lightbulb,
  Folder,
  FolderOpen,
  FolderPlus,
  LockOpen,
  Trash2,
  Clock,
  User,
  Bell,
  HelpCircle,
  BarChart3,
  type LucideIcon,
} from "lucide-react";

/**
 * SOPH.IA icon set — thin facade over lucide-react so the whole app keeps
 * using <Icon name="..." /> while rendering Lucide glyphs (per DESIGN_SYSTEM.md).
 */

export type IconName =
  | "overview"
  | "projects"
  | "knowledge"
  | "graph"
  | "agents"
  | "review"
  | "people"
  | "marketplace"
  | "settings"
  | "signout"
  | "search"
  | "menu"
  | "plus"
  | "close"
  | "chevron-down"
  | "chevron-right"
  | "sparkle"
  | "link"
  | "check"
  | "globe"
  | "lock"
  | "eye"
  | "edit"
  | "bulb"
  | "folder"
  | "folder-open"
  | "folder-plus"
  | "unlock"
  | "trash"
  | "clock"
  | "grid"
  | "users"
  | "user"
  | "store"
  | "chart"
  | "bell"
  | "help"
  | "delete";

const MAP: Record<IconName, LucideIcon> = {
  overview: LayoutGrid,
  projects: Layers,
  knowledge: FileText,
  graph: Waypoints,
  agents: Bot,
  review: ShieldCheck,
  people: Users,
  marketplace: Store,
  settings: SlidersHorizontal,
  signout: LogOut,
  search: Search,
  menu: Menu,
  plus: Plus,
  close: X,
  "chevron-down": ChevronDown,
  "chevron-right": ChevronRight,
  sparkle: Sparkles,
  link: Link2,
  check: Check,
  globe: Globe,
  lock: Lock,
  eye: Eye,
  edit: SquarePen,
  bulb: Lightbulb,
  folder: Folder,
  "folder-open": FolderOpen,
  "folder-plus": FolderPlus,
  unlock: LockOpen,
  trash: Trash2,
  clock: Clock,
  grid: LayoutGrid,
  users: Users,
  user: User,
  store: Store,
  chart: BarChart3,
  bell: Bell,
  help: HelpCircle,
  delete: Trash2,
};

interface IconProps {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  fill?: string;
  className?: string;
  style?: React.CSSProperties;
  "aria-hidden"?: boolean;
}

export const Icon = ({
  name,
  size = 20,
  strokeWidth = 1.8,
  fill,
  className,
  style,
  ...props
}: IconProps) => {
  const Glyph = MAP[name];
  return (
    <Glyph
      size={size}
      strokeWidth={strokeWidth}
      fill={fill}
      className={className}
      style={style}
      aria-hidden
      {...props}
    />
  );
};
