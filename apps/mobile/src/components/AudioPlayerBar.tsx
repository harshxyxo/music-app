import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image, Platform, Animated, Easing } from 'react-native';
import { BlurView } from 'expo-blur';
import { ChevronDown, SkipBack, SkipForward, MoreHorizontal, LayoutGrid, Disc, Play, Pause, Plus } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const TAB_BAR_HEIGHT = 85;
const MINIMIZED_BOTTOM = TAB_BAR_HEIGHT;

export default function AudioPlayerBar() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isPlaying) {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
    } else {
      rotateAnim.stopAnimation();
    }
  }, [isPlaying]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const togglePlay = () => setIsPlaying(!isPlaying);
  const toggleExpand = () => setIsExpanded(!isExpanded);

  const containerStyle = {
    height: isExpanded ? SCREEN_HEIGHT : 64,
    bottom: isExpanded ? 0 : MINIMIZED_BOTTOM + 8,
    borderRadius: isExpanded ? 0 : 32,
    left: isExpanded ? 0 : 12,
    right: isExpanded ? 0 : 12,
  };

  const activeTrack = {
    title: 'Solar Echoes',
    artist: 'Luna Capsule',
    artwork: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop',
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <LinearGradient
        colors={['#1a0b36', '#25114a']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <BlurView intensity={isExpanded ? 100 : 40} tint="dark" style={styles.glass}>
        
        {/* Compact Mini-Capsule View */}
        {!isExpanded && (
          <View style={{ flex: 1 }}>
            <TouchableOpacity activeOpacity={0.9} onPress={toggleExpand} style={styles.miniPlayerContent}>
              <Animated.View style={[styles.capsuleIcon, { transform: [{ rotate: spin }] }]}>
                <LinearGradient
                  colors={['#ba9eff', '#7000FF']}
                  style={styles.capsuleGradient}
                />
                <Disc size={16} color="#1a0b36" />
              </Animated.View>
              
              <View style={styles.miniInfo}>
                <Text style={styles.miniTitle} numberOfLines={1}>{activeTrack.title}</Text>
                <Text style={styles.miniArtist} numberOfLines={1}>{activeTrack.artist}</Text>
              </View>

              <View style={styles.miniControls}>
                <TouchableOpacity style={styles.miniIcon} onPress={togglePlay}>
                  {isPlaying ? <Pause size={24} color="#ba9eff" fill="#ba9eff" /> : <Play size={24} color="#f1f1f1" fill="#f1f1f1" />}
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
            
            <View style={styles.miniProgressBarBg}>
              <View style={[styles.miniProgressBarActive, { width: isPlaying ? '45%' : '10%' }]} />
            </View>
          </View>
        )}

        {/* Expanded Full-Capsule View */}
        {isExpanded && (
          <View style={styles.expandedContent}>
             <View style={styles.expandedHeader}>
                <TouchableOpacity onPress={toggleExpand}>
                  <ChevronDown color="#f1f1f1" size={32} />
                </TouchableOpacity>
                <Text style={styles.expandedHeaderText}>Sound Capsule</Text>
                <MoreHorizontal color="#f1f1f1" size={24} />
             </View>

             <View style={styles.expandedArtContainer}>
                <Animated.View style={[styles.largeCapsule, { transform: [{ rotate: spin }] }]}>
                   <LinearGradient
                     colors={['#ba9eff', '#7000FF', '#1a0b36']}
                     style={styles.largeCapsuleGradient}
                   />
                   <Disc size={120} color="rgba(26, 11, 54, 0.4)" />
                </Animated.View>
             </View>
             
             <View style={styles.expandedInfo}>
                <View>
                  <Text style={styles.expandedTitle}>{activeTrack.title}</Text>
                  <Text style={styles.expandedArtistText}>{activeTrack.artist}</Text>
                </View>
                <Plus size={28} color="#ba9eff" />
             </View>

             <View style={styles.expandedProgressBarWrapper}>
                <View style={styles.expandedProgressBarBg}>
                  <View style={[styles.expandedProgressBarActive, { width: '45%' }]} />
                </View>
                <View style={styles.timeLabels}>
                  <Text style={styles.timeText}>1:42</Text>
                  <Text style={styles.timeText}>3:58</Text>
                </View>
             </View>

             <View style={styles.mainControls}>
                <TouchableOpacity>
                  <SkipBack size={36} color="#f1f1f1" fill="#f1f1f1" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.bigPlayButton} onPress={togglePlay}>
                  {isPlaying ? <Pause size={40} color="#1a0b36" fill="#1a0b36" /> : <Play size={40} color="#1a0b36" fill="#1a0b36" style={{ marginLeft: 4 }} />}
                </TouchableOpacity>
                <TouchableOpacity>
                  <SkipForward size={36} color="#f1f1f1" fill="#f1f1f1" />
                </TouchableOpacity>
             </View>
          </View>
        )}

      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'absolute', overflow: 'hidden', backgroundColor: '#1a0b36', elevation: 20, borderTopWidth: 1, borderTopColor: 'rgba(186, 158, 255, 0.2)' },
  glass: { flex: 1 },
  miniPlayerContent: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  capsuleIcon: { width: 40, height: 40, borderRadius: 20, marginRight: 12, justifyContent: 'center', alignItems: 'center', overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(186, 158, 255, 0.5)' },
  capsuleGradient: { ...StyleSheet.absoluteFillObject },
  miniInfo: { flex: 1, justifyContent: 'center' },
  miniTitle: { color: '#f1f1f1', fontSize: 13, fontWeight: '800', letterSpacing: 0.5 },
  miniArtist: { color: '#ba9eff', fontSize: 11, fontWeight: '600', opacity: 0.8 },
  miniControls: { flexDirection: 'row', alignItems: 'center' },
  miniIcon: { padding: 8 },
  miniProgressBarBg: { height: 2, backgroundColor: 'rgba(255,255,255,0.05)', width: '100%' },
  miniProgressBarActive: { height: 2, backgroundColor: '#ba9eff' },

  expandedContent: { flex: 1, paddingHorizontal: 30, paddingTop: Platform.OS === 'ios' ? 60 : 40 },
  expandedHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 },
  expandedHeaderText: { color: '#ba9eff', fontSize: 11, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 4 },
  expandedArtContainer: { width: '100%', aspectRatio: 1, justifyContent: 'center', alignItems: 'center', marginBottom: 40 },
  largeCapsule: { width: '80%', aspectRatio: 1, borderRadius: 150, justifyContent: 'center', alignItems: 'center', overflow: 'hidden', borderWidth: 2, borderColor: 'rgba(186, 158, 255, 0.3)', shadowColor: '#ba9eff', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 20 },
  largeCapsuleGradient: { ...StyleSheet.absoluteFillObject },
  expandedInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  expandedTitle: { color: '#f1f1f1', fontSize: 28, fontWeight: '900', letterSpacing: -1 },
  expandedArtistText: { color: '#ba9eff', fontSize: 18, fontWeight: '600' },
  expandedProgressBarWrapper: { marginBottom: 30 },
  expandedProgressBarBg: { height: 4, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 2 },
  expandedProgressBarActive: { height: 4, backgroundColor: '#ba9eff', borderRadius: 2 },
  timeLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  timeText: { color: 'rgba(241, 241, 241, 0.4)', fontSize: 12, fontWeight: '700' },
  mainControls: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20 },
  bigPlayButton: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#ba9eff', justifyContent: 'center', alignItems: 'center', shadowColor: '#ba9eff', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 15 },
});
