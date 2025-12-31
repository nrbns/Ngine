// Resolution Card Component
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { StatusBadge, Status } from './StatusBadge';
import { Resolution } from '../types';

interface ResolutionCardProps {
  resolution: Resolution;
  onPress: () => void;
}

export function ResolutionCard({ resolution, onPress }: ResolutionCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.title}>{resolution.title}</Text>
        <StatusBadge status={resolution.status as Status} />
      </View>
      {resolution.why && (
        <Text style={styles.why}>{resolution.why}</Text>
      )}
      <View style={styles.stats}>
        <Text style={styles.stat}>
          MDD: {resolution.mdd} • Duration: {resolution.duration} days
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  why: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  stats: {
    marginTop: 8,
  },
  stat: {
    fontSize: 12,
    color: '#9ca3af',
  },
});

