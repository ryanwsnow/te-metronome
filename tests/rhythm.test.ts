import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  advanceAfterClick,
  barDuration,
  beatUnitLabel,
  beatVisual,
  clickInterval,
  clickKind,
  clicksPerMainBeat,
  swingFromBeat,
  mainBeatDuration,
  mainBeatsPerBar,
  noteLabel,
  subdivisionChoices,
  subdivisionNote,
  volumeToGain,
  type Pattern,
  type SchedulerState,
  type TimeSignature,
  type Subdivision,
} from '../src/rhythm.ts'

function walk(pattern: Pattern, count: number, desired: Pattern = pattern) {
  let state: SchedulerState = { indexInBar: 0, pattern }
  const times = [0]
  const kinds = []
  for (let i = 0; i < count; i += 1) {
    kinds.push(clickKind(state.pattern.signature, state.pattern.subdivision, state.indexInBar))
    const step = advanceAfterClick(state, desired)
    times.push(times[times.length - 1] + step.interval)
    state = step.next
  }
  return { times, kinds, state }
}

test('main beat duration is 60 / BPM and ignores subdivision', () => {
  const signatures: TimeSignature[] = ['4/4', '3/4', '6/8']
  const subdivisions: Subdivision[] = ['coarse', 'medium', 'fine']
  for (const signature of signatures) {
    for (const subdivision of subdivisions) {
      const beat = mainBeatDuration(120)
      assert.equal(beat, 0.5)
      const interval = clickInterval(120, signature, subdivision)
      const clicks = clicksPerMainBeat(signature, subdivision)
      assert.ok(Math.abs(interval * clicks - beat) < 1e-10)
      assert.ok(Math.abs(barDuration(120, signature) - beat * mainBeatsPerBar(signature)) < 1e-10)
    }
  }
})

test('120 BPM 4/4 quarter notes click every 0.5s and the bar is 2s', () => {
  const pattern: Pattern = { bpm: 120, signature: '4/4', subdivision: 'coarse' }
  const { times, kinds } = walk(pattern, 4)
  assert.deepEqual(kinds, ['accent', 'beat', 'beat', 'beat'])
  assert.ok(Math.abs(times[1] - 0.5) < 1e-10)
  assert.ok(Math.abs(times[4] - 2) < 1e-10)
})

test('120 BPM 3/4 eighth notes click every 0.25s and the bar is 1.5s', () => {
  const pattern: Pattern = { bpm: 120, signature: '3/4', subdivision: 'medium' }
  const { times, kinds } = walk(pattern, 6)
  assert.equal(kinds.filter((kind) => kind === 'sub').length, 3)
  assert.equal(kinds[0], 'accent')
  assert.equal(kinds[2], 'beat')
  assert.ok(Math.abs(times[1] - 0.25) < 1e-10)
  assert.ok(Math.abs(times[6] - 1.5) < 1e-10)
})

test('120 BPM 6/8 eighth notes group strong, soft, soft, normal, soft, soft', () => {
  const pattern: Pattern = { bpm: 120, signature: '6/8', subdivision: 'medium' }
  const { times, kinds } = walk(pattern, 6)
  assert.deepEqual(kinds, ['accent', 'sub', 'sub', 'beat', 'sub', 'sub'])
  assert.ok(Math.abs(clickInterval(120, '6/8', 'medium') - 0.5 / 3) < 1e-10)
  assert.ok(Math.abs(times[1] - 0.5 / 3) < 1e-10)
  assert.ok(Math.abs(times[6] - 1) < 1e-10)
})

test('BPM changes on the next main beat without restarting the bar', () => {
  const pattern: Pattern = { bpm: 120, signature: '4/4', subdivision: 'fine' }
  const desired: Pattern = { ...pattern, bpm: 60 }
  let state: SchedulerState = { indexInBar: 0, pattern }
  for (let i = 0; i < 3; i += 1) {
    const step = advanceAfterClick(state, desired)
    assert.equal(step.interval, 0.5 / 4)
    assert.equal(step.next.pattern.bpm, 120)
    assert.equal(step.next.pattern.signature, '4/4')
    state = step.next
  }
  const boundary = advanceAfterClick(state, desired)
  assert.equal(boundary.interval, 0.5 / 4)
  assert.equal(boundary.next.pattern.bpm, 60)
  assert.equal(boundary.next.indexInBar, 4)
  const next = advanceAfterClick(boundary.next, desired)
  assert.equal(next.interval, 1 / 4)
})

