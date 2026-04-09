import type { YoutubeVideo } from '../types'

interface Props {
  videos: YoutubeVideo[]
  onRemove: (id: string) => void
}

function embedUrl(v: YoutubeVideo): string {
  if (v.kind === 'playlist') {
    return `https://www.youtube.com/embed/videoseries?list=${v.listId}&autoplay=1&rel=0`
  }
  return `https://www.youtube.com/embed/${v.videoId}?autoplay=1&rel=0`
}

export function YoutubeSection({ videos, onRemove }: Props) {
  return (
    <div
      className="shrink-0 flex gap-1 px-1 py-1 bg-[#0e0e10] border-b border-[#3a3a3d] overflow-x-auto overflow-y-hidden"
      style={{ height: '280px' }}
    >
      {videos.map((v) => (
        <div
          key={v.id}
          className="relative shrink-0 rounded overflow-hidden group bg-black"
          style={{ aspectRatio: '16/9', height: '100%' }}
        >
          <iframe
            src={embedUrl(v)}
            className="absolute inset-0 w-full h-full"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            title={`YouTube: ${v.label}`}
          />
          <button
            onClick={() => onRemove(v.id)}
            className="absolute top-1 right-1 z-10 w-6 h-6 rounded bg-black/60 hover:bg-red-600 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            title="Supprimer"
          >
            ✕
          </button>
          <div className="absolute bottom-1 left-1 bg-black/60 text-white text-xs px-2 py-0.5 rounded pointer-events-none select-none truncate max-w-[140px]">
            {v.kind === 'playlist' ? 'Playlist' : 'YouTube'} · {v.label}
          </div>
        </div>
      ))}
    </div>
  )
}
