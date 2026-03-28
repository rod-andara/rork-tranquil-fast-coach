import { Tabs } from "expo-router";
import { useColorScheme } from "react-native";
import { Home, Clock, TrendingUp, BookOpen, Settings } from "lucide-react-native";
import React from "react";

import { colors } from "@/constants/theme";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.inactive,
        headerShown: true,
        // Navigation bar dark mode support
        headerStyle: {
          backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
        },
        headerTintColor: isDark ? '#FFFFFF' : '#000000',
        headerShadowVisible: true,
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 17,
        },
        // Tab bar dark mode support
        tabBarStyle: {
          backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: isDark ? '#38383A' : colors.border,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Timer",
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="fast"
        options={{
          title: "Fast",
          tabBarIcon: ({ color }) => <Clock size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: "Progress",
          tabBarIcon: ({ color }) => <TrendingUp size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="learn"
        options={{
          title: "Learn",
          tabBarIcon: ({ color }) => <BookOpen size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => <Settings size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
