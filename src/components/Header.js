import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { G, Path } from 'react-native-svg';

export const Header = () => {
  // Placeholder header - will integrate SVG assets
  return (
    <View style={styles.container}>
      <View style={styles.headerContent}>
        {/* Header SVG assets will be integrated here */}
        <View style={styles.placeholder} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    height: 60,
    width: '100%',
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
  },
});
