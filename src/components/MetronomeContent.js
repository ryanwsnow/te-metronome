import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useMetronome } from '../contexts/MetronomeContext';
import { useMetronomeAudio } from '../hooks/useMetronomeAudio';
import { Header } from './Header';
import { BPNDisplay } from './BPNDisplay';
import { TimingControls } from './TimingControls';
import { SubdivisionControl } from './SubdivisionControl';
import { VolumeControl } from './VolumeControl';
import { MetronomeVisualizer } from './MetronomeVisualizer';
import { TempoSlider } from './TempoSlider';
import { PlayButton } from './PlayButton';

export const MetronomeContent = () => {
  useMetronomeAudio();

  return (
    <View style={styles.container}>
      <Header />
      <View style={styles.displaySection}>
        <BPNDisplay />
        <MetronomeVisualizer />
      </View>
      <View style={styles.controlsSection}>
        <TimingControls />
        <SubdivisionControl />
        <VolumeControl />
        <TempoSlider />
        <PlayButton />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  displaySection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  controlsSection: {
    padding: 20,
    paddingBottom: 40,
  },
});
