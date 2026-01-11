import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useMetronome } from '../contexts/MetronomeContext';
import { TIME_SIGNATURES } from '../types';

export const TimingControls = () => {
  const { timeSignature, setTimeSignature } = useMetronome();

  return (
    <View style={styles.container}>
      {TIME_SIGNATURES.map((sig) => (
        <TouchableOpacity
          key={sig}
          style={[
            styles.button,
            timeSignature === sig && styles.buttonActive,
          ]}
          onPress={() => setTimeSignature(sig)}
        >
          <Text style={styles.buttonText}>{sig}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 15,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#333',
    minWidth: 80,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#555',
  },
  buttonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
