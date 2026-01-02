// Resolution Card Component
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { StatusBadge } from '../../components/StatusBadge';
import type { Status } from '../../components/StatusBadge';
import { colors, spacing, borderRadius } from '../../design-system';

// Local minimal resolution type to avoid cross-module type conflicts
interface SmallResolution {
  id?: string;
  title: string;
  why?: string;
  mdd_text?: string;
  mdd?: string;
  duration_days?: number;
  duration?: number;
  status: Status | string;
}

interface ResolutionCardProps {
  resolution: SmallResolution;
  onPress: () => void;
}

export function ResolutionCard({ resolution, onPress }: ResolutionCardProps) {
  // normalize possible snake_case fields from backend to the typed Resolution shape
  // The resolution object may come from different backends; tolerate alternative field names
  const res = resolution as unknown as Record<string, unknown>;
  const mddText = String(res['mdd_text'] ?? res['mddText'] ?? res['mdd'] ?? '—');
  const durationDays = Number(res['duration_days'] ?? res['durationDays'] ?? res['duration'] ?? 0);

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
          MDD: {mddText} • Duration: {durationDays} days
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