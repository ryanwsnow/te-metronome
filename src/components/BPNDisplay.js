import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useMetronome } from '../contexts/MetronomeContext';
import { SvgXml } from 'react-native-svg';
import * as FileSystem from 'expo-file-system';

// We'll use a simple background for now, or load the SVG
export const BPNDisplay = () => {
  const { bpm } = useMetronome();

  return (
    <View style={styles.container}>
      <View style={styles.backgroundContainer}>
        {/* BPM indicator background SVG placeholder */}
        <View style={styles.background} />
      </View>
      <Text style={styles.bpmText}>{Math.round(bpm)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 200,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 40,
  },
  backgroundContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  background: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#333',
  },
  bpmText: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'DigitalNumbers_400Regular',
    zIndex: 1,
  },
});
