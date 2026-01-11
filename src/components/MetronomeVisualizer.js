import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useMetronome } from '../contexts/MetronomeContext';

export const MetronomeVisualizer = () => {
  const { bpm, isPlaying, timeSignature } = useMetronome();
  const swingAnimation = useRef(new Animated.Value(0)).current;
  const tickAnimation = useRef(new Animated.Value(0)).current;
  const animationRef = useRef(null);

  useEffect(() => {
    if (!isPlaying) {
      swingAnimation.setValue(0);
      tickAnimation.setValue(0);
      if (animationRef.current) {
        animationRef.current.stop();
      }
      return;
    }

    const beatsPerMeasure = parseInt(timeSignature[0]);
    const duration = (60 / bpm) * 1000; // Duration in ms for one beat

    // Stop any existing animation
    if (animationRef.current) {
      animationRef.current.stop();
    }

    // Red arm swing animation - swings once per beat
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

    // Tick indicator blink - blinks once per beat
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
    animationRef.current = { swing, tick };

    return () => {
      swing.stop();
      tick.stop();
    };
  }, [isPlaying, bpm, timeSignature, swingAnimation, tickAnimation]);

  const rotateInterpolate = swingAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['-45deg', '45deg'],
  });

  const opacityInterpolate = tickAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 1],
  });

  return (
    <View style={styles.container}>
      <View style={styles.visualizerContainer}>
        <View style={styles.centerPoint} />
        <Animated.View
          style={[
            styles.arm,
            {
              transform: [
                { translateY: -50 },
                { rotate: rotateInterpolate },
                { translateY: 50 },
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
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  visualizerContainer: {
    width: 150,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  centerPoint: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#666',
    zIndex: 2,
  },
  arm: {
    position: 'absolute',
    width: 4,
    height: 100,
    backgroundColor: '#FF0000',
    borderRadius: 2,
    transformOrigin: 'center',
  },
  tickIndicator: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#00FF00',
    bottom: 20,
    borderWidth: 2,
    borderColor: '#00AA00',
  },
});
