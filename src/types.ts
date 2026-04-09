export interface Stream {
  id: string
  channel: string
}

export type YoutubeKind = 'video' | 'playlist'

export interface YoutubeVideo {
  id: string
  kind: YoutubeKind
  videoId: string
  listId: string
  label: string
}
