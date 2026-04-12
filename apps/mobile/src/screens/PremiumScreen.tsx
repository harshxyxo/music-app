import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function PremiumScreen() {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#ba9eff', '#1a0b36']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <Text style={styles.text}>Capsule+</Text>
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
    color: '#1a0b36',
    fontSize: 32,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 8,
  },
});
