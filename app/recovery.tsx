import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native'
import { useRouter } from 'expo-router'

export default function RecoveryScreen() {
  const router = useRouter()

  const handleReset = () => {
    // Reset logic would go here
    router.replace('/(tabs)')
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Recovery Mode</Text>

        <View style={styles.messageCard}>
          <Text style={styles.message}>
            You didn't fail. Reset tomorrow.
          </Text>
          <Text style={styles.subMessage}>
            Every expert was once a beginner. Every champion was once defeated.
            This is just part of the journey.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.resetButton}
          onPress={handleReset}
        >
          <Text style={styles.resetButtonText}>Reset Tomorrow</Text>
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
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 40,
  },
  messageCard: {
    backgroundColor: '#f8fafc',
    padding: 24,
    borderRadius: 16,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  message: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 16,
  },
  subMessage: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  resetButton: {
    backgroundColor: '#10b981',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resetButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
})