test('timing and subdivision changes wait for the next bar', () => {
  const pattern: Pattern = { bpm: 120, signature: '4/4', subdivision: 'coarse' }
  const desired: Pattern = { bpm: 120, signature: '6/8', subdivision: 'medium' }
  const { times, state } = walk(pattern, 4, desired)
  assert.ok(Math.abs(times[4] - 2) < 1e-10)
  assert.equal(state.indexInBar, 0)
  assert.equal(state.pattern.signature, '6/8')
  assert.equal(state.pattern.subdivision, 'medium')
  const next = advanceAfterClick(state, desired)
  assert.ok(Math.abs(next.interval - 0.5 / 3) < 1e-10)
})

test('each subdivision position shows the click note without changing the beat unit', () => {
  const positions: Subdivision[] = ['coarse', 'medium', 'fine']
  for (const signature of ['4/4', '3/4'] as const) {
    assert.deepEqual(positions.map((subdivision) => subdivisionNote(signature, subdivision)), ['quarter', 'eighth', 'sixteenth'])
    assert.deepEqual(positions.map((subdivision) => clicksPerMainBeat(signature, subdivision)), [1, 2, 4])
    assert.equal(beatUnitLabel(signature), 'Quarter note')
  }
  assert.deepEqual(positions.map((subdivision) => subdivisionNote('6/8', subdivision)), ['dotted-quarter', 'eighth', 'sixteenth'])
  assert.deepEqual(positions.map((subdivision) => clicksPerMainBeat('6/8', subdivision)), [1, 3, 6])
  assert.equal(beatUnitLabel('6/8'), 'Dotted quarter note')
  assert.equal(noteLabel('dotted-quarter'), 'Dotted quarter note')
  assert.deepEqual(subdivisionChoices().map((choice) => choice.label), ['1/16', '1/8', '1/4'])
})

test('the arm reaches alternating extremes on main beats and ignores subdivision clicks', () => {
  assert.equal(swingFromBeat(0, 0), 1)
  assert.ok(Math.abs(swingFromBeat(0, 1) - -1) < 1e-10)
  assert.ok(Math.abs(swingFromBeat(1, 0) - -1) < 1e-10)
  assert.equal(swingFromBeat(1, 1), 1)
  assert.ok(Math.abs(swingFromBeat(0, 0.5)) < 1e-10)
  assert.equal(swingFromBeat(2, 0), 1)

  const pattern: Pattern = { bpm: 120, signature: '4/4', subdivision: 'medium' }
  const clicks = [
    { time: 1, kind: 'accent' as const, index: 0, pattern },
    { time: 1.25, kind: 'sub' as const, index: 1, pattern },
    { time: 1.5, kind: 'beat' as const, index: 2, pattern },
    { time: 1.75, kind: 'sub' as const, index: 3, pattern },
    { time: 2, kind: 'beat' as const, index: 4, pattern },
  ]
  const before = beatVisual(clicks, 0.9)
  assert.equal(before.pendulum, 1)
  assert.equal(before.beatSide, null)
  const onRight = beatVisual(clicks, 1)
  assert.equal(onRight.pendulum, 1)
  assert.equal(onRight.beatSide, 'right')
  const mid = beatVisual(clicks, 1.25)
  assert.ok(Math.abs(mid.pendulum) < 1e-10)
  assert.equal(mid.beatSide, null)
  const onLeft = beatVisual(clicks, 1.5)
  assert.ok(Math.abs(onLeft.pendulum - -1) < 1e-10)
  assert.equal(onLeft.beatSide, 'left')
  const back = beatVisual(clicks, 2)
  assert.equal(back.pendulum, 1)
  assert.equal(back.beatSide, 'right')
})

test('volume curve is mute at zero, unity at full, and monotonic', () => {
  assert.equal(volumeToGain(0), 0)
  assert.equal(volumeToGain(100), 1)
  assert.ok(volumeToGain(1) > 0)
  assert.ok(volumeToGain(60) > volumeToGain(1))
  assert.ok(volumeToGain(60) < 1)
})
