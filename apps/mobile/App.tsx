import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, ActivityIndicator, TouchableOpacity, Text } from 'react-native';
import { Circle, Hexagon, Layers, Disc } from 'lucide-react-native';
import HomeScreen from './src/screens/HomeScreen';
import SearchScreen from './src/screens/SearchScreen';
import LibraryScreen from './src/screens/LibraryScreen';
import PremiumScreen from './src/screens/PremiumScreen';
import AudioPlayerBar from './src/components/AudioPlayerBar';
import { setupTrackPlayer } from './src/services/trackPlayerSetup';

export default function App() {
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [activeTab, setActiveTab] = useState('Home');

  useEffect(() => {
    async function setup() {
      const isSetup = await setupTrackPlayer();
      setIsPlayerReady(isSetup);
    }
    setup();
  }, []);

  if (!isPlayerReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ba9eff" />
      </View>
    );
  }

  const renderScreen = () => {
    switch (activeTab) {
      case 'Home': return <HomeScreen />;
      case 'Search': return <SearchScreen />;
      case 'Library': return <LibraryScreen />;
      case 'Premium': return <PremiumScreen />;
      default: return <HomeScreen />;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Main Screen Content */}
      <View style={{ flex: 1 }}>
        {renderScreen()}
      </View>

      {/* Global Mini-Player sits above Tab Bar */}
      <AudioPlayerBar />

      {/* Custom Bottom Tab Bar - Sound Capsule Identity */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('Home')}>
          <Circle size={22} color={activeTab === 'Home' ? '#ba9eff' : '#635985'} fill={activeTab === 'Home' ? '#ba9eff' : 'none'} />
          <Text style={[styles.tabLabel, { color: activeTab === 'Home' ? '#ba9eff' : '#635985' }]}>Focus</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('Search')}>
          <Hexagon size={22} color={activeTab === 'Search' ? '#ba9eff' : '#635985'} fill={activeTab === 'Search' ? '#ba9eff' : 'none'} />
          <Text style={[styles.tabLabel, { color: activeTab === 'Search' ? '#ba9eff' : '#635985' }]}>Discover</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('Library')}>
          <Layers size={22} color={activeTab === 'Library' ? '#ba9eff' : '#635985'} fill={activeTab === 'Library' ? '#ba9eff' : 'none'} />
          <Text style={[styles.tabLabel, { color: activeTab === 'Library' ? '#ba9eff' : '#635985' }]}>Archive</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('Premium')}>
          <Disc size={22} color={activeTab === 'Premium' ? '#ba9eff' : '#635985'} fill={activeTab === 'Premium' ? '#ba9eff' : 'none'} />
          <Text style={[styles.tabLabel, { color: activeTab === 'Premium' ? '#ba9eff' : '#635985' }]}>Capsule+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a0b36',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#1a0b36',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    height: 85,
    backgroundColor: '#0f071e',
    borderTopWidth: 1,
    borderTopColor: 'rgba(186, 158, 255, 0.1)',
    paddingBottom: 25,
    paddingTop: 10,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '25%',
  },
  tabLabel: {
    fontSize: 9,
    fontWeight: '800',
    marginTop: 6,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
