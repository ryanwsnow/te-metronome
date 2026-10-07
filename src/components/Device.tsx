import { useEffect, useRef, useState, type CSSProperties } from 'react'
import type { VisualState } from '../audio/engine'
import { Knob } from './Knob'
import {
  MAX_BPM,
  MIN_BPM,
  SUBDIVISION_STEPS,
  beatUnitLabel,
  subdivisionChoices,
  subdivisionIndex,
  type Subdivision,
  type TimeSignature,
} from '../rhythm'
import type { Settings } from '../storage'
import headerPanel from '../assets/header-panel.svg'
import speakerA from '../assets/speaker-a.svg'
import speakerB from '../assets/speaker-b.svg'
import speakerC from '../assets/speaker-c.svg'
import iconPretty from '../assets/icon-pretty.svg'
import vibration from '../assets/vibration.svg'
import noteQuarter from '../assets/note-quarter.svg'
import noteDotted from '../assets/note-dotted-quarter.svg'
import midiMark from '../assets/midi.svg'
import barCorner from '../assets/bar-corner.svg'
import sliderTrack from '../assets/slider-track.svg'
import sliderKnob from '../assets/slider-knob.svg'
import decalLines from '../assets/decal-lines.svg'
import powerOff from '../assets/power-off.svg'
import powerOn from '../assets/power-on.svg'

const SIGNATURES: TimeSignature[] = ['4/4', '3/4', '6/8']

const ARM_PIVOT = '24 55.2'
const ARM_LEFT = -26.42
const ARM_RIGHT = 25.49

function armDegrees(pendulum: number) {
  return ARM_LEFT + ((pendulum + 1) / 2) * (ARM_RIGHT - ARM_LEFT)
}

type DeviceProps = {
  settings: Settings
  playing: boolean
  onSettings: (settings: Settings) => void
  onToggle: () => void
  onResume: () => void
  getVisual: () => VisualState | null
}

function place(x: number, y: number, w: number, h: number): CSSProperties {
  return {
    position: 'absolute',
    left: `calc(var(--u) * ${x})`,
    top: `calc(var(--u) * ${y})`,
    width: `calc(var(--u) * ${w})`,
    height: `calc(var(--u) * ${h})`,
  }
}

