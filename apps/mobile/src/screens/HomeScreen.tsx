import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, FlatList, Dimensions, Animated, Easing } from 'react-native';
import { Settings, Bell, Clock, Disc, Sparkles, LayoutGrid } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const FILTERS = ['All', 'Syncs', 'Archives'];

const MOCK_RECENTS = [
  { id: '1', title: 'Deep Indigo Sync', art: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=200&h=200&fit=crop' },
  { id: '2', title: 'Capsule Theory', art: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&h=200&fit=crop' },
  { id: '3', title: 'Solar Echoes', art: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=200&h=200&fit=crop' },
  { id: '4', title: 'Lunar Archive', art: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=200&h=200&fit=crop' },
];

const MOCK_SHELF = [
  { id: 'a', title: 'Stellar Drift', desc: 'Ambient electronic waves', art: 'https://images.unsplash.com/photo-1459749411177-042180ceea72?w=300&h=300&fit=crop' },
  { id: 'b', title: 'Neon Pulse', desc: 'Cyber-rhythmic patterns', art: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop' },
  { id: 'c', title: 'Violet Rain', desc: 'Smooth indigo jazz', art: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=300&h=300&fit=crop' },
];

export default function HomeScreen() {
  const [activeFilter, setActiveFilter] = useState('All');
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const renderShelfItem = ({ item }: any) => (
    <TouchableOpacity style={styles.shelfItem}>
      <View style={styles.shelfArtContainer}>
        <Image source={{ uri: item.art }} style={styles.shelfArt} />
        <LinearGradient
          colors={['transparent', 'rgba(26, 11, 54, 0.8)']}
          style={styles.shelfGradient}
        />
      </View>
      <Text style={styles.shelfTitle} numberOfLines={1}>{item.title}</Text>
      <Text style={styles.shelfDesc} numberOfLines={2}>{item.desc}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1a0b36', '#0f071e']}
        style={StyleSheet.absoluteFillObject}
      />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Sound Capsule Header */}
        <View style={styles.header}>
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <Animated.View style={[styles.miniDisc, { transform: [{ rotate: spin }] }]}>
                <Disc size={32} color="#ba9eff" />
              </Animated.View>
              <Image 
                source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop' }} 
                style={styles.avatar} 
              />
            </View>
            <View style={styles.filterPills}>
              {FILTERS.map((f) => (
                <TouchableOpacity 
                  key={f} 
                  onPress={() => setActiveFilter(f)}
                  style={[styles.pill, activeFilter === f && styles.pillActive]}
                >
                  <Text style={[styles.pillText, activeFilter === f && styles.pillTextActive]}>{f}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconBtn}><Sparkles size={20} color="#ba9eff" /></TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn}><Settings size={20} color="#f1f1f1" /></TouchableOpacity>
          </View>
        </View>

        {/* Capsule Recents Grid */}
        <Text style={styles.sectionTitleSmall}>Active Capsules</Text>
        <View style={styles.gridContainer}>
          {MOCK_RECENTS.map((item) => (
            <TouchableOpacity key={item.id} style={styles.gridCard}>
              <LinearGradient
                colors={['rgba(186, 158, 255, 0.1)', 'rgba(26, 11, 54, 0.5)']}
                style={StyleSheet.absoluteFillObject}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
              <Image source={{ uri: item.art }} style={styles.gridArt} />
              <Text style={styles.gridTitle} numberOfLines={1}>{item.title}</Text>
              <View style={styles.dotIndicator} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Drifting Shelves */}
        <View style={styles.shelfContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Stellar Drifts</Text>
            <LayoutGrid size={16} color="#ba9eff" opacity={0.5} />
          </View>
          <FlatList
            horizontal
            data={MOCK_SHELF}
            renderItem={renderShelfItem}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.shelfContent}
          />
        </View>

        <View style={styles.shelfContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Lunar Archives</Text>
            <Disc size={16} color="#ba9eff" opacity={0.5} />
          </View>
          <FlatList
            horizontal
            data={[...MOCK_SHELF].reverse()}
            renderItem={renderShelfItem}
            keyExtractor={(item) => 'rev'+item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.shelfContent}
          />
        </View>

        <View style={{ height: 160 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a0b36',
  },
  scrollContent: {
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  miniDisc: {
    position: 'absolute',
    opacity: 0.4,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#ba9eff',
  },
  filterPills: {
    flexDirection: 'row',
    gap: 10,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(99, 89, 133, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(186, 158, 255, 0.1)',
  },
  pillActive: {
    backgroundColor: '#ba9eff',
    borderColor: '#ba9eff',
  },
  pillText: {
    color: 'rgba(241, 241, 241, 0.6)',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  pillTextActive: {
    color: '#1a0b36',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 20,
  },
  iconBtn: {
    padding: 4,
  },
  sectionTitleSmall: {
    color: '#ba9eff',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 3,
    marginBottom: 16,
    opacity: 0.8,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 40,
  },
  gridCard: {
    width: (SCREEN_WIDTH - 52) / 2,
    height: 50,
    borderRadius: 25, // Capsule shape
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(186, 158, 255, 0.05)',
  },
  gridArt: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginLeft: 6,
  },
  gridTitle: {
    color: '#f1f1f1',
    fontSize: 11,
    fontWeight: '700',
    flex: 1,
    paddingHorizontal: 10,
  },
  dotIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ba9eff',
    marginRight: 16,
    opacity: 0.5,
  },
  shelfContainer: {
    marginBottom: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#f1f1f1',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  shelfContent: {
    gap: 20,
  },
  shelfItem: {
    width: 160,
  },
  shelfArtContainer: {
    width: 160,
    height: 160,
    borderRadius: 32,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(186, 158, 255, 0.1)',
  },
  shelfArt: {
    width: '100%',
    height: '100%',
  },
  shelfGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  shelfTitle: {
    color: '#f1f1f1',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  shelfDesc: {
    color: 'rgba(186, 158, 255, 0.5)',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
  },
});
