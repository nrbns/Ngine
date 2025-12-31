// Profile - Who the user is
// NOT settings. This is identity.
// Calm, serious, human
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../services/supabase';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, typography, spacing } from '../design-system';

const FOCUS_AREAS = ['Health', 'Career', 'Money', 'Learning', 'Discipline', 'Spiritual'] as const;

export default function ProfileScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [alias, setAlias] = useState('');
  const [coreIdentity, setCoreIdentity] = useState('');
  const [focusAreas, setFocusAreas] = useState<string[]>([]);
  const [totalDays, setTotalDays] = useState(0);
  const [recoveryCount, setRecoveryCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (userData) {
        setName(userData.name || '');
        setAlias(userData.alias || '');
        setCoreIdentity(userData.core_identity || '');
      }

      const { data: focusData } = await supabase
        .from('user_focus_areas')
        .select('area')
        .eq('user_id', user.id);

      if (focusData) {
        setFocusAreas(focusData.map(f => f.area));
      }

      // Calculate stats
      const { data: resolutions } = await supabase
        .from('resolutions')
        .select('*')
        .eq('user_id', user.id);

      const { data: checkins } = await supabase
        .from('checkins')
        .select('*')
        .in('resolution_id', resolutions?.map(r => r.id) || []);

      setTotalDays(checkins?.length || 0);

      const recoveryResolutions = resolutions?.filter(r => r.status === 'recovering') || [];
      setRecoveryCount(recoveryResolutions.length);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const saveProfile = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Please sign in');
        return;
      }

      await supabase
        .from('users')
        .upsert({
          id: user.id,
          name: name.trim() || null,
          alias: alias.trim() || null,
          core_identity: coreIdentity.trim() || null,
        }, {
          onConflict: 'id'
        });

      await supabase
        .from('user_focus_areas')
        .delete()
        .eq('user_id', user.id);

      if (focusAreas.length > 0) {
        await supabase
          .from('user_focus_areas')
          .insert(focusAreas.map(area => ({
            user_id: user.id,
            area,
          })));
      }

      router.back();
    } catch (error: any) {
      console.error('Error saving profile:', error);
      alert(error.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const toggleFocusArea = (area: string) => {
    setFocusAreas(prev =>
      prev.includes(area)
        ? prev.filter(a => a !== area)
        : [...prev, area]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Profile</Text>

        <View style={styles.section}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Your name"
            placeholderTextColor={colors.textTertiary}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Alias</Text>
          <TextInput
            style={styles.input}
            value={alias}
            onChangeText={setAlias}
            placeholder="How you'd like to be called"
            placeholderTextColor={colors.textTertiary}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Identity Statement</Text>
          <Text style={styles.hint}>Who are you becoming?</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={coreIdentity}
            onChangeText={setCoreIdentity}
            placeholder="e.g., Disciplined & Focused"
            placeholderTextColor={colors.textTertiary}
            multiline
            numberOfLines={2}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Life Focus Areas</Text>
          <View style={styles.focusGrid}>
            {FOCUS_AREAS.map((area) => (
              <TouchableOpacity
                key={area}
                style={[
                  styles.focusChip,
                  focusAreas.includes(area) && styles.focusChipActive,
                ]}
                onPress={() => toggleFocusArea(area)}
              >
                <Text
                  style={[
                    styles.focusChipText,
                    focusAreas.includes(area) && styles.focusChipTextActive,
                  ]}
                >
                  {area}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Stats - No toggles, no clutter */}
        <View style={styles.statsSection}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{totalDays}</Text>
            <Text style={styles.statLabel}>Total days committed</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{recoveryCount}</Text>
            <Text style={styles.statLabel}>Recovery count</Text>
          </View>
        </View>

        <PrimaryButton
          title="Save Profile"
          onPress={saveProfile}
          loading={loading}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingTop: spacing.xxl + 20,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.xl,
  },
  section: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  hint: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  input: {
    ...typography.body,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    backgroundColor: colors.background,
  },
  textArea: {
    height: 60,
    textAlignVertical: 'top',
  },
  focusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  focusChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
  },
  focusChipActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accent,
  },
  focusChipText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  focusChipTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  statsSection: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.xl,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  stat: {
    flex: 1,
  },
  statValue: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
});
