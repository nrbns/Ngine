import { Tabs } from 'expo-router'
import { View, Text, StyleSheet } from 'react-native'
import { COLORS } from '../../lib/config/colors'
import { SPACING, SHADOWS } from '../../lib/config/design-tokens'

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
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textTertiary,
        tabBarShowLabel: true,
        contentStyle: { backgroundColor: 'transparent' },
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
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border + '40',
    height: 70,
    paddingBottom: SPACING.md,
    paddingTop: SPACING.sm,
    ...SHADOWS.lg,
    elevation: 10,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  icon: {
    fontSize: 24,
    textAlign: 'center',
    opacity: 0.7,
  },
  iconFocused: {
    color: COLORS.primary,
    opacity: 1,
    transform: [{ scale: 1.1 }],
  },
  label: {
    fontSize: 11,
    color: COLORS.textTertiary,
    textAlign: 'center',
    fontWeight: '500',
    marginTop: 2,
    letterSpacing: 0.3,
  },
  labelFocused: {
    color: COLORS.primary,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
})
