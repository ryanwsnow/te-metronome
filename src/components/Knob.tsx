import { useRef, useState } from 'react'
import knobSubdivision from '../assets/knob-subdivision.svg'
import knobVolume from '../assets/knob-volume.svg'

type KnobProps = {
  label: string
  value: number
  min: number
  max: number
  step: number
  sensitivity: number
  angle: number
  variant: 'volume' | 'subdivision'
  valueText: string
  showReadout?: boolean
  onChange: (value: number) => void
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function quantize(value: number, step: number) {
  const snapped = Math.round(value / step) * step
  return Number(snapped.toFixed(6))
}

export function Knob({
  label,
  value,
  min,
  max,
  step,
  sensitivity,
  angle,
  variant,
  valueText,
  showReadout = false,
  onChange,
}: KnobProps) {
  const drag = useRef<{ y: number; value: number } | null>(null)
  const [readout, setReadout] = useState(false)
  const hideTimer = useRef<number | null>(null)

  function reveal() {
    if (!showReadout) return
    setReadout(true)
    if (hideTimer.current !== null) window.clearTimeout(hideTimer.current)
    hideTimer.current = window.setTimeout(() => setReadout(false), 800)
  }

  function commit(next: number) {
    const clamped = clamp(quantize(next, step), min, max)
    if (clamped !== value) onChange(clamped)
    reveal()
  }

  const src = variant === 'volume' ? knobVolume : knobSubdivision

  return (
    <div className="knob-anchor">
      {showReadout && readout && (
        <span className="knob-readout" aria-hidden="true">
          {valueText}
        </span>
      )}
      <button
        type="button"
        className="knob"
        aria-label={label}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-valuetext={valueText}
          role="slider"
          aria-orientation="vertical"
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId)
            drag.current = { y: event.clientY, value }
          }}
          onPointerMove={(event) => {
            if (!drag.current) return
            const delta = drag.current.y - event.clientY
            commit(drag.current.value + delta / sensitivity)
          }}
          onPointerUp={() => {
            drag.current = null
          }}
          onPointerCancel={() => {
            drag.current = null
          }}
          onKeyDown={(event) => {
            const page = variant === 'volume' ? 10 : step
            if (event.key === 'ArrowUp' || event.key === 'ArrowRight') {
              event.preventDefault()
              commit(value + step)
            } else if (event.key === 'ArrowDown' || event.key === 'ArrowLeft') {
              event.preventDefault()
              commit(value - step)
            } else if (event.key === 'PageUp') {
              event.preventDefault()
              commit(value + page)
            } else if (event.key === 'PageDown') {
              event.preventDefault()
              commit(value - page)
            } else if (event.key === 'Home') {
              event.preventDefault()
              commit(min)
            } else if (event.key === 'End') {
              event.preventDefault()
              commit(max)
            }
          }}
        >
        <img src={src} alt="" style={variant === 'volume' ? { transform: `rotate(${angle}deg)` } : undefined} />
        {variant === 'subdivision' && (
          <span className="knob-mark" style={{ transform: `translate(-50%, -50%) rotate(${angle}deg)` }} />
        )}
      </button>
    </div>
  )
}
