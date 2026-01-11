import { useEffect, useRef } from 'react';
import { Audio } from 'expo-av';
import { useMetronome } from '../contexts/MetronomeContext';

export const useMetronomeAudio = () => {
  const { bpm, timeSignature, subdivision, volume, isPlaying } = useMetronome();
  const intervalRef = useRef(null);
  const beatCountRef = useRef(0);

  // Initialize audio
  useEffect(() => {
    const initAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: false,
        });
      } catch (error) {
        console.error('Error initializing audio:', error);
      }
    };

    initAudio();
  }, []);

  // Create simple beep sounds using Expo AV
  const createBeep = async (frequency = 800, duration = 0.05) => {
    try {
      // For now, use a simple approach - generate beep using Audio API
      // In production, you'd want to use pre-loaded audio files
      const { sound } = await Audio.Sound.createAsync(
        // Using a simple approach - you may want to create actual tick sound files
        { uri: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjGH0fPSgjMGHm7A7+OZUg0P' },
        { shouldPlay: true, volume: volume / 100 }
      );
      
      setTimeout(() => {
        sound.unloadAsync();
      }, duration * 1000);
    } catch (error) {
      // Fallback: use console log for debugging
      console.log('Tick');
    }
  };

  // Metronome beat logic
  useEffect(() => {
    if (!isPlaying) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      beatCountRef.current = 0;
      return;
    }

    const beatsPerMeasure = parseInt(timeSignature[0]);
    const ticksPerBeat = subdivision === '1/4' ? 1 : subdivision === '1/8' ? 2 : 4;
    const msPerTick = (60 * 1000) / (bpm * ticksPerBeat);

    const playTick = () => {
      const currentBeat = Math.floor(beatCountRef.current / ticksPerBeat);
      const isAccentBeat = currentBeat % beatsPerMeasure === 0;

      if (isAccentBeat && beatCountRef.current % ticksPerBeat === 0) {
        // Play accent on first tick of accent beat
        createBeep(1000, 0.1);
      } else {
        createBeep(800, 0.05);
      }

      beatCountRef.current++;
    };

    intervalRef.current = setInterval(playTick, msPerTick);
    playTick(); // Play immediately

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPlaying, bpm, timeSignature, subdivision, volume]);

  return { beatCount: beatCountRef.current };
};
