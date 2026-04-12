import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface Props {
  isPlaying: boolean;
  style?: any;
}

export default function AudioVisualizer({ isPlaying, style }: Props) {
  // Static visualizer for now to prevent Reanimated crashes
  return (
    <View style={[StyleSheet.absoluteFillObject, { opacity: isPlaying ? 0.6 : 0.3 }, style]}>
      <LinearGradient 
        colors={['#FF007F', '#7000FF', '#FF8C42']} 
        style={StyleSheet.absoluteFillObject} 
        start={{x: 0, y: 0}} 
        end={{x: 1, y: 1}} 
      />
    </View>
  );
}
