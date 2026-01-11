import React, { createContext, useContext, useState, useCallback } from 'react';

const MetronomeContext = createContext(undefined);

export const MetronomeProvider = ({ children }) => {
  const [bpm, setBpmState] = useState(120);
  const [timeSignature, setTimeSignatureState] = useState('4/4');
  const [subdivision, setSubdivisionState] = useState('1/4');
  const [volume, setVolumeState] = useState(100);
  const [isPlaying, setIsPlayingState] = useState(false);

  const setBpm = useCallback((newBpm) => {
    setBpmState(Math.max(30, Math.min(300, newBpm)));
  }, []);

  const setTimeSignature = useCallback((sig) => {
    setTimeSignatureState(sig);
  }, []);

  const setSubdivision = useCallback((sub) => {
    setSubdivisionState(sub);
  }, []);

  const setVolume = useCallback((vol) => {
    setVolumeState(Math.max(0, Math.min(100, vol)));
  }, []);

  const togglePlay = useCallback(() => {
    setIsPlayingState(prev => !prev);
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
