import { useEffect, useRef, useState } from 'react'
import { Device } from './components/Device'
import { MetronomeEngine, type VisualState } from './audio/engine'
import { loadSettings, saveSettings, type Settings } from './storage'

export default function App() {
  const [settings, setSettings] = useState<Settings>(loadSettings)
  const [playing, setPlaying] = useState(false)
  const settingsRef = useRef(settings)
  const engineRef = useRef<MetronomeEngine | null>(null)
  const busy = useRef(false)
  settingsRef.current = settings

  function engine() {
    if (!engineRef.current) {
      engineRef.current = new MetronomeEngine(() => settingsRef.current)
    }
    return engineRef.current
  }

  useEffect(() => {
    saveSettings(settings)
  }, [settings])

  useEffect(() => {
    engineRef.current?.setVolume(settings.volume)
  }, [settings.volume])

  useEffect(() => () => engineRef.current?.dispose(), [])

  async function toggle() {
    if (busy.current) return
    busy.current = true
    try {
      const metro = engine()
      if (playing) {
        metro.stop()
        setPlaying(false)
        return
      }
      setPlaying(await metro.start())
    } finally {
      busy.current = false
    }
  }

  function getVisual(): VisualState | null {
    return engineRef.current?.getVisual() ?? null
  }

  return (
    <Device
      settings={settings}
      playing={playing}
      onSettings={setSettings}
      onToggle={() => {
        void toggle()
      }}
      onResume={() => engineRef.current?.resumeIfNeeded()}
      getVisual={getVisual}
    />
  )
}
