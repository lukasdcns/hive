import type { Folder } from '../types'

const KEY = 'hive_folders'

export function saveFolders(folders: Folder[]): void {
  try { localStorage.setItem(KEY, JSON.stringify(folders)) } catch {}
}

export function loadFolders(): Folder[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}
