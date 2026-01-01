import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../../design-system';

interface IntegrityMeterProps {
  resolutions: any[];
}

export default function IntegrityMeter({ resolutions }: IntegrityMeterProps) {
  const valid = resolutions.filter(r => typeof r.success_probability === 'number');
  const average = valid.length === 0 ? 100 : Math.round(valid.reduce((s, r) => s + r.success_probability, 0) / valid.length);

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Text style={styles.label}>Integrity Level</Text>
        <Text style={styles.sub}>Overall execution progress</Text>
      </View>
      <View style={styles.right}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{average}%</Text>
        </View>
      </View>
      <View style={styles.progressBarBackground} />
      <View style={[styles.progressBar, { width: `${Math.max(0, Math.min(100, average))}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#2b3f50',
    borderRadius: 12,
  },
  left: {
    marginBottom: 8,
  },
  label: {
    ...typography.body,
    color: '#ecf0f1',
    fontWeight: '700',
  },
  sub: {
    ...typography.bodySmall,
    color: '#bfc9cf',
  },
  right: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  badge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#34495e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#3b82f6',
    fontWeight: '700',
    fontSize: 18,
  },
  progressBarBackground: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 12,
    height: 8,
    borderRadius: 8,
    backgroundColor: '#1f2b34',
  },
  progressBar: {
    position: 'absolute',
    left: 16,
    bottom: 12,
    height: 8,
    borderRadius: 8,
    backgroundColor: '#3b82f6',
  },
});