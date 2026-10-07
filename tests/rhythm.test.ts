import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  advanceAfterClick,
  barDuration,
  clickInterval,
  clickKind,
  clicksPerMainBeat,
  mainBeatDuration,
  mainBeatsPerBar,
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

test('volume curve is mute at zero, unity at full, and monotonic', () => {
  assert.equal(volumeToGain(0), 0)
  assert.equal(volumeToGain(100), 1)
  assert.ok(volumeToGain(1) > 0)
  assert.ok(volumeToGain(60) > volumeToGain(1))
  assert.ok(volumeToGain(60) < 1)
})
