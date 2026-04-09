import type { Stream, YoutubeVideo } from '../types'

const KEY = 'hive_session'

export interface SessionData {
  streams: Stream[]
  youtubeVideos: YoutubeVideo[]
  layout: 'grid' | 'theater'
  featuredId: string | null
  savedAt: number
}

export function saveSession(data: SessionData): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(data))
  } catch {
    // quota dépassé ou mode privé restrictif — on ignore silencieusement
  }
}

export function loadSession(): SessionData | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as SessionData
    // Validation minimale
    if (!Array.isArray(data.streams) || !data.layout || typeof data.savedAt !== 'number') {
      return null
    }
    if (!Array.isArray(data.youtubeVideos)) data.youtubeVideos = []
    return data
  } catch {
    return null
  }
}

export function clearSession(): void {
  localStorage.removeItem(KEY)
}

/** Retourne une chaîne relative lisible, ex: "il y a 3 min", "il y a 2 h" */
export function relativeTime(savedAt: number): string {
  const diffMs = Date.now() - savedAt
  const diffMin = Math.floor(diffMs / 60_000)
  if (diffMin < 1) return 'il y a moins d\'une minute'
  if (diffMin < 60) return `il y a ${diffMin} min`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `il y a ${diffH} h`
  return `il y a ${Math.floor(diffH / 24)} j`
}
