// Resolution Card Component
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { StatusBadge, Status } from './StatusBadge';
import { Resolution } from '../types';
import { colors, spacing, borderRadius } from '../design-system';

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
          MDD: {resolution.mdd_text || '—'} • Duration: {resolution.duration_days || 0} days
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.darkSurface,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.darkTextPrimary,
    flex: 1,
  },
  why: {
    fontSize: 14,
    color: colors.darkTextSecondary,
    marginBottom: spacing.sm,
  },
  stats: {
    marginTop: spacing.sm,
  },
  stat: {
    fontSize: 12,
    color: colors.textTertiary,
  },
});

