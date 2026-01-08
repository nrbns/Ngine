import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
} from 'react-native'
import { useRouter } from 'expo-router'
import { supabase } from '../lib/supabase'

export default function CreateGoalScreen() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [mdd, setMdd] = useState('')
  const [loading, setLoading] = useState(false)

  const saveGoal = async () => {
    if (!title.trim()) {
      Alert.alert('Missing title', 'Please enter a goal title')
      return
    }

    if (!mdd.trim()) {
      Alert.alert('Missing discipline', 'Please describe your minimum daily discipline')
      return
    }

    setLoading(true)
    try {
      let { data: { user } } = await supabase.auth.getUser()

      // Auto sign-in anonymously if no user
      if (!user) {
        const { data: authData, error: authError } = await supabase.auth.signInAnonymously()
        if (authError) {
          Alert.alert('Error', 'Failed to authenticate. Please try again.')
          return
        }
        user = authData.user
      }

      if (!user) {
        Alert.alert('Error', 'Unable to create goal. Please try again.')
        return
      }

      const { error } = await supabase
        .from('resolutions')
        .insert({
          user_id: user.id,
          title: title.trim(),
          mdd: mdd.trim(),
          status: 'active',
        })
        .select()
        .single()

      if (error) throw error

      Alert.alert('Goal created!', 'Your new goal is now active.', [
        { text: 'OK', onPress: () => router.replace('/(tabs)') }
      ])
    } catch (err: unknown) {
      console.error('Error creating goal:', err)
      const error = err as Error
      Alert.alert('Error', error?.message || 'Failed to create goal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Create Goal</Text>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Goal Title</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="e.g., Exercise daily"
              placeholderTextColor="#9ca3af"
              autoFocus
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Minimum Daily Discipline</Text>
            <TextInput
              style={[styles.input, styles.mddInput]}
              value={mdd}
              onChangeText={setMdd}
              placeholder="e.g., 10 push-ups"
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={2}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.saveButton,
              (!title.trim() || !mdd.trim()) && styles.saveButtonDisabled
            ]}
            onPress={saveGoal}
            disabled={loading || !title.trim() || !mdd.trim()}
          >
            <Text style={styles.saveButtonText}>
              {loading ? 'Creating...' : 'Save Goal'}
            </Text>
          </TouchableOpacity>
        </View>
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
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
    marginTop: 40,
    marginBottom: 40,
    textAlign: 'center',
  },
  form: {
    flex: 1,
  },
  field: {
    marginBottom: 32,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  input: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    color: '#111827',
    backgroundColor: '#f9fafb',
  },
  mddInput: {
    height: 80,
    textAlignVertical: 'top',
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
  saveButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
})
