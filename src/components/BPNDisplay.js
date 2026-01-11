import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useMetronome } from '../contexts/MetronomeContext';
import SvgUri from 'react-native-svg-uri';
import BpmIndicatorBackground from '../../assets/svgs/bpm-indicator-background.svg';

export const BPNDisplay = () => {
  const { bpm } = useMetronome();

  return (
    <View style={styles.container}>
      <View style={styles.backgroundContainer}>
        <BpmIndicatorBackground width="100%" height="100%" />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.bpmText}>{Math.round(bpm)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 250,
    height: 120,
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
  textContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  bpmText: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'DigitalNumbers_400Regular',
  },
});
