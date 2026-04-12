import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { ChevronRight, User, Shield, PlayCircle, Settings, Download } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

const SettingRow = ({ icon: Icon, title, description, onPress }: any) => (
  <TouchableOpacity style={styles.row} onPress={onPress}>
    <Icon size={24} color="#ba9eff" />
    <View style={styles.rowContent}>
      <Text style={styles.rowTitle}>{title}</Text>
      {description && <Text style={styles.rowDescription}>{description}</Text>}
    </View>
    <ChevronRight size={20} color="rgba(186, 158, 255, 0.3)" />
  </TouchableOpacity>
);

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1a0b36', '#0f071e']}
        style={StyleSheet.absoluteFillObject}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.header}>Control Panel</Text>
        
        <SettingRow icon={User} title="Identity" description="Profile, biometrics" />
        <SettingRow icon={Settings} title="Visuals & Audio" description="Indigo depth, quality" />
        <SettingRow icon={Shield} title="Privacy" description="Visibility, sharing" />
        <SettingRow icon={PlayCircle} title="Sync Engine" description="Crossfade, gapless" />
        <SettingRow icon={Download} title="Offline Archives" description="Storage, downloads" />
        
        <TouchableOpacity style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Terminate Session</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a0b36',
  },
  content: {
    padding: 25,
    paddingTop: 60,
  },
  header: {
    color: '#f1f1f1',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -1,
    marginBottom: 40,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(186, 158, 255, 0.05)',
  },
  rowContent: {
    flex: 1,
    marginLeft: 15,
  },
  rowTitle: {
    color: '#f1f1f1',
    fontSize: 16,
    fontWeight: '700',
  },
  rowDescription: {
    color: '#ba9eff',
    fontSize: 12,
    marginTop: 4,
    opacity: 0.6,
  },
  logoutBtn: {
    marginTop: 60,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(186, 158, 255, 0.2)',
    borderRadius: 30,
    backgroundColor: 'rgba(186, 158, 255, 0.05)',
  },
  logoutText: {
    color: '#ba9eff',
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 2,
    fontSize: 12,
  },
});
