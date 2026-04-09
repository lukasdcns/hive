import { useState, type FormEvent } from 'react'
import { useFollowedStreams } from '../hooks/useFollowedStreams'
import type { TwitchUser } from '../hooks/useTwitchAuth'
import type { Folder } from '../types'

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
  folders: Folder[]
  activeFolderId: string | null
  onLoadFolder: (folder: Folder) => void
  onSaveFolder: (name: string) => void
  onUpdateFolder: (id: string) => void
  onDeleteFolder: (id: string) => void
}

export function FollowsPanel({ activeChannels, onAdd, token, user, onLogin, onLogout, folders, activeFolderId, onLoadFolder, onSaveFolder, onUpdateFolder, onDeleteFolder }: Props) {
  const { streams, loading, error, refresh } = useFollowedStreams(token, user?.id ?? null)
  const [query, setQuery] = useState('')
  const [foldersOpen, setFoldersOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')

  const filtered = streams.filter((s) =>
    s.user_name.toLowerCase().includes(query.toLowerCase())
  )

  function handleCreate(e: FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    onSaveFolder(newName.trim())
    setNewName('')
    setCreating(false)
  }

  function handleLoadAndClose(folder: Folder) {
    onLoadFolder(folder)
    setFoldersOpen(false)
  }

  return (
    <div className="w-[220px] shrink-0 bg-hive-surface border-r border-hive-border flex flex-col overflow-hidden">

      {/* Header — toujours visible */}
      <div className="px-3 py-2 border-b border-hive-border shrink-0">
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

      {/* Bouton toggle dossiers — juste au-dessus des lives */}
      <button
        onClick={() => setFoldersOpen((o) => !o)}
        className="shrink-0 border-b border-hive-border px-3 py-2 flex items-center justify-between hover:bg-hive-hover transition-colors"
      >
        <span className="text-gray-400 text-xs font-medium flex items-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" className="shrink-0">
            <rect x="0" y="0" width="5" height="5" rx="1"/>
            <rect x="7" y="0" width="5" height="5" rx="1"/>
            <rect x="0" y="7" width="5" height="5" rx="1"/>
            <rect x="7" y="7" width="5" height="5" rx="1"/>
          </svg>
          Mes dossiers {folders.length > 0 && `(${folders.length})`}
        </span>
        <span
          className={`text-gray-500 text-xs transition-transform duration-300 ${foldersOpen ? 'rotate-180' : ''}`}
        >
          ▲
        </span>
      </button>

      {/* Zone centrale : live + drawer dossiers superposé */}
      <div className="flex-1 overflow-hidden flex flex-col relative min-h-0">

        {/* Section lives */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          {!token && (
            <div className="flex-1 flex items-center justify-center px-3">
              <p className="text-gray-500 text-xs text-center">
                Connecte-toi pour voir tes follows en live
              </p>
            </div>
          )}

          {token && (
            <>
              <div className="flex items-center justify-between px-3 py-2 shrink-0">
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

              {loading && streams.length === 0 && (
                <div className="flex-1 flex items-center justify-center">
                  <span className="text-gray-500 text-xs">Chargement…</span>
                </div>
              )}

              {error && (
                <div className="px-3 py-2 shrink-0">
                  <p className="text-red-400 text-xs">{error}</p>
                </div>
              )}

              {!loading && !error && streams.length === 0 && (
                <div className="flex-1 flex items-center justify-center px-3">
                  <p className="text-gray-500 text-xs text-center">
                    Aucun follow en live pour le moment
                  </p>
                </div>
              )}

              {streams.length > 0 && (
                <div className="px-2 pb-1 relative shrink-0">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Rechercher..."
                    className="w-full bg-hive-input border border-hive-border rounded px-2 py-1 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-hive-accent pr-6"
                  />
                  {query && (
                    <button
                      onClick={() => setQuery('')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>
              )}

              {streams.length > 0 && (
                <ul className="flex-1 overflow-y-auto">
                  {filtered.length === 0 && (
                    <li className="flex items-center justify-center px-3 py-4">
                      <p className="text-gray-500 text-xs text-center">Aucun résultat</p>
                    </li>
                  )}
                  {filtered.map((stream) => {
                    const isActive = activeChannels.includes(stream.user_login)
                    return (
                      <li key={stream.user_id}>
                        <button
                          disabled={isActive}
                          onClick={() => { onAdd(stream.user_login); setQuery('') }}
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

        {/* Drawer dossiers — slide up depuis le bas */}
        <div
          className={`absolute inset-0 bg-hive-surface flex flex-col transition-transform duration-300 ease-in-out ${
            foldersOpen ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          {/* Header drawer */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-hive-border shrink-0">
            <span className="text-gray-400 text-xs font-medium">Dossiers</span>
            <button
              onClick={() => { setNewName(''); setCreating((c) => !c) }}
              className="flex items-center gap-1 bg-hive-accent hover:bg-hive-accent-hover text-hive-bg text-xs font-medium px-2 py-0.5 rounded transition-colors"
              title="Nouveau dossier"
            >
              + Créer
            </button>
          </div>

          {/* Form création */}
          {creating && (
            <form onSubmit={handleCreate} className="px-2 py-1 flex gap-1 shrink-0">
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nom du dossier..."
                className="flex-1 bg-hive-input border border-hive-border rounded px-2 py-1 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-hive-accent"
              />
              <button type="submit" className="text-hive-accent hover:text-white text-xs px-1 transition-colors">✓</button>
              <button type="button" onClick={() => setCreating(false)} className="text-gray-500 hover:text-white text-xs px-1 transition-colors">✕</button>
            </form>
          )}

          {/* Boutons layout actuel */}
          {activeChannels.length > 0 && !creating && (
            <div className="mx-2 mt-1 flex flex-col gap-0.5 shrink-0">
              {activeFolderId && folders.some((f) => f.id === activeFolderId) && (
                <button
                  onClick={() => onUpdateFolder(activeFolderId)}
                  className="text-xs text-hive-accent hover:text-white text-left transition-colors"
                >
                  ↑ Mettre à jour « {folders.find((f) => f.id === activeFolderId)!.name} »
                </button>
              )}
              <button
                onClick={() => { setNewName(''); setCreating(true) }}
                className="text-xs text-gray-500 hover:text-hive-accent text-left transition-colors"
              >
                ↓ Enregistrer comme nouveau dossier
              </button>
            </div>
          )}

          {/* Liste */}
          <ul className="flex-1 overflow-y-auto">
            {folders.length === 0 && (
              <li className="flex items-center justify-center px-3 py-4">
                <p className="text-gray-500 text-xs text-center">Aucun dossier</p>
              </li>
            )}
            {folders.map((folder) => (
              <li key={folder.id} className="group flex items-center px-3 py-2 hover:bg-hive-hover transition-colors">
                <button
                  onClick={() => handleLoadAndClose(folder)}
                  className="flex-1 text-left text-white text-xs font-medium truncate"
                >
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="currentColor" className="inline shrink-0 mr-1.5 opacity-60"><rect x="0" y="0" width="5" height="5" rx="1"/><rect x="7" y="0" width="5" height="5" rx="1"/><rect x="0" y="7" width="5" height="5" rx="1"/><rect x="7" y="7" width="5" height="5" rx="1"/></svg>{folder.name}
                  <span className="text-gray-500 font-normal ml-1">({folder.channels.length})</span>
                </button>
                <button
                  onClick={() => onDeleteFolder(folder.id)}
                  className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 text-xs transition-opacity ml-1 shrink-0"
                  title="Supprimer"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>


    </div>
  )
}
