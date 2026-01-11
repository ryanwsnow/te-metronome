import { useEffect, useRef } from 'react';
import { Audio } from 'expo-av';
import { useMetronome } from '../contexts/MetronomeContext';

export const useMetronomeAudio = () => {
  const { bpm, timeSignature, subdivision, volume, isPlaying } = useMetronome();
  const intervalRef = useRef(null);
  const beatCountRef = useRef(0);
  const soundRef = useRef(null);

  useEffect(() => {
    // Initialize audio mode
    const initAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
        });
      } catch (error) {
        console.error('Error setting audio mode:', error);
      }
    };

    initAudio();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

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

    const playTick = async () => {
      const beatInMeasure = Math.floor(beatCountRef.current / ticksPerBeat) % beatsPerMeasure;
      const isAccentBeat = beatInMeasure === 0;
      
      try {
        // For now, we'll use a simple beep sound
        // TODO: Replace with actual tick/accent sound files
        // Create a simple tone using Web Audio API or load audio files
        console.log(isAccentBeat ? 'ACCENT' : 'tick', beatCountRef.current);
      } catch (error) {
        console.error('Error playing tick:', error);
      }

      beatCountRef.current++;
    };

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Start new interval
    intervalRef.current = setInterval(playTick, msPerTick);
    playTick(); // Play immediately

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPlaying, bpm, timeSignature, subdivision]);

  return { beatCount: beatCountRef.current };
};
