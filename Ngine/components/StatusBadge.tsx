// Status Badge Component
import { View, Text, StyleSheet } from 'react-native';
import { Status } from '../logic/statusEngine';

export type { Status };

interface StatusBadgeProps {
  status: Status;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const colors = {
    aligned: { bg: '#d1fae5', text: '#065f46' },
    drifting: { bg: '#fef3c7', text: '#92400e' },
    broken: { bg: '#fee2e2', text: '#991b1b' },
    recovering: { bg: '#dbeafe', text: '#1e40af' },
  };

  const emojis = {
    aligned: '🟢',
    drifting: '🟡',
    broken: '🔴',
    recovering: '🔵',
  };

  const labels = {
    aligned: 'Aligned',
    drifting: 'Drifting',
    broken: 'Broken',
    recovering: 'Recovering',
  };

  const color = colors[status];
  const emoji = emojis[status];
  const label = labels[status];

  return (
    <View style={[styles.badge, { backgroundColor: color.bg }]}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={[styles.text, { color: color.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  emoji: {
    fontSize: 12,
    marginRight: 4,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});

