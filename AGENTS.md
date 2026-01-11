# Metronome App - Development Instructions

## Project Overview

Build a metronome application for iOS and Android using Expo. The app should replicate a physical metronome device with interactive controls and visual feedback.

**Figma Design References:**
- Main Layout: https://www.figma.com/design/cehqzs1XajpO8UvSJA1aYz/Teenage?node-id=9-663&m=dev
- Controls & States: https://www.figma.com/design/cehqzs1XajpO8UvSJA1aYz/Teenage?node-id=32-36&m=dev

The designs should be fetched and implemented via the Figma MCP server. Extract node IDs: 9-663 (or 9:663 format) for main layout, 32-36 (or 32:36 format) for controls.

## Technical Stack Requirements

- **Framework**: Expo SDK
- **UI Components**: React Native components
- **SVG Support**: react-native-svg or Expo SVG support for control elements
- **Fonts**: Google Fonts (Digital Numbers font family for BPM display text)
- **Audio**: Expo Audio API (expo-av) or react-native-sound for metronome tick sounds
- **Animation**: React Native Animated API or react-native-reanimated for visualizer animations
- **State Management**: React hooks (useState, useEffect) or preferred state management solution

## Feature Requirements

### BPM Control

- **Control**: Slider control in the device body (uses provided SVG asset)
- **Display**: Current BPM displayed on device display screen in "bpm indicator" section
  - BPM text should use Google Font "Digital Numbers" font family
  - BPM text overlays the `bpm-indicator-background.svg` SVG asset
  - The background SVG should be positioned behind the BPM text
- **Functionality**: User should be able to adjust tempo/BPM via the slider
- **Range**: Typical metronome range (e.g., 30-300 BPM or as specified in design)

### Time Signature Selection

- **Controls**: Three timing control buttons: 4/4, 3/4, and 6/8 (uses provided SVG assets for buttons and selected states)
- **Visual Feedback**: Selected state visual feedback on buttons (buttons show active/inactive states)
- **Display**: Selected timing displayed on display screen in "timing indicator" section
- **Audio Behavior**: Tick and accent tick sounds change based on selected time signature
  - 4/4: Accent on beat 1, regular ticks on beats 2, 3, 4
  - 3/4: Accent on beat 1, regular ticks on beats 2, 3
  - 6/8: Accent on beat 1, regular ticks on beats 2, 3, 4, 5, 6

### Subdivision Control

- **Control**: Rotary knob control for subdivision (uses provided SVG asset - should be SVG)
- **Options**: 
  - 1/4 notes (default)
  - 1/8 notes
  - 1/16 notes
- **Display**: Selected subdivision displayed on display screen in "subdivision indicator" section
- **Audio Behavior**: Subdivision affects how many ticks occur per beat
  - 1/4: One tick per beat
  - 1/8: Two ticks per beat
  - 1/16: Four ticks per beat

### Volume Control

- **Control**: Rotary knob control for volume (uses provided SVG asset - should be SVG)
- **Functionality**: Adjusts metronome audio output level
- **Range**: 0% (mute) to 100% (full volume)

### Metronome Visualizer

- **Red Arm Animation**: Red arm that swings back and forth in tempo with the metronome beats
  - Animation should be synchronized with the metronome tempo (BPM)
  - Swing motion should match the beat pattern
  - Animation speed should dynamically adjust when BPM changes
- **Tick Indicator**: Tick indicator that turns on and off with the metronome tempo
  - Visual indicator should blink/pulse in sync with each tick
  - Should be visible on the display screen
- **Synchronization**: Visual feedback should match the audio beats exactly
- **Implementation**: Use React Native Animated API or react-native-reanimated for smooth animations

## Design Integration & Assets

### Figma Design Integration

1. Fetch the main layout design using the Figma MCP server:
   - URL: https://www.figma.com/design/cehqzs1XajpO8UvSJA1aYz/Teenage?node-id=9-663&m=dev
   - Node ID: 9-663 (or 9:663 format)

2. Fetch the controls & states design:
   - URL: https://www.figma.com/design/cehqzs1XajpO8UvSJA1aYz/Teenage?node-id=32-36&m=dev
   - Node ID: 32-36 (or 32:36 format)
   - This design reference contains controls and their states
   - Rotary knobs should be implemented as SVGs
   - Subdivisions should be implemented as SVGs

