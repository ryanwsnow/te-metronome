import React from 'react';
import { StyleSheet, View, StatusBar } from 'react-native';
import MetronomeApp from './src/components/MetronomeApp';

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <MetronomeApp />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
