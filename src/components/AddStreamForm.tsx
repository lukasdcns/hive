import { useState, type FormEvent } from 'react'
import { parseChannel } from '../utils/parseChannel'
import { parseYoutube } from '../utils/parseYoutube'
import type { YoutubeVideo } from '../types'

interface Props {
  existingChannels: string[]
  existingYoutubeLabels: string[]
  onAdd: (channel: string) => void
  onAddYoutube: (partial: Omit<YoutubeVideo, 'id'>) => void
}

export function AddStreamForm({ existingChannels, existingYoutubeLabels, onAdd, onAddYoutube }: Props) {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e: FormEvent) {
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
            className="bg-hive-accent hover:bg-hive-accent-hover text-hive-bg text-sm font-medium px-4 py-1.5 rounded transition-colors"
          >
            Ajouter
          </button>
        </div>
        {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
      </div>
    </form>
  )
}
