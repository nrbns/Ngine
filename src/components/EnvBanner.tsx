
import { View, Text, StyleSheet } from 'react-native';
import { typography, spacing } from '../../design-system';

export default function EnvBanner() {
  const supabaseOk = process.env.EXPO_PUBLIC_SUPABASE_URL && process.env.EXPO_PUBLIC_SUPABASE_KEY && !process.env.EXPO_PUBLIC_SUPABASE_URL.includes('your_supabase');
  const openaiOk = !!process.env.EXPO_PUBLIC_OPENAI_KEY && !process.env.EXPO_PUBLIC_OPENAI_KEY.includes('your_openai');

  if (supabaseOk && openaiOk) return null; // Nothing to show

  return (
    <View style={styles.container}>
      {!supabaseOk && (
        <Text style={styles.text}>Supabase not configured — Proof uploads will be local-only. See SETUP.md to configure.</Text>
      )}
      {supabaseOk && !openaiOk && (
        <Text style={styles.text}>OpenAI key not set — AI insights will be simulated.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f59e0b',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  text: {
    ...typography.bodySmall,
    color: '#111827',
    fontWeight: '600',
  },
});