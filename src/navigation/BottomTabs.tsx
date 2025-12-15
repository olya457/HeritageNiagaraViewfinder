import React from 'react';
import { Image, Platform, View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { TabsParamList } from './types';

import CuratedSpotsScreen from '../screens/CuratedSpotsScreen';
import InteractiveMapScreen from '../screens/InteractiveMapScreen';
import RandomPlaceScreen from '../screens/RandomPlaceScreen';
import NatureNotesScreen from '../screens/NatureNotesScreen';
import SavedScreen from '../screens/SavedScreen';

const Tab = createBottomTabNavigator<TabsParamList>();

const ICONS = {
  curated: { active: require('../assets/tab_curated_active.png'), inactive: require('../assets/tab_curated.png') },
  map:     { active: require('../assets/tab_map_active.png'),     inactive: require('../assets/tab_map.png') },
  random:  { active: require('../assets/tab_random_active.png'),  inactive: require('../assets/tab_random.png') },
  notes:   { active: require('../assets/tab_notes_active.png'),   inactive: require('../assets/tab_notes.png') },
  saved:   { active: require('../assets/tab_saved_active.png'),   inactive: require('../assets/tab_saved.png') },
} as const;

const PANEL_GREEN = '#34567fcf';
const PANEL_GREEN_DARK = '#0b171fff';
const ORANGE = '#8af3c4b1';
const INACTIVE_STROKE = '#FFD43B';

function TabIcon({ focused, src }: { focused: boolean; src: {active:any; inactive:any} }) {
  return (
    <View
      style={[
        styles.iconWrap,
        focused
          ? { backgroundColor: ORANGE, borderColor: ORANGE, justifyContent: 'flex-start', paddingTop: 6 }
          : { backgroundColor: 'transparent', borderColor: INACTIVE_STROKE, justifyContent: 'center', paddingTop: 0 },
      ]}
    >
      <Image source={focused ? src.active : src.inactive} style={styles.icon} />
    </View>
  );
}

export default function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarItemStyle: { marginTop: 10 },

        tabBarStyle: {
          position: 'absolute',
          left: 12,
          right: 12,
          bottom: Platform.select({ ios: 22, android: 20 }),
          height: Platform.select({ ios: 64, android: 62 }),
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
          shadowColor: '#000',
          shadowOpacity: 0.25,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 6 },
          borderRadius: 18,
          overflow: 'hidden',
        },
        tabBarBackground: () => (
          <>
            <View style={{ ...(StyleSheet.absoluteFillObject as any), backgroundColor: PANEL_GREEN }} />
            <View
              pointerEvents="none"
              style={{
                position: 'absolute',
                left: -12,
                right: -12,
                bottom: -20,
                height: 12,
                backgroundColor: PANEL_GREEN_DARK,
                borderBottomLeftRadius: 18,
                borderBottomRightRadius: 18,
                opacity: 0.9,
              }}
            />
          </>
        ),
      }}
    >
      <Tab.Screen
        name="Curated spots"
        component={CuratedSpotsScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon focused={focused} src={ICONS.curated} /> }}
      />
      <Tab.Screen
        name="Interactive Map"
        component={InteractiveMapScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon focused={focused} src={ICONS.map} /> }}
      />
      <Tab.Screen
        name="Random Place"
        component={RandomPlaceScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon focused={focused} src={ICONS.random} /> }}
      />
      <Tab.Screen
        name="Nature Notes"
        component={NatureNotesScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon focused={focused} src={ICONS.notes} /> }}
      />
      <Tab.Screen
        name="saved"
        component={SavedScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon focused={focused} src={ICONS.saved} /> }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
  },
  icon: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
  },
});
