import {
  advanceAfterClick,
  beatVisual,
  clickKind,
  mainBeatDuration,
  volumeToGain,
  type Pattern,
  type SchedulerState,
  type TimelineClick,
} from '../rhythm'
import type { Settings } from '../storage'

export type VisualState = {
  beatSide: 'left' | 'right' | null
  pendulum: number
  pattern: Pattern
}

type ScheduledClick = TimelineClick

type LiveNode = {
  node: OscillatorNode
  stopAt: number
}

const LOOKAHEAD_MS = 25
const SCHEDULE_AHEAD = 0.1

export class MetronomeEngine {
  private readSettings: () => Settings
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private timer: number | null = null
  private running = false
  private startToken = 0
  private nextTime = 0
  private state: SchedulerState = {
    indexInBar: 0,
    pattern: { bpm: 125, signature: '4/4', subdivision: 'coarse' },
  }
  private clicks: ScheduledClick[] = []
  private live: LiveNode[] = []
  private appliedVolume = -1

  constructor(readSettings: () => Settings) {
    this.readSettings = readSettings
  }

  async start(): Promise<boolean> {
    if (this.running) return true
    const token = ++this.startToken
    this.ensureContext()
    const ctx = this.ctx!
    const resumed = await Promise.race([
      ctx.resume().then(() => true).catch(() => false),
      new Promise<boolean>((resolve) => {
        window.setTimeout(() => resolve(false), 800)
      }),
    ])
    if (!resumed || token !== this.startToken || ctx.state !== 'running') return false

    const settings = this.readSettings()
    this.state = {
      indexInBar: 0,
      pattern: { bpm: settings.bpm, signature: settings.signature, subdivision: settings.subdivision },
    }
    this.clicks = []
    this.nextTime = ctx.currentTime + 0.06
    this.appliedVolume = settings.volume
    this.master!.gain.cancelScheduledValues(ctx.currentTime)
    this.master!.gain.setValueAtTime(volumeToGain(settings.volume), ctx.currentTime)
    this.running = true
    this.tick()
    return true
  }

  stop(): void {
    this.startToken += 1
    this.running = false
    if (this.timer !== null) {
      window.clearTimeout(this.timer)
      this.timer = null
    }
    const now = this.ctx?.currentTime ?? 0
    if (this.ctx && this.master) {
      this.master.gain.cancelScheduledValues(now)
      this.master.gain.setValueAtTime(0, now)
    }
    for (const item of this.live) {
      try {
        item.node.stop()
      } catch {
        /* already stopped */
      }
    }
    this.live = []
    this.clicks = []
    this.appliedVolume = -1
  }

  setVolume(volume: number): void {
    this.applyVolume(volume)
  }

  resumeIfNeeded(): void {
    if (!this.running || !this.ctx) return
    if (this.ctx.state === 'running') return
    if (this.nextTime < this.ctx.currentTime) {
      this.nextTime = this.ctx.currentTime + 0.05
    }
    void this.ctx.resume()
  }

  getVisual(): VisualState {
    const settings = this.readSettings()
    const fallback: Pattern = {
      bpm: settings.bpm,
      signature: settings.signature,
      subdivision: settings.subdivision,
    }
    if (!this.running || !this.ctx) {
      return { beatSide: null, pendulum: 1, pattern: fallback }
    }

    const now = this.ctx.currentTime
    let audible: ScheduledClick | null = null
    for (const click of this.clicks) {
      if (click.time <= now) audible = click
    }
    const visual = beatVisual(this.clicks, now)
    return {
      pendulum: visual.pendulum,
      beatSide: visual.beatSide,
      pattern: audible?.pattern ?? this.clicks[0]?.pattern ?? fallback,
    }
  }

  dispose(): void {
    this.stop()
    void this.ctx?.close()
    this.ctx = null
    this.master = null
  }

  private ensureContext(): void {
    if (this.ctx) return
    const ctx = new AudioContext()
    const master = ctx.createGain()
    master.gain.value = 0
    master.connect(ctx.destination)
    ctx.onstatechange = () => {
      if (!this.running) return
      if (ctx.state !== 'running') {
        this.nextTime = Math.max(this.nextTime, ctx.currentTime + 0.05)
      }
    }
    this.ctx = ctx
    this.master = master
  }

  private tick = (): void => {
    if (!this.running || !this.ctx || !this.master) return
    const ctx = this.ctx
    if (ctx.state !== 'running') {
      this.nextTime = ctx.currentTime + 0.05
      this.arm()
      return
    }

    const beat = mainBeatDuration(this.state.pattern.bpm)
    const horizon = ctx.currentTime + Math.max(SCHEDULE_AHEAD, beat) + 0.001
    if (this.nextTime < ctx.currentTime - 0.02) {
      this.nextTime = ctx.currentTime + 0.05
    }

    const desired = this.readSettings()
    let guard = 0
    while (this.nextTime < horizon && guard < 16) {
      guard += 1
      this.scheduleClick(this.nextTime, this.state)
      const step = advanceAfterClick(this.state, {
        bpm: desired.bpm,
        signature: desired.signature,
        subdivision: desired.subdivision,
      })
      this.nextTime += step.interval
      this.state = step.next
    }

    this.applyVolume(desired.volume)
    this.prune(ctx.currentTime)
    this.arm()
  }

  private scheduleClick(time: number, state: SchedulerState): void {
    const kind = clickKind(state.pattern.signature, state.pattern.subdivision, state.indexInBar)
    const duration = kind === 'accent' ? 0.06 : kind === 'beat' ? 0.04 : 0.028
    const peak = kind === 'accent' ? 0.72 : kind === 'beat' ? 0.42 : 0.18
    const freq = kind === 'accent' ? 1760 : kind === 'beat' ? 1320 : 990

    this.spawnTone(time, freq, peak, duration, kind === 'accent')
    if (kind === 'accent') {
      this.spawnTone(time, 880, 0.22, duration, true)
    }

    this.clicks.push({
      time,
      kind,
      index: state.indexInBar,
      pattern: state.pattern,
    })
  }

  private spawnTone(time: number, freq: number, peak: number, duration: number, drop: boolean): void {
    const ctx = this.ctx!
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, time)
    if (drop) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(80, freq * 0.55), time + duration)
    }
    gain.gain.setValueAtTime(0.0001, time)
    gain.gain.exponentialRampToValueAtTime(peak, time + 0.002)
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration)
    osc.connect(gain)
    gain.connect(this.master!)
    osc.start(time)
    const stopAt = time + duration + 0.02
    osc.stop(stopAt)
    this.live.push({ node: osc, stopAt })
  }

  private applyVolume(volume: number): void {
    if (!this.running || !this.ctx || !this.master) return
    if (volume === this.appliedVolume) return
    this.appliedVolume = volume
    const now = this.ctx.currentTime
    this.master.gain.cancelScheduledValues(now)
    this.master.gain.setTargetAtTime(volumeToGain(volume), now, 0.03)
  }

  private prune(now: number): void {
    this.clicks = this.clicks.filter((click) => click.time > now - 4)
    this.live = this.live.filter((item) => item.stopAt > now)
  }

  private arm(): void {
    this.timer = window.setTimeout(this.tick, LOOKAHEAD_MS)
  }
}
