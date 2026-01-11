import React from 'react';
import { View, StyleSheet, Text, Image } from 'react-native';
import { SvgXml } from 'react-native-svg';
import HeaderTitleSvg from '../../assets/svgs/header title.svg';
import HeaderSubtitleSvg from '../../assets/svgs/header subtitle.svg';
import HeaderSpeakerSvg from '../../assets/svgs/header-speaker.svg';
import InsetSvg from '../../assets/svgs/inset.svg';

export const Header = () => {
  return (
    <View style={styles.container}>
      <View style={styles.headerContent}>
        <View style={styles.titleSection}>
          {/* SVG assets will be rendered here */}
          <View style={styles.placeholder} />
        </View>
        <View style={styles.speakerSection}>
          <View style={styles.placeholder} />
        </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleSection: {
    flex: 1,
  },
  speakerSection: {
    width: 60,
    height: 60,
  },
  placeholder: {
    height: 40,
    backgroundColor: '#333',
    borderRadius: 4,
  },
});
