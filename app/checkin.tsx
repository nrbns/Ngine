import React, { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
} from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { supabase } from '../lib/supabase'

export default function CheckInScreen() {
  const router = useRouter()
  const { goalId, status } = useLocalSearchParams<{ goalId: string; status: string }>()
  const [energy, setEnergy] = useState(3)
  const [loading, setLoading] = useState(false)

  const submitCheckin = async () => {
    if (!goalId || !status) return

    setLoading(true)
    try {
      let { data: { user } } = await supabase.auth.getUser()

      // Auto sign-in anonymously if no user
      if (!user) {
        const { data: authData, error: authError } = await supabase.auth.signInAnonymously()
        if (authError) {
          Alert.alert('Error', 'Failed to authenticate. Please try again.')
          setLoading(false)
          return
        }
        user = authData.user
      }

      if (!user) {
        Alert.alert('Error', 'Unable to save check-in. Please try again.')
        setLoading(false)
        return
      }

      const today = new Date().toISOString().split('T')[0]

      const { error } = await supabase
        .from('checkins')
        .insert({
          resolution_id: goalId,
          date: today,
          execution: status,
          energy: energy,
        })
        .select()
        .single()

      if (error) throw error

      const messages = {
        yes: 'Great job showing up today!',
        partial: 'Progress over perfection.',
        no: 'Tomorrow is a new day.'
      }

      Alert.alert(
        'Check-in saved!',
        messages[status as keyof typeof messages] || 'Check-in recorded.',
        [
          {
            text: 'Add Proof',
            onPress: () => router.push('/gallery'),
          },
          {
            text: 'Done',
            style: 'cancel',
            onPress: () => router.replace('/(tabs)'),
          }
        ]
      )
    } catch (err: unknown) {
      console.error('Error saving check-in:', err)
      const error = err as Error
      Alert.alert('Error', error?.message || 'Failed to save check-in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Daily Check-In</Text>

        <View style={styles.questionSection}>
          <Text style={styles.question}>Did you show up today?</Text>

          <View style={styles.statusIndicator}>
            <Text style={styles.statusText}>
              {status === 'yes' && '✅ Yes'}
              {status === 'partial' && '🟡 Partial'}
              {status === 'no' && '❌ No'}
            </Text>
          </View>
        </View>

        <View style={styles.energySection}>
          <Text style={styles.energyLabel}>Energy Level</Text>
          <View style={styles.energySlider}>
            {[1, 2, 3, 4, 5].map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.energyDot,
                  energy >= level && styles.energyDotActive
                ]}
                onPress={() => setEnergy(level)}
              >
                <Text style={[
                  styles.energyNumber,
                  energy >= level && styles.energyNumberActive
                ]}>
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.energyDescription}>
            {energy <= 2 ? 'Low energy' : energy === 3 ? 'Normal' : energy >= 4 ? 'High energy' : ''}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={submitCheckin}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'Saving...' : 'Save Check-In'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 40,
  },
  questionSection: {
    marginBottom: 40,
  },
  question: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 24,
  },
  statusIndicator: {
    alignItems: 'center',
  },
  statusText: {
    fontSize: 20,
    fontWeight: '600',
  },
  energySection: {
    marginBottom: 40,
  },
  energyLabel: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 24,
  },
  energySlider: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  energyDot: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  energyDotActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  energyNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
  },
  energyNumberActive: {
    color: '#ffffff',
  },
  energyDescription: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: '#10b981',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
})