import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Stream } from '../types'

const TWITCH_PARENT = import.meta.env.VITE_TWITCH_PARENT ?? 'localhost'

interface Props {
  stream: Stream
  onRemove: (id: string) => void
}

export function StreamTile({ stream, onRemove }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: stream.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  const src = `https://player.twitch.tv/?channel=${stream.channel}&parent=${TWITCH_PARENT}&autoplay=true`

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative bg-black rounded overflow-hidden group w-full h-full"
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-0 left-0 right-0 z-10 h-8 cursor-grab active:cursor-grabbing flex items-center px-2 gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-b from-black/70 to-transparent"
      >
        <span className="text-gray-300 text-xs font-medium truncate">{stream.channel}</span>
      </div>

      {/* Remove button */}
      <button
        onClick={() => onRemove(stream.id)}
        className="absolute top-1 right-1 z-20 w-6 h-6 rounded bg-black/60 hover:bg-red-600 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        title="Supprimer"
      >
        ✕
      </button>

      <iframe
        src={src}
        className="absolute inset-0 w-full h-full"
        allow="autoplay"
        allowFullScreen
        title={stream.channel}
      />
    </div>
  )
}
