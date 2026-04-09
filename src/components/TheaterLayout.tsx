import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Stream } from '../types'

const TWITCH_PARENT = import.meta.env.VITE_TWITCH_PARENT ?? 'localhost'

interface Props {
  streams: Stream[]
  featuredId: string
  onSetFeatured: (id: string) => void
  onRemove: (id: string) => void
  onReorder: (streams: Stream[]) => void
}

interface MiniProps {
  stream: Stream
  onSetFeatured: (id: string) => void
  onRemove: (id: string) => void
  anyDragging: boolean
}

function SortableMini({ stream, onSetFeatured, onRemove, anyDragging }: MiniProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: stream.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    aspectRatio: '16/9' as const,
    height: '100%',
  }

  const miniSrc = `https://player.twitch.tv/?channel=${stream.channel}&parent=${TWITCH_PARENT}&autoplay=true&muted=true`

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative shrink-0 rounded overflow-hidden group ring-2 ring-transparent hover:ring-hive-accent transition-all"
    >
      {/* pointerEvents: none pendant le drag pour que @dnd-kit garde le pointeur */}
      <iframe
        src={miniSrc}
        className="absolute inset-0 w-full h-full"
        style={{ pointerEvents: anyDragging ? 'none' : 'auto' }}
        allow="autoplay"
        title={stream.channel}
      />

      <button
        onClick={() => onSetFeatured(stream.id)}
        className="absolute top-1 left-1 z-10 flex items-center gap-1 bg-black/70 hover:bg-hive-accent hover:text-hive-bg text-white text-xs px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
        title="Mettre en avant"
      >
        ↑ {stream.channel}
      </button>

      <button
        onClick={() => onRemove(stream.id)}
        className="absolute top-1 right-1 z-10 w-5 h-5 rounded bg-black/60 hover:bg-red-600 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        title="Supprimer"
      >
        ✕
      </button>

      {/* Poignée de drag — barre visible au hover en bas du mini */}
      <div
        {...attributes}
        {...listeners}
        className="absolute bottom-0 inset-x-0 z-10 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing bg-black/40 transition-opacity"
        title="Déplacer"
      >
        <div className="w-8 h-0.5 bg-white/60 rounded-full" />
      </div>
    </div>
  )
}

export function TheaterLayout({ streams, featuredId, onSetFeatured, onRemove, onReorder }: Props) {
  const [anyDragging, setAnyDragging] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const featured = streams.find((s) => s.id === featuredId) ?? streams[0]
  const minis = streams.filter((s) => s.id !== featured?.id)

  if (!featured) return null

  function handleDragStart(_event: DragStartEvent) {
    setAnyDragging(true)
  }

  function handleDragEnd(event: DragEndEvent) {
    setAnyDragging(false)
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = minis.findIndex((s) => s.id === active.id)
      const newIndex = minis.findIndex((s) => s.id === over.id)
      const newMinis = arrayMove(minis, oldIndex, newIndex)
      onReorder([featured, ...newMinis])
    }
  }

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
            src={`https://player.twitch.tv/?channel=${featured.channel}&parent=${TWITCH_PARENT}&autoplay=true`}
            className="absolute inset-0 w-full h-full"
            allow="autoplay"
            allowFullScreen
            title={featured.channel}
          />
          <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded pointer-events-none select-none z-10">
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

      {/* Minis — 30% de la hauteur, rangée horizontale drag-and-drop */}
      {minis.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={minis.map((s) => s.id)} strategy={horizontalListSortingStrategy}>
            <div
              className="flex gap-1 px-1 py-1 bg-hive-bg overflow-x-auto overflow-y-hidden"
              style={{ flex: '0 0 30%' }}
            >
              {minis.map((stream) => (
                <SortableMini
                  key={stream.id}
                  stream={stream}
                  onSetFeatured={onSetFeatured}
                  onRemove={onRemove}
                  anyDragging={anyDragging}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}
