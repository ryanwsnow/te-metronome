export type TimeSignature = '4/4' | '3/4' | '6/8'
export type Subdivision = 'coarse' | 'medium' | 'fine'
export type ClickKind = 'accent' | 'beat' | 'sub'
export type NoteName = 'quarter' | 'eighth' | 'sixteenth' | 'dotted-quarter'

export type Pattern = {
  bpm: number
  signature: TimeSignature
  subdivision: Subdivision
}

export type SchedulerState = {
  indexInBar: number
  pattern: Pattern
}

export const MIN_BPM = 30
export const MAX_BPM = 240

const SIGNATURES: TimeSignature[] = ['4/4', '3/4', '6/8']
const SUBDIVISIONS: Subdivision[] = ['coarse', 'medium', 'fine']

export function clampBpm(value: number): number {
  if (!Number.isFinite(value)) return 125
  return Math.min(MAX_BPM, Math.max(MIN_BPM, Math.round(value)))
}

export function clampVolume(value: number): number {
  if (!Number.isFinite(value)) return 60
  return Math.min(100, Math.max(0, Math.round(value)))
}

export function isTimeSignature(value: unknown): value is TimeSignature {
  return SIGNATURES.includes(value as TimeSignature)
}

export function isSubdivision(value: unknown): value is Subdivision {
  return SUBDIVISIONS.includes(value as Subdivision)
}

export function mainBeatsPerBar(signature: TimeSignature): number {
  if (signature === '3/4') return 3
  if (signature === '6/8') return 2
  return 4
}

export function clicksPerMainBeat(signature: TimeSignature, subdivision: Subdivision): number {
  if (signature === '6/8') {
    if (subdivision === 'coarse') return 1
    if (subdivision === 'medium') return 3
    return 6
  }
  if (subdivision === 'coarse') return 1
  if (subdivision === 'medium') return 2
  return 4
}

export function mainBeatDuration(bpm: number): number {
  return 60 / bpm
}

export function clickInterval(bpm: number, signature: TimeSignature, subdivision: Subdivision): number {
  return mainBeatDuration(bpm) / clicksPerMainBeat(signature, subdivision)
}

export function barDuration(bpm: number, signature: TimeSignature): number {
  return mainBeatDuration(bpm) * mainBeatsPerBar(signature)
}

export function clickKind(signature: TimeSignature, subdivision: Subdivision, indexInBar: number): ClickKind {
  const perBeat = clicksPerMainBeat(signature, subdivision)
  if (indexInBar % perBeat !== 0) return 'sub'
  return Math.floor(indexInBar / perBeat) === 0 ? 'accent' : 'beat'
}

export type TimelineClick = {
  time: number
  kind: ClickKind
  index: number
  pattern: Pattern
}

const BEAT_FLASH_SECONDS = 0.09

export function mainBeatIndex(signature: TimeSignature, subdivision: Subdivision, indexInBar: number): number {
  return Math.floor(indexInBar / clicksPerMainBeat(signature, subdivision))
}

/** +1 is the right extreme, -1 is the left. Phase 0 is the beat that just sounded. */
export function swingFromBeat(beatIndex: number, phase: number): number {
  const clamped = Math.min(1, Math.max(0, phase))
  const cosine = Math.cos(clamped * Math.PI)
  return beatIndex % 2 === 0 ? cosine : -cosine
}

export function beatVisual(clicks: readonly TimelineClick[], now: number): { pendulum: number; beatSide: 'left' | 'right' | null } {
  let lastBeat: TimelineClick | null = null
  let nextBeat: TimelineClick | null = null
  for (const click of clicks) {
    if (click.kind === 'sub') continue
    if (click.time <= now) lastBeat = click
    else if (!nextBeat) nextBeat = click
  }

  if (!lastBeat) {
    const upcoming = nextBeat
    const beatIndex = upcoming
      ? mainBeatIndex(upcoming.pattern.signature, upcoming.pattern.subdivision, upcoming.index)
      : 0
    return { pendulum: beatIndex % 2 === 0 ? 1 : -1, beatSide: null }
  }

  const beatIndex = mainBeatIndex(lastBeat.pattern.signature, lastBeat.pattern.subdivision, lastBeat.index)
  const span = nextBeat ? nextBeat.time - lastBeat.time : mainBeatDuration(lastBeat.pattern.bpm)
  const phase = span > 0 ? (now - lastBeat.time) / span : 0
  const heardFor = now - lastBeat.time
  const beatSide = heardFor >= 0 && heardFor < BEAT_FLASH_SECONDS
    ? beatIndex % 2 === 0 ? 'right' : 'left'
    : null
  return { pendulum: swingFromBeat(beatIndex, phase), beatSide }
}

export function advanceAfterClick(state: SchedulerState, desired: Pattern): { interval: number; next: SchedulerState } {
  const perBeat = clicksPerMainBeat(state.pattern.signature, state.pattern.subdivision)
  const total = perBeat * mainBeatsPerBar(state.pattern.signature)
  const isEndOfBeat = state.indexInBar % perBeat === perBeat - 1
  const isEndOfBar = state.indexInBar === total - 1
  const interval = clickInterval(state.pattern.bpm, state.pattern.signature, state.pattern.subdivision)

  if (isEndOfBar) {
    return {
      interval,
      next: { indexInBar: 0, pattern: { ...desired } },
    }
  }

  if (isEndOfBeat) {
    return {
      interval,
      next: {
        indexInBar: state.indexInBar + 1,
        pattern: { ...state.pattern, bpm: desired.bpm },
      },
    }
  }

  return {
    interval,
    next: { indexInBar: state.indexInBar + 1, pattern: state.pattern },
  }
}

/** Note for one audible click. The BPM beat unit stays a quarter or dotted quarter. */
export function subdivisionNote(signature: TimeSignature, subdivision: Subdivision): NoteName {
  if (subdivision === 'medium') return 'eighth'
  if (subdivision === 'fine') return 'sixteenth'
  return signature === '6/8' ? 'dotted-quarter' : 'quarter'
}

export function noteLabel(note: NoteName): string {
  if (note === 'dotted-quarter') return 'Dotted quarter note'
  if (note === 'eighth') return 'Eighth note'
  if (note === 'sixteenth') return 'Sixteenth note'
  return 'Quarter note'
}

export function subdivisionChoices(): { id: Subdivision; label: string }[] {
  return [
    { id: 'fine', label: '1/16' },
    { id: 'medium', label: '1/8' },
    { id: 'coarse', label: '1/4' },
  ]
}

export function beatUnitLabel(signature: TimeSignature): string {
  return signature === '6/8' ? 'Dotted quarter note' : 'Quarter note'
}

export const SUBDIVISION_STEPS: Subdivision[] = ['coarse', 'medium', 'fine']

export function subdivisionIndex(subdivision: Subdivision): number {
  return SUBDIVISION_STEPS.indexOf(subdivision)
}

/** Perceptual loudness. 0 is mute. 100 is unity gain. Low settings stay audible. */
export function volumeToGain(volume: number): number {
  if (volume <= 0) return 0
  const t = Math.min(100, volume) / 100
  const db = (t - 1) * 36
  return 10 ** (db / 20)
}
