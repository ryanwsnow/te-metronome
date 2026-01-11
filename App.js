import React from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MetronomeProvider } from './src/contexts/MetronomeContext';
import { MetronomeScreen } from './src/screens/MetronomeScreen';

export default function App() {
  return (
    <View style={styles.container}>
      <MetronomeProvider>
        <MetronomeScreen />
        <StatusBar style="light" />
      </MetronomeProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});
