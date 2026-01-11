import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Slider from '@react-native-community/slider';
import { useMetronome } from '../contexts/MetronomeContext';

export const TempoSlider = () => {
  const { bpm, setBpm } = useMetronome();

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Tempo (BPM): {Math.round(bpm)}</Text>
      <Slider
        style={styles.slider}
        minimumValue={30}
        maximumValue={300}
        value={bpm}
        onValueChange={setBpm}
        minimumTrackTintColor="#007AFF"
        maximumTrackTintColor="#333"
        thumbTintColor="#007AFF"
      />
      <View style={styles.range}>
        <Text style={styles.rangeText}>30</Text>
        <Text style={styles.rangeText}>300</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 15,
  },
  label: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 10,
    fontWeight: '600',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  range: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  rangeText: {
    color: '#888',
    fontSize: 12,
  },
});
