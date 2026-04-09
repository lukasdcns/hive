import { useState, useEffect } from 'react'

const CLIENT_ID = import.meta.env.VITE_TWITCH_CLIENT_ID as string
const SESSION_KEY = 'twitch_token'

export interface TwitchUser {
  id: string
  login: string
  display_name: string
  profile_image_url: string
}

interface TwitchAuth {
  token: string | null
  user: TwitchUser | null
  login: () => void
  logout: () => void
}

export function useTwitchAuth(): TwitchAuth {
  const [token, setToken] = useState<string | null>(() => {
    return sessionStorage.getItem(SESSION_KEY)
  })
  const [user, setUser] = useState<TwitchUser | null>(null)

  // Extraire le token depuis le hash de l'URL au retour OAuth
  useEffect(() => {
    const hash = window.location.hash
    if (!hash) return

    const params = new URLSearchParams(hash.slice(1)) // enlève le '#'
    const accessToken = params.get('access_token')
    if (!accessToken) return

    sessionStorage.setItem(SESSION_KEY, accessToken)
    setToken(accessToken)

    // Nettoyer le hash de l'URL sans recharger la page
    history.replaceState(null, '', window.location.pathname + window.location.search)
  }, [])

  // Fetch les infos utilisateur dès qu'on a un token
  useEffect(() => {
    if (!token) {
      setUser(null)
      return
    }

    let cancelled = false

    fetch('https://api.twitch.tv/helix/users', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Client-Id': CLIENT_ID,
      },
    })
      .then((r) => {
        if (!r.ok) {
          // Token invalide ou expiré
          if (r.status === 401) logout()
          return null
        }
        return r.json()
      })
      .then((data: { data: TwitchUser[] } | null) => {
        if (!cancelled && data?.data?.[0]) {
          setUser(data.data[0])
        }
      })
      .catch(() => {
        if (!cancelled) logout()
      })

    return () => {
      cancelled = true
    }
  }, [token]) // eslint-disable-line react-hooks/exhaustive-deps

  function login() {
    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      redirect_uri: window.location.origin,
      response_type: 'token',
      scope: 'user:read:follows chat:read chat:edit',
      force_verify: 'false',
    })
    window.location.href = `https://id.twitch.tv/oauth2/authorize?${params}`
  }

  function logout() {
    sessionStorage.removeItem(SESSION_KEY)
    setToken(null)
    setUser(null)
  }

  return { token, user, login, logout }
}
