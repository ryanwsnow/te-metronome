import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useMetronome } from '../contexts/MetronomeContext';

export const MetronomeVisualizer = () => {
  const { bpm, isPlaying } = useMetronome();
  const swingAnimation = useRef(new Animated.Value(0)).current;
  const tickAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isPlaying) {
      swingAnimation.setValue(0);
      tickAnimation.setValue(0);
      return;
    }

    const duration = (60 / bpm) * 1000; // Duration in ms for one beat

    // Red arm swing animation
    const swing = Animated.loop(
      Animated.sequence([
        Animated.timing(swingAnimation, {
          toValue: 1,
          duration: duration / 2,
          useNativeDriver: true,
        }),
        Animated.timing(swingAnimation, {
          toValue: 0,
          duration: duration / 2,
          useNativeDriver: true,
        }),
      ])
    );

    // Tick indicator blink
    const tick = Animated.loop(
      Animated.sequence([
        Animated.timing(tickAnimation, {
          toValue: 1,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(tickAnimation, {
          toValue: 0,
          duration: duration - 50,
          useNativeDriver: true,
        }),
      ])
    );

    swing.start();
    tick.start();

    return () => {
      swing.stop();
      tick.stop();
    };
  }, [isPlaying, bpm, swingAnimation, tickAnimation]);

  const rotateInterpolate = swingAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['-45deg', '45deg'],
  });

  const opacityInterpolate = tickAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });

  const scaleInterpolate = tickAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1.2],
  });

  return (
    <View style={styles.container}>
      <View style={styles.visualizer}>
        <View style={styles.pivot} />
        <Animated.View
          style={[
            styles.arm,
            {
              transform: [
                { rotate: rotateInterpolate },
                { translateY: -60 },
              ],
            },
          ]}
        />
      </View>
      <Animated.View
        style={[
          styles.tickIndicator,
          {
            opacity: opacityInterpolate,
            transform: [{ scale: scaleInterpolate }],
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 200,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  visualizer: {
    width: 200,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  pivot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#666',
    position: 'absolute',
    top: '50%',
    zIndex: 2,
  },
  arm: {
    width: 4,
    height: 80,
    backgroundColor: '#FF0000',
    position: 'absolute',
    top: '50%',
    borderRadius: 2,
    zIndex: 1,
  },
  tickIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#00FF00',
    marginTop: 20,
    shadowColor: '#00FF00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 8,
  },
});
