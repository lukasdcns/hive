import { useState } from 'react'
import type { Stream } from '../types'

const TWITCH_PARENT = import.meta.env.VITE_TWITCH_PARENT ?? 'localhost'

interface Props {
  streams: Stream[]
  activeChannel: string | null
  onSelectChannel: (channel: string) => void
}

export function ChatPanel({ streams, activeChannel, onSelectChannel }: Props) {
  const current = activeChannel ?? streams[0]?.channel ?? ''
  // Clé pour forcer le rechargement de l'iframe après connexion
  const [iframeKey, setIframeKey] = useState(0)

  function handleLogin() {
    const popup = window.open(
      'https://www.twitch.tv/login',
      'twitch-login',
      'width=420,height=640,left=200,top=100'
    )
    if (!popup) return
    // Poll jusqu'à fermeture du popup, puis recharger l'iframe
    const timer = setInterval(() => {
      if (popup.closed) {
        clearInterval(timer)
        setIframeKey((k) => k + 1)
      }
    }, 500)
  }

  if (streams.length === 0) {
    return (
      <div className="w-[350px] bg-hive-input border-l border-hive-border flex items-center justify-center text-gray-500 text-sm">
        Aucun stream actif
      </div>
    )
  }

  return (
    <div className="w-[350px] bg-hive-input border-l border-hive-border flex flex-col">
      {/* Onglets + bouton connexion */}
      <div className="flex items-center border-b border-hive-border shrink-0">
        <div className="flex overflow-x-auto flex-1">
          {streams.map((s) => (
            <button
              key={s.id}
              onClick={() => onSelectChannel(s.channel)}
              className={`px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors border-b-2 ${
                s.channel === current
                  ? 'border-hive-accent text-white'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              {s.channel}
            </button>
          ))}
        </div>
        {/* Bouton de connexion Twitch */}
        <button
          onClick={handleLogin}
          className="shrink-0 mx-2 text-gray-500 hover:text-hive-accent transition-colors"
          title="Se connecter au chat Twitch"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.64 5.93h1.43v4.28h-1.43m3.93-4.28H17v4.28h-1.43M7 2L3.43 5.57v12.86h4.28V22l3.58-3.57h2.85L20.57 12V2m-1.43 9.29l-2.85 2.85h-2.86l-2.5 2.5v-2.5H7.71V3.43h11.43z" />
          </svg>
        </button>
      </div>

      {/* Chat iframe Twitch officiel */}
      <iframe
        key={`${current}-${iframeKey}`}
        src={`https://www.twitch.tv/embed/${current}/chat?parent=${TWITCH_PARENT}&darkpopout`}
        className="flex-1 w-full"
        title={`Chat: ${current}`}
        allow="storage-access"
      />
    </div>
  )
}
