import type { SessionData } from '../utils/session'
import { relativeTime } from '../utils/session'

interface Props {
  session: SessionData
  onRestore: () => void
  onDismiss: () => void
}

export function RestoreSessionModal({ session, onRestore, onDismiss }: Props) {
  const modeLabel = session.layout === 'theater' ? 'Théâtre' : 'Grille'
  const channelList = session.streams.map((s) => s.channel)
  const ytCount = session.youtubeVideos?.length ?? 0

  return (
    /* Overlay — clic en dehors ne ferme pas (intentionnel, comme un éditeur) */
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-hive-input border border-hive-border rounded-lg shadow-2xl w-full max-w-md mx-4 p-6 flex flex-col gap-5">

        {/* Titre */}
        <div className="flex items-center gap-3">
          <span className="text-2xl">↩</span>
          <div>
            <h2 className="text-white font-semibold text-base">Reprendre où vous en étiez ?</h2>
            <p className="text-gray-500 text-xs mt-0.5">Session sauvegardée {relativeTime(session.savedAt)}</p>
          </div>
        </div>

        {/* Aperçu de la session */}
        <div className="bg-hive-bg rounded-md px-4 py-3 flex flex-col gap-2">
          <div className="flex flex-wrap gap-1.5">
            {channelList.map((ch) => (
              <span
                key={ch}
                className="flex items-center gap-1 bg-hive-hover text-white text-xs px-2 py-0.5 rounded-full"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                {ch}
              </span>
            ))}
          </div>
          <p className="text-gray-500 text-xs">
            {channelList.length} stream{channelList.length > 1 ? 's' : ''}
            {ytCount > 0 ? ` · ${ytCount} vidéo${ytCount > 1 ? 's' : ''} YouTube` : ''}
            {' '}· Mode {modeLabel}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onRestore}
            className="flex-1 bg-hive-accent hover:bg-hive-accent-hover text-hive-bg text-sm font-medium py-2 rounded transition-colors"
          >
            Restaurer la session
          </button>
          <button
            onClick={onDismiss}
            className="flex-1 bg-hive-hover hover:bg-hive-border text-gray-300 text-sm font-medium py-2 rounded transition-colors"
          >
            Nouvelle session
          </button>
        </div>

      </div>
    </div>
  )
}
