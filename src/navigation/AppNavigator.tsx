import React, { ReactNode, useRef } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, Text, TouchableOpacity, PanResponder } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createNavigationContainerRef } from '@react-navigation/native';

import { RootStackParamList, MainTabParamList } from '../types';
import { colors } from '../utils/colors';

import LibraryScreen from '../screens/LibraryScreen';
import PlaylistsScreen from '../screens/PlaylistsScreen';
import SearchScreen from '../screens/SearchScreen';
import PlayerScreen from '../screens/PlayerScreen';
import PlaylistDetailScreen from '../screens/PlaylistDetailScreen';
import MiniPlayer from '../components/MiniPlayer';
import { usePlayerStore } from '../store/usePlayerStore';

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

function TabSwipeContainer({ children, navigation }: { children: ReactNode; navigation: any }) {
  const responder = useRef(PanResponder.create({
    onMoveShouldSetPanResponder: (_, gesture) =>
      Math.abs(gesture.dx) > 14 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
    onPanResponderRelease: (_, gesture) => {
      if (Math.abs(gesture.dx) < 70 || Math.abs(gesture.dx) < Math.abs(gesture.dy)) return;

      const state = navigation.getState();
      const nextIndex = gesture.dx < 0 ? state.index + 1 : state.index - 1;
      const nextRoute = state.routes[nextIndex];
      if (nextRoute) navigation.navigate(nextRoute.name);
    },
  })).current;

  return <View style={styles.container} {...responder.panHandlers}>{children}</View>;
}

function MainTabs() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: [styles.tabBar, { height: 60 + insets.bottom, paddingBottom: insets.bottom + 8 }],
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarLabelStyle: styles.tabLabel,
          tabBarIcon: ({ color, size }) => {
            const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
              Library: 'musical-notes',
              Playlists: 'list',
              Search: 'search',
            };
            return <Ionicons name={icons[route.name]} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Library">
          {(props) => <TabSwipeContainer navigation={props.navigation}><LibraryScreen /></TabSwipeContainer>}
        </Tab.Screen>
        <Tab.Screen name="Playlists">
          {(props) => <TabSwipeContainer navigation={props.navigation}><PlaylistsScreen /></TabSwipeContainer>}
        </Tab.Screen>
        <Tab.Screen name="Search">
          {(props) => <TabSwipeContainer navigation={props.navigation}><SearchScreen /></TabSwipeContainer>}
        </Tab.Screen>
      </Tab.Navigator>
    </View>
  );
}

function PersistentTabBar() {
  const insets = useSafeAreaInsets();
  const isVisible = usePlayerStore((state) => state.isPersistentTabBarVisible);

  if (!isVisible) return null;

  const tabs: Array<{ name: keyof MainTabParamList; label: string; icon: keyof typeof Ionicons.glyphMap }> = [
    { name: 'Library', label: 'Kütüphane', icon: 'musical-notes' },
    { name: 'Playlists', label: 'Playlistler', icon: 'list' },
    { name: 'Search', label: 'Ara', icon: 'search' },
  ];

  return (
    <View style={[styles.persistentTabBar, { height: 60 + insets.bottom, paddingBottom: insets.bottom + 8 }]}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.name}
          style={styles.persistentTab}
          onPress={() => navigationRef.navigate('Main', { screen: tab.name } as never)}
        >
          <Ionicons name={tab.icon} size={22} color={colors.textMuted} />
          <Text style={styles.persistentTabLabel}>{tab.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function AppNavigator() {
  const currentSong = usePlayerStore((s) => s.currentSong);
  const isPlayerExpanded = usePlayerStore((s) => s.isPlayerExpanded);

  return (
    <View style={styles.container}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen
          name="Player"
          component={PlayerScreen}
          options={{ animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="PlaylistDetail"
          component={PlaylistDetailScreen}
          options={{ animation: 'slide_from_right' }}
        />
      </Stack.Navigator>
      <PersistentTabBar />
      {currentSong && !isPlayerExpanded && <MiniPlayer />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tabBar: {
    backgroundColor: colors.tabBar,
    borderTopColor: colors.surfaceBorder,
    borderTopWidth: 1,
    minHeight: 60,
    paddingTop: 4,
    paddingBottom: 8,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  persistentTabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: colors.tabBar,
    borderTopColor: colors.surfaceBorder,
    borderTopWidth: 1,
    paddingTop: 4,
  },
  persistentTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  persistentTabLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
});
