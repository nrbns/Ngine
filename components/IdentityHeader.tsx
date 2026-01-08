import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

interface IdentityHeaderProps {
  identity?: string
}

export const IdentityHeader: React.FC<IdentityHeaderProps> = ({
  identity = 'You are becoming consistent.'
}) => {
  const getCurrentTimeGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <View style={styles.header}>
      <Text style={styles.greeting}>{getCurrentTimeGreeting()}</Text>
      <Text style={styles.identity}>{identity}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  identity: {
    fontSize: 16,
    color: '#6b7280',
    fontStyle: 'italic',
  },
})
