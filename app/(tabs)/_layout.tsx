import { Tabs } from 'expo-router'
import { View, Text, StyleSheet } from 'react-native'

function TabBarIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons = {
    index: '🏠',
    profile: '📊',
  }

  return (
    <Text style={[styles.icon, focused && styles.iconFocused]}>
      {icons[name as keyof typeof icons] || '●'}
    </Text>
  )
}

function TabBarLabel({ name, focused }: { name: string; focused: boolean }) {
  const labels = {
    index: 'Today',
    profile: 'Progress',
  }

  return (
    <Text style={[styles.label, focused && styles.labelFocused]}>
      {labels[name as keyof typeof labels] || name}
    </Text>
  )
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#6b7280',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Today',
          tabBarIcon: ({ focused }) => <TabBarIcon name="index" focused={focused} />,
          tabBarLabel: ({ focused }) => <TabBarLabel name="index" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Progress',
          tabBarIcon: ({ focused }) => <TabBarIcon name="profile" focused={focused} />,
          tabBarLabel: ({ focused }) => <TabBarLabel name="profile" focused={focused} />,
        }}
      />
    </Tabs>
  )
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    height: 80,
    paddingBottom: 20,
    paddingTop: 8,
  },
  icon: {
    fontSize: 20,
    textAlign: 'center',
  },
  iconFocused: {
    color: '#3b82f6',
  },
  label: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    fontWeight: '500',
  },
  labelFocused: {
    color: '#3b82f6',
    fontWeight: '600',
  },
})
