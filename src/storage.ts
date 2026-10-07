import {
  clampBpm,
  clampVolume,
  isSubdivision,
  isTimeSignature,
  type Pattern,
  type Subdivision,
  type TimeSignature,
} from './rhythm'

export type Settings = Pattern & { volume: number }

export const DEFAULT_SETTINGS: Settings = {
  bpm: 125,
  signature: '4/4',
  subdivision: 'coarse',
  volume: 60,
}

const STORAGE_KEY = 'te-metronome-settings'

export function sanitizeSettings(value: unknown): Settings {
  const record = value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
  const signature: TimeSignature = isTimeSignature(record.signature) ? record.signature : DEFAULT_SETTINGS.signature
  const subdivision: Subdivision = isSubdivision(record.subdivision) ? record.subdivision : DEFAULT_SETTINGS.subdivision
  return {
    bpm: clampBpm(Number(record.bpm)),
    signature,
    subdivision,
    volume: clampVolume(Number(record.volume)),
  }
}

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_SETTINGS
    return sanitizeSettings(JSON.parse(raw))
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function saveSettings(settings: Settings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch {
    /* private mode and quota errors leave the session unsaved */
  }
}
