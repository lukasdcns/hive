import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import type { Stream } from '../types'
import { StreamTile } from './StreamTile'

function getGridCols(count: number): number {
  if (count <= 1) return 1
  if (count <= 2) return 2
  if (count <= 4) return 2
  if (count <= 6) return 3
  return 4
}

function getGridRows(count: number): number {
  if (count <= 2) return 1
  if (count <= 6) return 2
  return 3
}

interface Props {
  streams: Stream[]
  onRemove: (id: string) => void
  onReorder: (streams: Stream[]) => void
}

export function StreamGrid({ streams, onRemove, onReorder }: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = streams.findIndex((s) => s.id === active.id)
      const newIndex = streams.findIndex((s) => s.id === over.id)
      onReorder(arrayMove(streams, oldIndex, newIndex))
    }
  }

  if (streams.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
        <p className="text-lg mb-1">Aucun stream actif</p>
        <p className="text-sm">Ajoute un channel Twitch pour commencer</p>
      </div>
    )
  }

  const cols = getGridCols(streams.length)
  const rows = getGridRows(streams.length)

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={streams.map((s) => s.id)} strategy={rectSortingStrategy}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, 1fr)`,
            gap: '4px',
            padding: '4px',
            width: '100%',
            height: '100%',
          }}
        >
          {streams.map((stream) => (
            <StreamTile key={stream.id} stream={stream} onRemove={onRemove} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
