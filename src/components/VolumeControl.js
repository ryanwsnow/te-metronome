import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Slider from '@react-native-community/slider';
import { useMetronome } from '../contexts/MetronomeContext';

export const VolumeControl = () => {
  const { volume, setVolume } = useMetronome();

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Volume: {Math.round(volume)}%</Text>
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={100}
        value={volume}
        onValueChange={setVolume}
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