3. Map UI components from Figma to React Native components
4. Maintain visual fidelity to the design specifications

### SVG Assets

The user will provide specific SVG files for control elements. These should be integrated into React Native components:

- **Tempo slider control SVG**: Slider component for BPM adjustment
- **BPM indicator background SVG**: Background for the BPM display (`bpm-indicator-background.svg`)
- **Timing control buttons SVGs**: Buttons for 4/4, 3/4, and 6/8 time signatures (including selected/unselected states)
- **Subdivision rotary knob SVG**: Rotary knob control for subdivision selection (must be SVG)
- **Volume rotary knob SVG**: Rotary knob control for volume adjustment (must be SVG)

Integration should use react-native-svg or Expo SVG support.

## Audio Implementation Requirements

### Metronome Tick Sounds

- **Regular Tick**: Standard metronome tick sound for regular beats
- **Accent Tick**: Emphasized tick sound for strong beats (beat 1 in time signatures)
- **Sound Files**: Use appropriate audio files or generate programmatically
- **Precision**: Ensure precise timing for metronome beats (accurate BPM timing)

### Audio Behavior by Time Signature

- **4/4 Time**: 
  - Beat 1: Accent tick
  - Beats 2, 3, 4: Regular ticks
- **3/4 Time**:
  - Beat 1: Accent tick
  - Beats 2, 3: Regular ticks
- **6/8 Time**:
  - Beat 1: Accent tick
  - Beats 2, 3, 4, 5, 6: Regular ticks

### Subdivision Audio

- **1/4 notes**: One tick per beat
- **1/8 notes**: Two ticks per beat (subdivide each beat in half)
- **1/16 notes**: Four ticks per beat (subdivide each beat into quarters)

### Volume Control

- Implement volume control that affects metronome audio output
- Volume range: 0% (mute) to 100% (full volume)
- Smooth volume transitions when adjusting

## State Management

The app should manage the following state:

- **BPM value**: Current beats per minute (numeric value)
- **Time signature**: Selected time signature (4/4, 3/4, or 6/8)
- **Subdivision**: Selected subdivision (1/4, 1/8, or 1/16 notes)
- **Volume level**: Current volume (0-100 or 0-1 range)
- **Play/pause state**: Whether the metronome is currently playing or paused

## Implementation Notes

### Audio Implementation

- Use Expo's Audio API (expo-av) or react-native-sound for audio playback
- Ensure precise timing for metronome beats (consider using setInterval or requestAnimationFrame with precise timing)
- Handle background audio playback if required (iOS/Android audio session configuration)

### Animation Implementation

- Use React Native Animated API or react-native-reanimated for metronome visualizer animations
- Red arm swinging animation synchronized with metronome tempo
- Tick indicator on/off animation synchronized with beats
- Animation speed should dynamically adjust with BPM changes
- Ensure smooth animations without jank or frame drops

### Component Structure

- Create reusable components for each control element
- Separate concerns: audio logic, animation logic, UI components
- Use proper React Native patterns (View, Text, TouchableOpacity, etc.)
- **BPM Display Component**: 
  - Use `bpm-indicator-background.svg` as background layer
  - Overlay BPM text using Google Font "Digital Numbers"
  - Position text centered/appropriately over the background SVG

### Responsive Design

- Ensure responsive design for different screen sizes (iOS and Android devices)
- Maintain aspect ratios and proportions from the Figma design
- Test on various device sizes

### Performance Considerations

- Optimize audio playback to avoid latency
- Optimize animations for smooth 60fps performance
- Consider performance implications of simultaneous audio and animations
- Test on both iOS and Android devices

### Additional Considerations

- Handle app lifecycle events (background/foreground) appropriately
- Consider accessibility features if needed
- Ensure proper error handling for audio loading/playback
- Test on physical devices (not just simulators) for accurate audio timing

## Development Workflow

1. Set up Expo project with necessary dependencies
2. Fetch Figma designs via MCP server and analyze component structure
3. Create component structure and layout based on Figma designs
4. Integrate provided SVG assets for controls
5. Implement audio playback system with precise timing
6. Implement state management for all controls
7. Implement visualizer animations synchronized with audio
8. Test on iOS and Android devices
9. Refine and optimize based on testing
