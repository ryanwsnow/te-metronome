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
    marginTop: 20,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPlaying: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
