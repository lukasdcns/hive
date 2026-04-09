import { useFollowedStreams } from '../hooks/useFollowedStreams'
import type { TwitchUser } from '../hooks/useTwitchAuth'

function formatViewers(n: number): string {
  if (n >= 1000) return `${Math.floor(n / 1000)}k`
  return String(n)
}

interface Props {
  activeChannels: string[]
  onAdd: (channel: string) => void
  token: string | null
  user: TwitchUser | null
  onLogin: () => void
  onLogout: () => void
}

export function FollowsPanel({ activeChannels, onAdd, token, user, onLogin, onLogout }: Props) {
  const { streams, loading, error, refresh } = useFollowedStreams(token, user?.id ?? null)

  return (
    <div className="w-[220px] shrink-0 bg-hive-surface border-r border-hive-border flex flex-col overflow-hidden">
      {/* Header du panel */}
      <div className="px-3 py-2 border-b border-hive-border">
        {user ? (
          <div className="flex items-center gap-2">
            <img
              src={user.profile_image_url}
              alt={user.display_name}
              className="w-7 h-7 rounded-full"
            />
            <span className="text-white text-xs font-medium truncate flex-1">
              {user.display_name}
            </span>
            <button
              onClick={onLogout}
              className="text-gray-500 hover:text-white text-xs transition-colors"
              title="Se déconnecter"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            onClick={onLogin}
            className="w-full bg-hive-accent hover:bg-hive-accent-hover text-hive-bg text-xs font-medium py-1.5 px-2 rounded transition-colors"
          >
            Se connecter
          </button>
        )}
      </div>

      {/* Corps du panel */}
      {!token && (
        <div className="flex-1 flex items-center justify-center px-3">
          <p className="text-gray-500 text-xs text-center">
            Connecte-toi pour voir tes follows en live
          </p>
        </div>
      )}

      {token && (
        <>
          {/* Barre En live + refresh */}
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-gray-400 text-xs font-medium">
              En live {!loading && `(${streams.length})`}
            </span>
            <button
              onClick={refresh}
              disabled={loading}
              className="text-gray-500 hover:text-white text-xs transition-colors disabled:opacity-40"
              title="Rafraîchir"
            >
              ↻
            </button>
          </div>

          {/* État : chargement */}
          {loading && streams.length === 0 && (
            <div className="flex-1 flex items-center justify-center">
              <span className="text-gray-500 text-xs">Chargement…</span>
            </div>
          )}

          {/* État : erreur */}
          {error && (
            <div className="px-3 py-2">
              <p className="text-red-400 text-xs">{error}</p>
            </div>
          )}

          {/* État : aucun live */}
          {!loading && !error && streams.length === 0 && (
            <div className="flex-1 flex items-center justify-center px-3">
              <p className="text-gray-500 text-xs text-center">
                Aucun follow en live pour le moment
              </p>
            </div>
          )}

          {/* Liste des lives */}
          {streams.length > 0 && (
            <ul className="flex-1 overflow-y-auto">
              {streams.map((stream) => {
                const isActive = activeChannels.includes(stream.user_login)
                return (
                  <li key={stream.user_id}>
                    <button
                      disabled={isActive}
                      onClick={() => onAdd(stream.user_login)}
                      className={`w-full text-left px-3 py-2 flex flex-col gap-0.5 transition-colors ${
                        isActive
                          ? 'bg-hive-hover cursor-default opacity-60'
                          : 'hover:bg-hive-hover cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                        <span className="text-white text-xs font-medium truncate flex-1">
                          {stream.user_name}
                        </span>
                        {isActive && (
                          <span className="text-hive-accent text-xs shrink-0">✓</span>
                        )}
                      </div>
                      <div className="text-gray-500 text-xs truncate pl-3">
                        {stream.game_name} · {formatViewers(stream.viewer_count)} viewers
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </>
      )}
    </div>
  )
}
