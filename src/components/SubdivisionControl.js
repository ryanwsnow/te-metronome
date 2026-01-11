import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useMetronome } from '../contexts/MetronomeContext';
import { SUBDIVISIONS } from '../types';

export const SubdivisionControl = () => {
  const { subdivision, setSubdivision } = useMetronome();

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Subdivision</Text>
      <View style={styles.controls}>
        {SUBDIVISIONS.map((sub) => (
          <TouchableOpacity
            key={sub}
            style={[
              styles.option,
              subdivision === sub && styles.optionActive,
            ]}
            onPress={() => setSubdivision(sub)}
          >
            <Text style={styles.optionText}>{sub}</Text>
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
    fontSize: 16,
    marginBottom: 10,
    fontWeight: '600',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  option: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#333',
    minWidth: 70,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#555',
  },
  optionActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  optionText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
