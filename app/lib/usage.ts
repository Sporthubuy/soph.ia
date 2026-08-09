// Daily chat message limit per user. Kept intentionally generous for now.
export const DAILY_CHAT_LIMIT = 200

export function since24h() {
  return new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
}
