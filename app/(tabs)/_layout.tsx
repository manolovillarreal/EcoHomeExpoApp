import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#17624a',
        tabBarInactiveTintColor: '#6a7c74',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#d7e0d8',
        },
      }}
    >
      <Tabs.Screen
        name="products"
        options={{
          title: 'Products',
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
        }}
      />
    </Tabs>
  );
}
