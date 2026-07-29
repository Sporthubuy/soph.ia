/**
 * Convert Material Symbols icon names to Unicode emojis
 * Used because the woff2 font doesn't have all icon glyphs
 */
export const iconMap: Record<string, string> = {
  // Navigation & UI
  dashboard: "📊",
  folder_open: "📁",
  menu_book: "📖",
  hub: "🔗",
  smart_toy: "🤖",
  fact_check: "✅",
  people: "👥",
  store: "🏪",
  database: "💾",

  // Actions
  add: "➕",
  edit: "✏️",
  delete: "🗑️",
  close: "❌",
  search: "🔍",

  // Status & states
  check_circle: "✅",
  error: "❌",
  warning: "⚠️",
  info: "ℹ️",

  // Common
  home: "🏠",
  settings: "⚙️",
  logout: "🚪",
  user: "👤",
  users: "👥",
  group: "👥",

  // Knowledge & content
  article: "📄",
  description: "📝",
  content_paste: "📋",
  bookmarks: "🔖",

  // Communication
  chat: "💬",
  mail: "📧",

  // Others
  link: "🔗",
  link_off: "🔗",
  visibility: "👁️",
  visibility_off: "👁️‍🗨️",
  public: "🌐",
  language: "🌐",
  lock: "🔒",
};

export function getMaterialSymbolEmoji(iconName: string | undefined): string {
  if (!iconName) return "📁";
  return iconMap[iconName.toLowerCase()] || "📌";
}
