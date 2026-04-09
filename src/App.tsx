import { useState, useEffect } from 'react'
import type { Stream, YoutubeVideo } from './types'
import { useTwitchAuth } from './hooks/useTwitchAuth'
import { saveSession, loadSession, clearSession } from './utils/session'
import type { SessionData } from './utils/session'
import { AddStreamForm } from './components/AddStreamForm'
import { StreamGrid } from './components/StreamGrid'
import { TheaterLayout } from './components/TheaterLayout'
import { ChatPanel } from './components/ChatPanel'
import { FollowsPanel } from './components/FollowsPanel'
import { RestoreSessionModal } from './components/RestoreSessionModal'
import { YoutubeSection } from './components/YoutubeSection'

let nextId = 1

export default function App() {
  const { token, user, login, logout } = useTwitchAuth()
  const [pendingSession, setPendingSession] = useState<SessionData | null>(() => loadSession())
  const [streams, setStreams] = useState<Stream[]>([])
  const [youtubeVideos, setYoutubeVideos] = useState<YoutubeVideo[]>([])
  const [chatOpen, setChatOpen] = useState(false)
  const [activeChatChannel, setActiveChatChannel] = useState<string | null>(null)
  const [layout, setLayout] = useState<'grid' | 'theater'>('grid')
  const [featuredId, setFeaturedId] = useState<string | null>(null)

  // Sauvegarde automatique à chaque changement significatif
  useEffect(() => {
    if (streams.length === 0 && youtubeVideos.length === 0) return
    saveSession({ streams, youtubeVideos, layout, featuredId, savedAt: Date.now() })
  }, [streams, youtubeVideos, layout, featuredId])

  function handleRestore() {
    const s = pendingSession!
    // Réassigner des IDs frais pour éviter les doublons des anciennes sessions
    const freshStreams = s.streams.map((st, i) => ({ ...st, id: String(i + 1) }))
    const freshYoutube = (s.youtubeVideos ?? []).map((v, i) => ({
      ...v, id: String(freshStreams.length + i + 1),
    }))
    nextId = freshStreams.length + freshYoutube.length + 1
    setStreams(freshStreams)
    setYoutubeVideos(freshYoutube)
    setLayout(s.layout)
    // Mettre à jour featuredId si il pointait vers un ancien ID
    if (s.featuredId !== null) {
      const oldIdx = s.streams.findIndex((st) => st.id === s.featuredId)
      setFeaturedId(oldIdx >= 0 ? freshStreams[oldIdx].id : freshStreams[0]?.id ?? null)
    }
    setActiveChatChannel(freshStreams[0]?.channel ?? null)
    setPendingSession(null)
  }

  function handleDismiss() {
    clearSession()
    setPendingSession(null)
  }

  function handleAddYoutube(partial: Omit<YoutubeVideo, 'id'>) {
    setYoutubeVideos((prev) => [...prev, { ...partial, id: String(nextId++) }])
  }

  function handleRemoveYoutube(id: string) {
    setYoutubeVideos((prev) => prev.filter((v) => v.id !== id))
  }

  function handleAdd(channel: string) {
    const newStream: Stream = { id: String(nextId++), channel }
    setStreams((prev) => {
      if (prev.length === 0) setFeaturedId(newStream.id)
      return [...prev, newStream]
    })
    if (activeChatChannel === null) setActiveChatChannel(channel)
  }

  function handleRemove(id: string) {
    setStreams((prev) => {
      const next = prev.filter((s) => s.id !== id)
      const removed = prev.find((s) => s.id === id)
      if (removed?.channel === activeChatChannel) {
        setActiveChatChannel(next[0]?.channel ?? null)
      }
      if (id === featuredId) {
        setFeaturedId(next[0]?.id ?? null)
      }
      return next
    })
  }

  function handleReorder(reordered: Stream[]) {
    setStreams(reordered)
  }

  function handleSwitchToTheater() {
    setLayout('theater')
    if (!featuredId && streams.length > 0) setFeaturedId(streams[0].id)
  }

  const showLayoutToggle = streams.length >= 1
  const useTheater = layout === 'theater' && streams.length >= 2

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-2 bg-[#18181b] border-b border-[#3a3a3d] shrink-0">
        <h1 className="text-[#9147ff] font-bold text-lg tracking-tight">Hive</h1>

        <div className="flex-1" />

        {showLayoutToggle && (
          <div className="flex rounded overflow-hidden border border-[#3a3a3d] text-sm">
            <button
              onClick={() => setLayout('grid')}
              className={`px-3 py-1.5 font-medium transition-colors ${
                layout === 'grid'
                  ? 'bg-[#9147ff] text-white'
                  : 'bg-[#1f1f23] text-gray-400 hover:text-white'
              }`}
            >
              Grille
            </button>
            <button
              onClick={handleSwitchToTheater}
              className={`px-3 py-1.5 font-medium transition-colors border-l border-[#3a3a3d] ${
                layout === 'theater'
                  ? 'bg-[#9147ff] text-white'
                  : 'bg-[#1f1f23] text-gray-400 hover:text-white'
              }`}
            >
              Théâtre
            </button>
          </div>
        )}

        <AddStreamForm
          existingChannels={streams.map((s) => s.channel)}
          existingYoutubeLabels={youtubeVideos.map((v) => v.label)}
          onAdd={handleAdd}
          onAddYoutube={handleAddYoutube}
        />

        <button
          onClick={() => setChatOpen((o) => !o)}
          disabled={streams.length === 0}
          className={`px-3 py-1.5 text-sm rounded font-medium transition-colors ${
            chatOpen
              ? 'bg-[#9147ff] text-white'
              : 'bg-[#1f1f23] text-gray-300 hover:bg-[#2a2a2d] disabled:opacity-40 disabled:cursor-not-allowed'
          }`}
        >
          Chat
        </button>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        <FollowsPanel
          activeChannels={streams.map((s) => s.channel)}
          onAdd={handleAdd}
          token={token}
          user={user}
          onLogin={login}
          onLogout={logout}
        />

        <div className="flex-1 overflow-hidden flex flex-col">
          {youtubeVideos.length > 0 && (
            <YoutubeSection videos={youtubeVideos} onRemove={handleRemoveYoutube} />
          )}
          <div className="flex-1 overflow-hidden flex">
            {useTheater ? (
              <TheaterLayout
                streams={streams}
                featuredId={featuredId ?? streams[0].id}
                onSetFeatured={setFeaturedId}
                onRemove={handleRemove}
              />
            ) : (
              <StreamGrid
                streams={streams}
                onRemove={handleRemove}
                onReorder={handleReorder}
              />
            )}
          </div>
        </div>

        {chatOpen && streams.length > 0 && (
          <ChatPanel
            streams={streams}
            activeChannel={activeChatChannel}
            onSelectChannel={setActiveChatChannel}
          />
        )}
      </div>

      {/* Modale de restauration de session */}
      {pendingSession && (
        <RestoreSessionModal
          session={pendingSession}
          onRestore={handleRestore}
          onDismiss={handleDismiss}
        />
      )}
    </div>
  )
}
