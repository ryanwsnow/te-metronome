import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useMetronome } from '../contexts/MetronomeContext';

export const SubdivisionControl = () => {
  const { subdivision, setSubdivision } = useMetronome();
  const subdivisions = ['1/4', '1/8', '1/16'];

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Subdivision</Text>
      <View style={styles.controls}>
        {subdivisions.map((sub) => (
          <TouchableOpacity
            key={sub}
            style={[
              styles.option,
              subdivision === sub && styles.optionActive,
            ]}
            onPress={() => setSubdivision(sub)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.optionText,
                subdivision === sub && styles.optionTextActive,
              ]}
            >
              {sub}
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
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  option: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#333',
  },
  optionActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  optionText: {
    color: '#888',
    fontSize: 18,
    fontWeight: '600',
  },
  optionTextActive: {
    color: '#fff',
  },
});
