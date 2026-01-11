import React from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MetronomeScreen } from './src/screens/MetronomeScreen';

export default function App() {
  return (
    <View style={styles.container}>
      <MetronomeScreen />
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});
