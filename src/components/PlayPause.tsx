import type { CSSProperties, MouseEvent } from 'react'
import pauseKeyDim from '../assets/pause-key-dim.svg'
import pauseKeyLit from '../assets/pause-key-lit.svg'
import playKeyDim from '../assets/play-key-dim.svg'
import playKeyLit from '../assets/play-key-lit.svg'

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
      <img className="play-pause-pause" src={playing ? pauseKeyLit : pauseKeyDim} alt="" />
      <img className="play-pause-play" src={playing ? playKeyDim : playKeyLit} alt="" />
    </button>
  )
}
