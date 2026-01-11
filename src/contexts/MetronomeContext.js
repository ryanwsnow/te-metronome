import React, { createContext, useContext, useState, useCallback } from 'react';
import { DEFAULT_BPM, MIN_BPM, MAX_BPM, DEFAULT_VOLUME, MIN_VOLUME, MAX_VOLUME } from '../types';

const MetronomeContext = createContext(undefined);

export const MetronomeProvider = ({ children }) => {
  const [bpm, setBpmState] = useState(DEFAULT_BPM);
  const [timeSignature, setTimeSignatureState] = useState('4/4');
  const [subdivision, setSubdivisionState] = useState('1/4');
  const [volume, setVolumeState] = useState(DEFAULT_VOLUME);
  const [isPlaying, setIsPlayingState] = useState(false);

  const setBpm = useCallback((newBpm) => {
    setBpmState(Math.max(MIN_BPM, Math.min(MAX_BPM, newBpm)));
  }, []);

  const setTimeSignature = useCallback((newTimeSignature) => {
    setTimeSignatureState(newTimeSignature);
  }, []);

  const setSubdivision = useCallback((newSubdivision) => {
    setSubdivisionState(newSubdivision);
  }, []);

  const setVolume = useCallback((newVolume) => {
    setVolumeState(Math.max(MIN_VOLUME, Math.min(MAX_VOLUME, newVolume)));
  }, []);

  const togglePlay = useCallback(() => {
    setIsPlayingState((prev) => !prev);
  }, []);

  const value = {
    bpm,
    timeSignature,
    subdivision,
    volume,
    isPlaying,
    setBpm,
    setTimeSignature,
    setSubdivision,
    setVolume,
    togglePlay,
  };

  return (
    <MetronomeContext.Provider value={value}>
      {children}
    </MetronomeContext.Provider>
  );
};

export const useMetronome = () => {
  const context = useContext(MetronomeContext);
  if (!context) {
    throw new Error('useMetronome must be used within MetronomeProvider');
  }
  return context;
};
