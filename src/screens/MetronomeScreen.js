import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useFonts, DigitalNumbers_400Regular } from '@expo-google-fonts/digital-numbers';
import * as SplashScreen from 'expo-splash-screen';
import { MetronomeProvider } from '../contexts/MetronomeContext';
import { MetronomeContent } from '../components/MetronomeContent';

SplashScreen.preventAutoHideAsync();

export const MetronomeScreen = () => {
  const [fontsLoaded] = useFonts({
    DigitalNumbers_400Regular,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <MetronomeProvider>
      <View style={styles.container}>
        <MetronomeContent />
      </View>
    </MetronomeProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});
