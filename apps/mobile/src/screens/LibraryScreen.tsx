import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function LibraryScreen() {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1a0b36', '#0f071e']}
        style={StyleSheet.absoluteFillObject}
      />
      <Text style={styles.text}>Archive</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a0b36',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#ba9eff',
    fontSize: 24,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 4,
  },
});
