import type { YoutubeVideo } from '../types'

export function parseYoutube(input: string): Omit<YoutubeVideo, 'id'> | null {
  const trimmed = input.trim()
  if (!trimmed) return null

  let url: URL
  try {
    url = new URL(trimmed)
  } catch {
    return null
  }

  const host = url.hostname.replace('www.', '')
  if (host !== 'youtube.com' && host !== 'youtu.be') return null

  // Playlist : list= param présent sur youtube.com
  const listId = url.searchParams.get('list')
  if (host === 'youtube.com' && listId) {
    return { kind: 'playlist', videoId: '', listId, label: listId }
  }

  // youtu.be short link
  if (host === 'youtu.be') {
    const videoId = url.pathname.split('/').filter(Boolean)[0] ?? ''
    if (!videoId) return null
    return { kind: 'video', videoId, listId: '', label: videoId }
  }

  // youtube.com/watch?v=
  const vParam = url.searchParams.get('v')
  if (vParam) {
    return { kind: 'video', videoId: vParam, listId: '', label: vParam }
  }

  // youtube.com/live/VIDEO_ID
  const parts = url.pathname.split('/').filter(Boolean)
  if (parts[0] === 'live' && parts[1]) {
    return { kind: 'video', videoId: parts[1], listId: '', label: parts[1] }
  }

  return null
}
