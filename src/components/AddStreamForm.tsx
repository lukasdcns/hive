import { useState, type FormEvent } from 'react'
import { parseChannel } from '../utils/parseChannel'
import { parseYoutube } from '../utils/parseYoutube'
import type { YoutubeVideo } from '../types'

const TWITCH_CLIENT_ID = import.meta.env.VITE_TWITCH_CLIENT_ID ?? ''

interface Props {
  existingChannels: string[]
  existingYoutubeLabels: string[]
  token: string | null
  onAdd: (channel: string) => void
  onAddYoutube: (partial: Omit<YoutubeVideo, 'id'>) => void
}

export function AddStreamForm({ existingChannels, existingYoutubeLabels, token, onAdd, onAddYoutube }: Props) {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')
  const [checking, setChecking] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = value.trim()

    const yt = parseYoutube(trimmed)
    if (yt !== null) {
      if (existingYoutubeLabels.includes(yt.label)) {
        setError('Cette vidéo YouTube est déjà affichée')
        return
      }
      onAddYoutube(yt)
      setValue('')
      setError('')
      return
    }

    const channel = parseChannel(trimmed)
    if (!channel) {
      setError('Nom ou URL invalide')
      return
    }
    if (existingChannels.includes(channel)) {
      setError(`"${channel}" est déjà affiché`)
      return
    }

    if (token) {
      setChecking(true)
      try {
        const res = await fetch(`https://api.twitch.tv/helix/users?login=${channel}`, {
          headers: { Authorization: `Bearer ${token}`, 'Client-Id': TWITCH_CLIENT_ID },
        })
        const json = await res.json()
        if (!json.data || json.data.length === 0) {
          setError(`Channel "${channel}" introuvable sur Twitch`)
          return
        }
      } catch {
        // En cas d'erreur réseau, on laisse passer
      } finally {
        setChecking(false)
      }
    }

    onAdd(channel)
    setValue('')
    setError('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <div className="flex flex-col">
        <div className="flex gap-2">
          <input
            type="text"
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
              setError('')
            }}
            placeholder="Channel ou URL YouTube..."
            className="bg-hive-input border border-hive-border rounded px-3 py-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-hive-accent w-56"
          />
          <button
            type="submit"
            disabled={checking}
            className="bg-hive-accent hover:bg-hive-accent-hover text-hive-bg text-sm font-medium px-4 py-1.5 rounded transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {checking ? '…' : 'Ajouter'}
          </button>
        </div>
        {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
      </div>
    </form>
  )
}
