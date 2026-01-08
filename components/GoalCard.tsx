import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

interface Goal {
  id: string
  title: string
  mdd: string
}

interface GoalCardProps {
  goal: Goal
}

export const GoalCard: React.FC<GoalCardProps> = ({ goal }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>Today's Goal</Text>
      <Text style={styles.title}>{goal.title}</Text>
      <Text style={styles.mdd}>{goal.mdd}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f8fafc',
    padding: 20,
    borderRadius: 12,
    marginVertical: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  label: {
    fontSize: 14,
    color: '#6b7280',
    textTransform: 'uppercase',
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  mdd: {
    fontSize: 16,
    color: '#4b5563',
  },
})
