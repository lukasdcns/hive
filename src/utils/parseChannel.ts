/**
 * Accepts a Twitch channel name ("xqc") or full URL ("https://twitch.tv/xqc")
 * and returns the normalized lowercase channel name.
 * Returns null if the input is invalid.
 */
export function parseChannel(input: string): string | null {
  const trimmed = input.trim()
  if (!trimmed) return null

  // Full URL: https://twitch.tv/channel or https://www.twitch.tv/channel
  try {
    const url = new URL(trimmed)
    if (url.hostname === 'twitch.tv' || url.hostname === 'www.twitch.tv') {
      const parts = url.pathname.split('/').filter(Boolean)
      if (parts.length > 0) return parts[0].toLowerCase()
    }
  } catch {
    // Not a URL, treat as channel name
  }

  // Channel name: only alphanumeric and underscore allowed
  if (/^[a-zA-Z0-9_]{1,25}$/.test(trimmed)) {
    return trimmed.toLowerCase()
  }

  return null
}
