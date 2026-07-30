import type { SVGProps } from "react";

/**
 * SOPH.IA line-icon set — one consistent stroke, drawn in the graph-native
 * grammar (bodies + edges) wherever the concept allows. Replaces the emoji
 * icons the shell used to render. Icons inherit `currentColor`.
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
  | "bulb";

const PATHS: Record<IconName, React.ReactNode> = {
  overview: (
    <>
      <rect x="3.5" y="3.5" width="7" height="7" rx="2" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="2" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="2" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="2" />
    </>
  ),
  projects: (
    <>
      <path d="M12 3 4 7l8 4 8-4-8-4Z" />
      <path d="M4 12l8 4 8-4" />
      <path d="M4 16.8l8 4 8-4" />
    </>
  ),
  knowledge: (
    <>
      <path d="M7 3.5h6.2L18 8v11.5a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-15a1 1 0 0 1 1-1Z" />
      <path d="M13 3.5V8h5" />
      <path d="M9 13h6" />
      <path d="M9 16.5h6" />
    </>
  ),
  graph: (
    <>
      <path d="M11.2 6.6 7.4 15.6" />
      <path d="M13.2 6.7 16.8 13.4" />
      <path d="M8.6 17.4l7.6-2" />
      <circle cx="12" cy="5" r="2.3" />
      <circle cx="6.4" cy="17.6" r="2.3" />
      <circle cx="17.8" cy="14.6" r="2.3" />
    </>
  ),
  agents: (
    <>
      <circle cx="12" cy="12" r="5.4" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
      <path d="M12 3.4v2.6" />
      <path d="M20.6 12h-2.6" />
      <path d="M12 20.6v-2.6" />
      <path d="M3.4 12h2.6" />
    </>
  ),
  review: (
    <>
      <path d="M12 3.4 5.5 6v5.6c0 4.1 2.8 6.9 6.5 8.6 3.7-1.7 6.5-4.5 6.5-8.6V6L12 3.4Z" />
      <path d="M9.1 11.8 11.3 14l3.6-4" />
    </>
  ),
  people: (
    <>
      <circle cx="9" cy="8.6" r="3" />
      <path d="M3.6 19c0-3 2.5-5 5.4-5s5.4 2 5.4 5" />
      <path d="M16 6.3a3 3 0 0 1 0 5.6" />
      <path d="M17.2 14.5c2.1.5 3.6 2.3 3.6 4.5" />
    </>
  ),
  marketplace: (
    <>
      <path d="M3.6 3.6h7.4l9 9-7.4 7.4-9-9V3.6Z" />
      <circle cx="7.6" cy="7.6" r="1.5" fill="currentColor" stroke="none" />
    </>
  ),
  settings: (
    <>
      <path d="M4 7.5h8.5" />
      <path d="M16.5 7.5H20" />
      <circle cx="14.5" cy="7.5" r="2" />
      <path d="M4 16.5h3.5" />
      <path d="M11.5 16.5H20" />
      <circle cx="9.5" cy="16.5" r="2" />
    </>
  ),
  signout: (
    <>
      <path d="M13.5 4.5H6A1.5 1.5 0 0 0 4.5 6v12A1.5 1.5 0 0 0 6 19.5h7.5" />
      <path d="M10 12h10" />
      <path d="M16.5 8.5 20 12l-3.5 3.5" />
    </>
  ),
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6" />
      <path d="M15 15l4.6 4.6" />
    </>
  ),
  menu: (
    <>
      <path d="M4 6.5h16" />
      <path d="M4 12h16" />
      <path d="M4 17.5h16" />
    </>
  ),
  plus: (
    <>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </>
  ),
  close: (
    <>
      <path d="M6 6l12 12" />
      <path d="M18 6 6 18" />
    </>
  ),
  "chevron-down": <path d="M5 9l7 7 7-7" />,
  "chevron-right": <path d="M9 5l7 7-7 7" />,
  sparkle: (
    <path d="M12 4l1.7 4.7L18.4 10l-4.7 1.3L12 16l-1.7-4.7L5.6 10l4.7-1.3L12 4Z" />
  ),
  link: (
    <>
      <path d="M10 13a3.5 3.5 0 0 0 5 0l3-3a3.5 3.5 0 0 0-5-5l-1.5 1.5" />
      <path d="M14 11a3.5 3.5 0 0 0-5 0l-3 3a3.5 3.5 0 0 0 5 5l1.5-1.5" />
    </>
  ),
  check: <path d="M5 12.5 10 17l9-10" />,
  globe: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17" />
      <path d="M12 3.5c2.4 2.3 3.8 5.3 3.8 8.5s-1.4 6.2-3.8 8.5c-2.4-2.3-3.8-5.3-3.8-8.5S9.6 5.8 12 3.5Z" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="10.5" width="14" height="9.5" rx="2.2" />
      <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
    </>
  ),
  eye: (
    <>
      <path d="M2.5 12s3.4-6.5 9.5-6.5S21.5 12 21.5 12 18.1 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="2.6" />
    </>
  ),
  edit: (
    <>
      <path d="M4 20h4L18.5 9.5a2 2 0 0 0-2.8-2.8L5 17.2 4 20Z" />
      <path d="M14 8 17 11" />
    </>
  ),
  bulb: (
    <>
      <path d="M9.2 17.5h5.6" />
      <path d="M10 20.5h4" />
      <path d="M12 3.5a6 6 0 0 0-3.6 10.8c.6.5 1 1.3 1.1 2.1h5c.1-.8.5-1.6 1.1-2.1A6 6 0 0 0 12 3.5Z" />
    </>
  ),
};

interface IconProps extends Omit<SVGProps<SVGSVGElement>, "name"> {
  name: IconName;
  size?: number;
  strokeWidth?: number;
}

export const Icon = ({
  name,
  size = 20,
  strokeWidth = 1.6,
  ...props
}: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    {PATHS[name]}
  </svg>
);