export function Device({ settings, playing, onSettings, onToggle, onResume, getVisual }: DeviceProps) {
  const armRef = useRef<SVGPathElement>(null)
  const ticksRef = useRef<SVGGElement>(null)
  const getVisualRef = useRef(getVisual)
  getVisualRef.current = getVisual
  const [sounding, setSounding] = useState<VisualState['pattern'] | null>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (!playing) {
      setSounding(null)
      armRef.current?.setAttribute('transform', `rotate(${ARM_RIGHT} ${ARM_PIVOT})`)
      if (ticksRef.current) delete ticksRef.current.dataset.side
      return
    }

    let frame = 0
    const loop = () => {
      const visual = getVisualRef.current()
      if (visual) {
        const degrees = reducedMotion ? (ARM_LEFT + ARM_RIGHT) / 2 : armDegrees(visual.pendulum)
        armRef.current?.setAttribute('transform', `rotate(${degrees} ${ARM_PIVOT})`)
        if (ticksRef.current) {
          ticksRef.current.dataset.side = visual.pendulum < 0 ? 'left' : 'right'
        }
        setSounding((current) => {
          if (
            current &&
            current.signature === visual.pattern.signature &&
            current.subdivision === visual.pattern.subdivision &&
            current.bpm === visual.pattern.bpm
          ) {
            return current
          }
          return visual.pattern
        })
      }
      frame = window.requestAnimationFrame(loop)
    }
    frame = window.requestAnimationFrame(loop)
    return () => window.cancelAnimationFrame(frame)
  }, [playing, reducedMotion])

  const choices = subdivisionChoices(settings.signature)
  const signaturePending = playing && sounding !== null && sounding.signature !== settings.signature
  const subdivisionPending = playing && sounding !== null && sounding.subdivision !== settings.subdivision
  const subIndex = subdivisionIndex(settings.subdivision)
  const subAngle = subIndex * 60
  const volumeAngle = -135 + (settings.volume / 100) * 270
  const sliderTravel = 381 - 57
  const sliderX = ((settings.bpm - MIN_BPM) / (MAX_BPM - MIN_BPM)) * sliderTravel

  function setSignature(signature: TimeSignature) {
    onSettings({ ...settings, signature })
  }

  return (
    <div className="stage" onPointerDown={onResume}>
      <div className="device-slot">
        <article className="device" aria-label="Metronome">
          <div className="body" style={place(6, 7, 416, 918)} />
          <div className="screen" style={place(6, 141, 416, 319)} />
          <img className="art" style={place(14, 16, 266, 120)} src={headerPanel} alt="" />
          <img className="art" style={place(288, 7, 134, 134)} src={speakerA} alt="" />
          <img className="art" style={place(288, 7, 134, 134)} src={speakerB} alt="" />
          <img className="art" style={place(288, 7, 134, 134)} src={speakerC} alt="" />

          <div className="bpm-stack" id="bpm-value" style={place(118, 188, 192, 96)}>
            {String(settings.bpm).padStart(3, ' ').split('').map((digit, index) => (
              <span className="bpm-slot" key={index}>
                <span className="bpm-ghost" aria-hidden="true">8</span>
                {digit.trim() ? <span className="bpm-digit">{digit}</span> : null}
              </span>
            ))}
          </div>

          <img className="art" style={place(23, 328.1, 21, 82)} src={iconPretty} alt="" />
          <img className="art" style={place(81.8, 348.6, 55, 41)} src={vibration} alt="" />

          <svg className="ticks-layer" style={place(180.6, 401, 36, 10)} viewBox="0 0 36 10" aria-hidden="true">
            <g ref={ticksRef} className="ticks">
              {(['left', 'right'] as const).map((side, sideIndex) => (
                <g key={side} data-side={side}>
                  {Array.from({ length: 6 }, (_, index) => (
                    <rect
                      key={index}
                      x={sideIndex * 20 + (index % 3) * 6}
                      y={Math.floor(index / 3) * 6}
                      width="4"
                      height="4"
                    />
                  ))}
                </g>
              ))}
            </g>
          </svg>
          <button
            type="button"
            className={playing ? 'metro is-on' : 'metro'}
            style={place(174.6, 329.5, 48, 79.2)}
            aria-pressed={playing}
            aria-label={playing ? 'Stop metronome' : 'Start metronome'}
            onClick={(event) => {
              event.stopPropagation()
              onToggle()
            }}
          >
            <svg viewBox="0 0 48 79.2" className="metro-svg" aria-hidden="true">
              <path d="M6.59786 59.4H41.4021C43.0553 59.4 44.2135 57.7677 43.6675 56.2073L26.2653 6.47403C25.5154 4.33091 22.4846 4.33091 21.7347 6.47403L4.33253 56.2073C3.78654 57.7677 4.9447 59.4 6.59786 59.4Z" fill="none" stroke="#B2BCC8" strokeWidth="1.6" />
              <path ref={armRef} d="M24 55.2L24 9.64" transform={`rotate(${ARM_RIGHT} ${ARM_PIVOT})`} stroke="#E22D62" strokeWidth="2.4" />
              <rect x="19.2" y="52.8" width="9.6" height="4.8" fill="#B2BCC8" />
            </svg>
          </button>

          <span className="bar-label" style={place(262.4, 345.6, 36, 20)}>BAR</span>
          <img className="art bar-corner" style={place(260.4, 343.4, 18.5, 21.5)} src={barCorner} alt="" />
          <img className="art" style={place(262.5, 386.1, 35.7, 10.5)} src={midiMark} alt="" />

          <img
            className="art"
            style={place(346.2, 338, 10.8, 14.4)}
            src={settings.signature === '6/8' ? noteDotted : noteQuarter}
            alt=""
          />
          <span className="sr-only">Beat unit: {beatUnitLabel(settings.signature)}</span>
          <div style={place(371.2, 321, 34, 96.3)}>
            {choices.map((choice, index) => {
              const active = choice.id === settings.subdivision
              const soundingNow = sounding?.subdivision === choice.id
              const className = [
                'sub-chip',
                active ? 'is-active' : '',
                active && subdivisionPending ? 'is-pending' : '',
                !active && subdivisionPending && soundingNow ? 'is-sounding' : '',
              ].filter(Boolean).join(' ')
              return (
                <span key={choice.id} className={className} style={{ top: `calc(var(--u) * ${index === 0 ? 0 : index === 1 ? 35.8 : 71.5})` }}>
                  {choice.label}
                </span>
              )
            })}
          </div>

          <span className="control-label" style={place(24, 488, 40, 15)}>BPM</span>
          <div style={place(24, 518, 381, 28)}>
            <img className="art" src={sliderTrack} alt="" />
          </div>
          <img className="art" style={{ ...place(24 + sliderX, 503, 57, 57), pointerEvents: 'none' }} src={sliderKnob} alt="" />
          <input
            id="bpm-slider"
            className="bpm-slider"
            style={place(24, 503, 381, 57)}
            type="range"
            min={MIN_BPM}
            max={MAX_BPM}
            step={1}
            value={settings.bpm}
            aria-label="BPM"
            aria-valuetext={`${settings.bpm} beats per minute`}
            onChange={(event) => onSettings({ ...settings, bpm: Number(event.target.value) })}
          />

          <img className="art" style={place(214, 512, 37, 229)} src={decalLines} alt="" />
          <span className="control-label label-center" style={place(68, 653, 87, 15)}>VOLUME</span>
          <div style={place(68, 688, 87, 87)}>
            <Knob
              label="Volume"
              variant="volume"
              min={0}
              max={100}
              step={1}
              value={settings.volume}
              angle={volumeAngle}
              valueText={`${settings.volume}%`}
              onChange={(volume) => onSettings({ ...settings, volume })}
            />
          </div>

          <span className="control-label" style={place(256, 607, 110, 15)}>TIME SIGNATURE</span>
          <div
            style={place(255, 637, 101, 37)}
            role="radiogroup"
            aria-label="Time signature"
            onKeyDown={(event) => {
              const current = SIGNATURES.indexOf(settings.signature)
              if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
                event.preventDefault()
                setSignature(SIGNATURES[(current + 1) % SIGNATURES.length])
              } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
                event.preventDefault()
                setSignature(SIGNATURES[(current - 1 + SIGNATURES.length) % SIGNATURES.length])
              }
            }}
          >
            {SIGNATURES.map((signature, index) => {
              const selected = settings.signature === signature
              const soundingNow = sounding?.signature === signature
              const className = [
                'timing-btn',
                selected ? 'is-selected' : '',
                selected && signaturePending ? 'is-pending' : '',
                !selected && signaturePending && soundingNow ? 'is-sounding' : '',
              ].filter(Boolean).join(' ')
              const [numerator, denominator] = signature.split('/')
              return (
                <button
                  key={signature}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  className={className}
                  style={{ left: `calc(var(--u) * ${index * 37})` }}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setSignature(signature)}
                >
                  <svg viewBox="0 0 27 37" aria-hidden="true">
                    <rect width="27" height="37" fill="#000" stroke={selected ? '#E6E6E6' : '#B2B2B2'} />
                    <rect x="1" y="1" width="25" height="35" rx="3" fill={`url(#face-${index})`} stroke={selected ? '#989493' : '#111'} />
                    <text x="13.5" y="16" textAnchor="middle" fill={selected ? '#fff' : '#9c9c9c'}>{numerator}</text>
                    <text x="13.5" y="30" textAnchor="middle" fill={selected ? '#fff' : '#9c9c9c'}>{denominator}</text>
                    <defs>
                      <linearGradient id={`face-${index}`} x1="2" y1="2" x2="24" y2="36" gradientUnits="userSpaceOnUse">
                        <stop offset="0.26" stopColor="#1d1d1d" />
                        <stop offset="0.76" stopColor="#1a1819" />
                      </linearGradient>
                    </defs>
                  </svg>
                </button>
              )
            })}
          </div>

          <span className="control-label label-center" style={place(256, 732, 87, 15)}>SUBDIVISION</span>
          <div style={place(256, 766, 87, 87)}>
            <Knob
              label="Subdivision"
              variant="subdivision"
              min={0}
              max={2}
              step={1}
              value={subIndex}
              angle={subAngle}
              valueText={choices.find((choice) => choice.id === settings.subdivision)?.label ?? '1/4'}
              onChange={(index) => {
                const subdivision: Subdivision = SUBDIVISION_STEPS[index] ?? 'coarse'
                onSettings({ ...settings, subdivision })
              }}
            />
          </div>

          <button
            type="button"
            className="power-btn"
            style={place(62, 872, 49, 39)}
            aria-pressed={playing}
            aria-label={playing ? 'Turn metronome off' : 'Turn metronome on'}
            onClick={(event) => {
              event.stopPropagation()
              onToggle()
            }}
          >
            <img src={playing ? powerOn : powerOff} alt="" />
          </button>
          <p className="sr-only" aria-live="polite">
            {signaturePending || subdivisionPending ? 'Selection applies at the next bar.' : ''}
          </p>
        </article>
      </div>
    </div>
  )
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduced(query.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])
  return reduced
}
