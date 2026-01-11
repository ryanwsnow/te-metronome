import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Slider from '@react-native-community/slider';
import { useMetronome } from '../contexts/MetronomeContext';
import { MIN_BPM, MAX_BPM } from '../types';

export const TempoSlider = () => {
  const { bpm, setBpm } = useMetronome();

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Tempo (BPM): {Math.round(bpm)}</Text>
      <Slider
        style={styles.slider}
        minimumValue={MIN_BPM}
        maximumValue={MAX_BPM}
        value={bpm}
        onValueChange={setBpm}
        minimumTrackTintColor="#007AFF"
        maximumTrackTintColor="#333"
        thumbTintColor="#007AFF"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 15,
  },
  label: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 10,
    fontWeight: '600',
  },
  slider: {
    width: '100%',
    height: 40,
  },
});
