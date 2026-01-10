import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native'
import { useRouter } from 'expo-router'
import { supabase } from '../lib/api/supabase'
import { COLORS } from '../lib/config/colors'
import { SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../lib/config/design-tokens'
import * as Haptics from 'expo-haptics'

const DURATION_OPTIONS = ['7 Days', '14 Days', '30 Days', '60 Days', '90 Days']

export default function CreateGoalScreen() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [why, setWhy] = useState('')
  const [duration, setDuration] = useState('14 Days')
  const [mdd, setMdd] = useState('')
  const [loading, setLoading] = useState(false)
  const [showDurationPicker, setShowDurationPicker] = useState(false)

  const saveGoal = async () => {
    if (!title.trim()) {
      Alert.alert('Missing title', 'Please enter a goal title')
      return
    }

    if (!why.trim()) {
      Alert.alert('Missing reason', 'Please explain why this resolution is important')
      return
    }

    if (!mdd.trim()) {
      Alert.alert('Missing discipline', 'Please describe your minimum daily discipline')
      return
    }

    // Check if Supabase is configured
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
    if (!supabaseUrl || supabaseUrl === 'https://placeholder.supabase.co' || supabaseUrl.includes('placeholder')) {
      Alert.alert(
        'Supabase Not Configured',
        'Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_KEY in your .env file.\n\nFor now, goals will be saved locally only.',
        [{ text: 'OK' }]
      )
      // Still allow navigation for demo purposes
      router.replace('/(tabs)')
      return
    }

    setLoading(true)
    try {
      let { data: { user }, error: getUserError } = await supabase.auth.getUser()

      if (getUserError) {
        console.error('Get user error:', getUserError)
      }

      // Auto sign-in anonymously if no user
      if (!user) {
        const { data: authData, error: authError } = await supabase.auth.signInAnonymously()
        if (authError) {
          console.error('Auth error:', authError)
          Alert.alert(
            'Authentication Error',
            `Failed to sign in: ${authError.message}\n\nPlease check your Supabase configuration.`,
            [{ text: 'OK' }]
          )
          setLoading(false)
          return
        }
        user = authData?.user || null
      }

      if (!user) {
        Alert.alert('Error', 'Unable to authenticate. Please check your Supabase configuration.')
        setLoading(false)
        return
      }

      console.log('Creating goal for user:', user.id)

      const { data, error } = await supabase
        .from('resolutions')
        .insert({
          user_id: user.id,
          title: title.trim(),
          why: why.trim(),
          duration: duration,
          mdd: mdd.trim(),
          status: 'active',
        })
        .select()
        .single()

      if (error) {
        console.error('Supabase insert error:', error)
        console.error('Error code:', error.code)
        console.error('Error details:', error.details)
        console.error('Error hint:', error.hint)
        
        // Provide helpful error messages
        let errorMessage = error.message || 'Failed to create goal'
        if (error.code === '42501') {
          errorMessage = 'Permission denied. Please check your Supabase RLS policies.'
        } else if (error.code === 'PGRST116') {
          errorMessage = 'Table not found. Please run the database schema in Supabase.'
        } else if (error.code === '23503') {
          errorMessage = 'Foreign key error. Please ensure user exists in auth.users.'
        }
        
        throw new Error(errorMessage)
      }

      if (!data) {
        throw new Error('Goal created but no data returned')
      }

      console.log('Goal created successfully:', data.id)

      // Success - navigate immediately (optimistic)
      router.replace('/(tabs)')
    } catch (err: unknown) {
      console.error('Error creating goal:', err)
      const error = err as Error
      Alert.alert(
        'Error Creating Goal',
        error?.message || 'Failed to create goal. Please check:\n\n1. Supabase is configured\n2. Database schema is set up\n3. RLS policies allow inserts',
        [{ text: 'OK' }]
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Create New Aim</Text>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Title"
              placeholderTextColor={COLORS.textTertiary}
              autoFocus
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Why</Text>
            <TextInput
              style={styles.input}
              value={why}
              onChangeText={setWhy}
              placeholder="Why"
              placeholderTextColor={COLORS.textTertiary}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Duration</Text>
            <TouchableOpacity
              style={styles.selectInput}
              onPress={() => {
                Haptics.selectionAsync()
                setShowDurationPicker(true)
              }}
            >
              <Text style={styles.selectText}>{duration}</Text>
              <Text style={styles.selectArrow}>▼</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.field}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Minimum Daily Dose</Text>
              <Text style={styles.infoIcon}>?</Text>
            </View>
            <TextInput
              style={styles.input}
              value={mdd}
              onChangeText={setMdd}
              placeholder="E.g. Actively code for 30 + mins."
              placeholderTextColor={COLORS.textTertiary}
            />
          </View>

          <TouchableOpacity style={styles.supportStrategy}>
            <View style={styles.supportStrategyLeft}>
              <Text style={styles.supportIcon}>📄</Text>
              <Text style={styles.supportLabel}>Support Strategy</Text>
            </View>
            <Text style={styles.supportArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.saveButton,
              (!title.trim() || !why.trim() || !mdd.trim()) && styles.saveButtonDisabled
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
              saveGoal()
            }}
            disabled={loading || !title.trim() || !why.trim() || !mdd.trim()}
            activeOpacity={0.8}
          >
            {loading && <ActivityIndicator color={COLORS.textPrimary} size="small" />}
            <Text style={styles.saveButtonText}>
              {loading ? 'Creating...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Duration Picker Modal */}
      <Modal
        visible={showDurationPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDurationPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Duration</Text>
              <TouchableOpacity
                onPress={() => setShowDurationPicker(false)}
                style={styles.modalCloseButton}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView>
              {DURATION_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.durationOption,
                    duration === option && styles.durationOptionSelected,
                  ]}
                  onPress={() => {
                    Haptics.selectionAsync()
                    setDuration(option)
                    setShowDurationPicker(false)
                  }}
                >
                  <Text
                    style={[
                      styles.durationOptionText,
                      duration === option && styles.durationOptionTextSelected,
                    ]}
                  >
                    {option}
                  </Text>
                  {duration === option && (
                    <Text style={styles.durationCheckmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.screen,
    paddingTop: SPACING.xl,
  },
  title: {
    ...TYPOGRAPHY.greeting,
    fontSize: 32,
    color: COLORS.textPrimary,
    marginTop: SPACING.xl,
    marginBottom: SPACING.xl,
    textAlign: 'center',
  },
  form: {
    flex: 1,
  },
  field: {
    marginBottom: SPACING.xl,
  },
  label: {
    ...TYPOGRAPHY.label,
    fontSize: 16,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  input: {
    borderWidth: 2,
    borderColor: COLORS.border + '60',
    borderRadius: BORDER_RADIUS.button,
    padding: SPACING.md,
    fontSize: 16,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.card,
    ...SHADOWS.sm,
    minHeight: SPACING.button,
  },
  mddInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.button,
    alignItems: 'center',
    marginTop: SPACING.lg,
    ...SHADOWS.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
    minHeight: SPACING.button,
    overflow: 'hidden',
  },
  saveButtonDisabled: {
    backgroundColor: COLORS.border,
    ...SHADOWS.sm,
    opacity: 0.5,
  },
  saveButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.textPrimary,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  selectInput: {
    borderWidth: 2,
    borderColor: COLORS.border + '60',
    borderRadius: BORDER_RADIUS.button,
    padding: SPACING.md,
    backgroundColor: COLORS.card,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: SPACING.button,
    ...SHADOWS.sm,
  },
  selectText: {
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  selectArrow: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    gap: SPACING.xs,
  },
  infoIcon: {
    fontSize: 16,
    color: COLORS.textTertiary,
    fontWeight: '600',
  },
  supportStrategy: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.button,
    borderWidth: 1,
    borderColor: COLORS.border + '40',
    marginTop: SPACING.md,
    ...SHADOWS.sm,
  },
  supportStrategyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  supportIcon: {
    fontSize: 20,
  },
  supportLabel: {
    ...TYPOGRAPHY.label,
    color: COLORS.textPrimary,
  },
  supportArrow: {
    fontSize: 18,
    color: COLORS.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    maxHeight: '50%',
    paddingBottom: SPACING.screen,
    ...SHADOWS.xl,
    borderTopWidth: 1,
    borderColor: COLORS.border + '40',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.screen,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    ...TYPOGRAPHY.goalTitle,
    fontSize: 20,
    color: COLORS.textPrimary,
  },
  modalCloseButton: {
    padding: SPACING.xs,
  },
  modalCloseText: {
    fontSize: 24,
    color: COLORS.textSecondary,
  },
  durationOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    paddingHorizontal: SPACING.screen,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border + '30',
  },
  durationOptionSelected: {
    backgroundColor: COLORS.primary + '20',
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  durationOptionText: {
    fontSize: 18,
    color: COLORS.textPrimary,
  },
  durationOptionTextSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  durationCheckmark: {
    fontSize: 20,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
})
