import type { CSSProperties, MouseEvent } from 'react'

type PlayPauseProps = {
  playing: boolean
  style?: CSSProperties
  onClick: (event: MouseEvent<HTMLButtonElement>) => void
}

export function PlayPause({ playing, style, onClick }: PlayPauseProps) {
  return (
    <button
      type="button"
      className={playing ? 'play-pause' : 'play-pause is-pause'}
      style={style}
      aria-pressed={playing}
      aria-label={playing ? 'Pause metronome' : 'Play metronome'}
      onClick={onClick}
    >
      <span className="play-pause-cap" />
      <span className="play-pause-bars" aria-hidden="true">
        <span />
        <span />
      </span>
      <svg className="play-pause-mark" viewBox="0 0 14.659 16.284" aria-hidden="true">
        <path d="M0 0 L0 16.284 L14.659 8.142 Z" />
      </svg>
    </button>
  )
}
