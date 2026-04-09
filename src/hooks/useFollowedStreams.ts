import { useState, useEffect, useCallback } from 'react'

const CLIENT_ID = import.meta.env.VITE_TWITCH_CLIENT_ID as string
const POLL_INTERVAL_MS = 60_000

export interface LiveStream {
  user_id: string
  user_login: string
  user_name: string
  game_name: string
  viewer_count: number
  thumbnail_url: string
}

interface UseFollowedStreams {
  streams: LiveStream[]
  loading: boolean
  error: string | null
  refresh: () => void
}

export function useFollowedStreams(token: string | null, userId: string | null): UseFollowedStreams {
  const [streams, setStreams] = useState<LiveStream[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStreams = useCallback(async () => {
    if (!token || !userId) return

    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({ user_id: userId, first: '100' })
      const res = await fetch(`https://api.twitch.tv/helix/streams/followed?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Client-Id': CLIENT_ID,
        },
      })

      if (!res.ok) {
        setError(`Erreur API Twitch (${res.status})`)
        return
      }

      const data: { data: LiveStream[] } = await res.json()
      setStreams(data.data ?? [])
    } catch {
      setError('Impossible de contacter l\'API Twitch')
    } finally {
      setLoading(false)
    }
  }, [token, userId])

  useEffect(() => {
    if (!token || !userId) {
      setStreams([])
      return
    }

    fetchStreams()

    const interval = setInterval(fetchStreams, POLL_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [token, userId, fetchStreams])

  return { streams, loading, error, refresh: fetchStreams }
}
