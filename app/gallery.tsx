import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  Alert,
  SafeAreaView,
} from 'react-native'
import { useRouter } from 'expo-router'
import { supabase, GoalProof } from '../lib/supabase'
import { showRewardedAd } from '../lib/ads'

export default function GalleryScreen() {
  const router = useRouter()
  const [proofs, setProofs] = useState<GoalProof[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProofs()
  }, [])

  const loadProofs = async () => {
    try {
      let { data: { user } } = await supabase.auth.getUser()
      
      // Auto sign-in anonymously if no user
      if (!user) {
        const { data: authData, error: authError } = await supabase.auth.signInAnonymously()
        if (authError) {
          console.error('Error signing in anonymously:', authError)
          setLoading(false)
          return
        }
        user = authData.user
      }

      if (!user) {
        setLoading(false)
        return
      }

      // Get user's resolutions first
      const { data: resolutions } = await supabase
        .from('resolutions')
        .select('id')
        .eq('user_id', user.id)

      if (!resolutions || resolutions.length === 0) {
        setProofs([])
        setLoading(false)
        return
      }

      const resolutionIds = resolutions.map(r => r.id)

      const { data, error } = await supabase
        .from('goal_proofs')
        .select('*')
        .in('resolution_id', resolutionIds)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProofs(data || [])
    } catch (err) {
      console.error('Error loading proofs:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleUploadProof = async () => {
    // Show rewarded ad first
    try {
      await showRewardedAd()
      // After ad completion, allow upload
      Alert.alert('Upload Proof', 'Proof upload functionality ready!', [
        { text: 'OK' }
      ])
    } catch (error) {
      Alert.alert('Ad Error', 'Unable to show rewarded ad. Try again later.')
    }
  }

  const renderProof = ({ item }: { item: GoalProof }) => (
    <View style={styles.proofCard}>
      <Image
        source={{ uri: item.image_url }}
        style={styles.proofImage}
        resizeMode="cover"
      />
      <Text style={styles.proofDate}>
        {new Date(item.created_at).toLocaleDateString()}
      </Text>
    </View>
  )

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyEmoji}>📸</Text>
      <Text style={styles.emptyTitle}>Add proof (optional)</Text>
      <Text style={styles.emptySubtitle}>
        Visual evidence of your progress builds momentum and accountability.
      </Text>
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Progress Proof</Text>
        <View style={styles.placeholder} />
      </View>

      {proofs.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={proofs}
          renderItem={renderProof}
          keyExtractor={(item) => item.id}
          numColumns={3}
          contentContainerStyle={styles.gridContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      <View style={styles.uploadSection}>
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={handleUploadProof}
        >
          <Text style={styles.uploadButtonText}>🎥 Watch ad to upload proof</Text>
        </TouchableOpacity>
        <Text style={styles.uploadNote}>
          Rewarded ads help keep the app free while you earn proof badges.
        </Text>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '500',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  placeholder: {
    width: 50,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  gridContainer: {
    padding: 16,
  },
  proofCard: {
    flex: 1,
    margin: 4,
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f8fafc',
  },
  proofImage: {
    width: '100%',
    height: '100%',
  },
  proofDate: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: '#ffffff',
    fontSize: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    textAlign: 'center',
  },
  uploadSection: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  uploadButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  uploadButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  uploadNote: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
})
