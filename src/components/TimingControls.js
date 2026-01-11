import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useMetronome } from '../contexts/MetronomeContext';

export const TimingControls = () => {
  const { timeSignature, setTimeSignature } = useMetronome();
  const signatures = ['4/4', '3/4', '6/8'];

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Time Signature</Text>
      <View style={styles.buttons}>
        {signatures.map((sig) => (
          <TouchableOpacity
            key={sig}
            style={[
              styles.button,
              timeSignature === sig && styles.buttonActive,
            ]}
            onPress={() => setTimeSignature(sig)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.buttonText,
                timeSignature === sig && styles.buttonTextActive,
              ]}
            >
              {sig}
            </Text>
          </TouchableOpacity>
        ))}
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
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#333',
  },
  buttonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  buttonText: {
    color: '#888',
    fontSize: 20,
    fontWeight: 'bold',
  },
  buttonTextActive: {
    color: '#fff',
  },
});
