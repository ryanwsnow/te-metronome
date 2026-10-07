import { useRef } from 'react'
import knobSubdivision from '../assets/knob-subdivision.svg'
import knobVolume from '../assets/knob-volume.svg'

type KnobProps = {
  label: string
  value: number
  min: number
  max: number
  step: number
  angle: number
  variant: 'volume' | 'subdivision'
  valueText: string
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
  angle,
  variant,
  valueText,
  onChange,
}: KnobProps) {
  const drag = useRef<{ y: number; value: number } | null>(null)
  const pixelsPerStep = variant === 'volume' ? 2 : 48
  const src = variant === 'volume' ? knobVolume : knobSubdivision

  function commit(next: number) {
    const clamped = clamp(quantize(next, step), min, max)
    if (clamped !== value) onChange(clamped)
  }

  function endDrag() {
    drag.current = null
  }

  return (
    <div className="knob-anchor">
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
          if (event.button !== 0) return
          event.preventDefault()
          const knob = event.currentTarget
          knob.focus()
          knob.setPointerCapture(event.pointerId)
          drag.current = { y: event.clientY, value }
        }}
        onPointerMove={(event) => {
          if (!drag.current) return
          const delta = drag.current.y - event.clientY
          commit(drag.current.value + delta / pixelsPerStep)
        }}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onLostPointerCapture={endDrag}
        onKeyDown={(event) => {
          if (event.key === 'ArrowUp' || event.key === 'ArrowRight') {
            event.preventDefault()
            commit(value + step)
          } else if (event.key === 'ArrowDown' || event.key === 'ArrowLeft') {
            event.preventDefault()
            commit(value - step)
          }
        }}
      >
        <img src={src} alt="" />
        <span
          className={variant === 'volume' ? 'knob-mark knob-mark-volume' : 'knob-mark'}
          style={{ transform: `translate(-50%, -50%) rotate(${angle}deg)` }}
        />
      </button>
    </div>
  )
}
