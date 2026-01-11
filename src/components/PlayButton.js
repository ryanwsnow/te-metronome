import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useMetronome } from '../contexts/MetronomeContext';

export const PlayButton = () => {
  const { isPlaying, togglePlay } = useMetronome();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, isPlaying && styles.buttonPlaying]}
        onPress={togglePlay}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>
          {isPlaying ? 'Pause' : 'Play'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    minWidth: 120,
    alignItems: 'center',
  },
  buttonPlaying: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
