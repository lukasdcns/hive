import type { Stream } from '../types'

const TWITCH_PARENT = import.meta.env.VITE_TWITCH_PARENT ?? 'localhost'

interface Props {
  streams: Stream[]
  featuredId: string
  onSetFeatured: (id: string) => void
  onRemove: (id: string) => void
}

export function TheaterLayout({ streams, featuredId, onSetFeatured, onRemove }: Props) {
  const featured = streams.find((s) => s.id === featuredId) ?? streams[0]
  const minis = streams.filter((s) => s.id !== featured?.id)

  if (!featured) return null

  const featuredSrc = `https://player.twitch.tv/?channel=${featured.channel}&parent=${TWITCH_PARENT}&autoplay=true`

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Stream principal — 70% de la hauteur, centré en 16:9 */}
      <div
        className="bg-black flex items-center justify-center group overflow-hidden"
        style={{ flex: '0 0 70%' }}
      >
        <div className="relative w-full h-full" style={{ aspectRatio: '16/9', maxWidth: '100%', maxHeight: '100%' }}>
        <iframe
          key={featured.id}
          src={featuredSrc}
          className="absolute inset-0 w-full h-full"
          allow="autoplay"
          allowFullScreen
          title={`Twitch: ${featured.channel}`}
        />
        <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded pointer-events-none select-none">
          {featured.channel}
        </div>
        <button
          onClick={() => onRemove(featured.id)}
          className="absolute top-2 right-2 w-6 h-6 rounded bg-black/60 hover:bg-red-600 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
          title="Supprimer"
        >
          ✕
        </button>
        </div>
      </div>

      {/* Minis — 30% de la hauteur, rangée horizontale scrollable */}
      {minis.length > 0 && (
        <div
          className="flex gap-1 px-1 py-1 bg-[#0e0e10] overflow-x-auto overflow-y-hidden"
          style={{ flex: '0 0 30%' }}
        >
          {minis.map((stream) => {
            const miniSrc = `https://player.twitch.tv/?channel=${stream.channel}&parent=${TWITCH_PARENT}&autoplay=true&muted=true`
            return (
              <div
                key={stream.id}
                className="relative shrink-0 rounded overflow-hidden group ring-2 ring-transparent hover:ring-[#9147ff] transition-all"
                style={{ aspectRatio: '16/9', height: '100%' }}
              >
                {/* iframe interactive — l'utilisateur peut lancer/contrôler la lecture */}
                <iframe
                  src={miniSrc}
                  className="absolute inset-0 w-full h-full"
                  allow="autoplay"
                  title={`Twitch mini: ${stream.channel}`}
                />

                {/* Bouton "mettre en avant" — visible au hover, en haut à gauche */}
                <button
                  onClick={() => onSetFeatured(stream.id)}
                  className="absolute top-1 left-1 z-10 flex items-center gap-1 bg-black/70 hover:bg-[#9147ff] text-white text-xs px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Mettre en avant"
                >
                  ↑ {stream.channel}
                </button>

                {/* Bouton supprimer — en haut à droite */}
                <button
                  onClick={() => onRemove(stream.id)}
                  className="absolute top-1 right-1 z-10 w-5 h-5 rounded bg-black/60 hover:bg-red-600 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Supprimer"
                >
                  ✕
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
