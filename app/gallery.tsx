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
import { useRouter, useLocalSearchParams } from 'expo-router'
import { supabase, GoalProof } from '../lib/supabase'
import { showRewardedAd } from '../lib/ads'
import { RealtimeIndicator } from '../components/RealtimeIndicator'
import { useRealtime } from '../lib/useRealtime'
import { useNgineStore } from '../lib/store'
import { COLORS } from '../lib/colors'
import { SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../lib/design-tokens'
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated'

export default function GalleryScreen() {
  const router = useRouter()
  const { goalId } = useLocalSearchParams<{ goalId?: string }>()
  const [loading, setLoading] = useState(true)

  // Zustand store
  const proofs = useNgineStore((state) => state.proofs)
  const setProofs = useNgineStore((state) => state.setProofs)
  const activeResolution = useNgineStore((state) => state.activeResolution)
  const setUserId = useNgineStore((state) => state.setUserId)

  // Realtime hook - subscribe to proofs changes
  const resolutionId = goalId || activeResolution?.id
  const { isOnline } = useRealtime({
    resolutionId: resolutionId || undefined,
    enabled: !!resolutionId,
  })

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

      setUserId(user.id)

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

  const renderProof = ({ item }: { item: GoalProof }) => {
    const date = new Date(item.created_at)
    const month = date.toLocaleDateString('en-US', { month: 'short' })
    const day = date.getDate()
    const description = item.description || 'Proof'
    
    return (
      <View style={styles.proofCard}>
        <Image
          source={{ uri: item.image_url }}
          style={styles.proofImage}
          resizeMode="cover"
        />
        <View style={styles.proofDate}>
          <Text style={styles.proofDateText}>
            {month} {day} / {description}
          </Text>
        </View>
      </View>
    )
  }

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
        <Text style={styles.title}>Select or Capture Proof</Text>
        <RealtimeIndicator />
      </View>

      <View style={styles.content}>
        <Animated.View entering={FadeInUp.delay(100).duration(300)} style={styles.actionButtons}>
          <Animated.View entering={FadeInUp.delay(150).duration(300)}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleUploadProof}
              activeOpacity={0.8}
            >
              <Text style={styles.actionButtonIcon}>📷</Text>
              <Text style={styles.actionButtonText}>Take Photo</Text>
            </TouchableOpacity>
          </Animated.View>
          <Animated.View entering={FadeInUp.delay(200).duration(300)}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleUploadProof}
              activeOpacity={0.8}
            >
              <Text style={styles.actionButtonIcon}>📁</Text>
              <Text style={styles.actionButtonText}>Upload File</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(250).duration(300)}>
          <Text style={styles.sectionHeader}>Most Recent Proofs</Text>
        </Animated.View>

        {proofs.length === 0 ? (
          <Animated.View entering={FadeInUp.delay(300).duration(300)} style={styles.emptyGrid}>
            <View style={styles.emptyIconContainer}>
              <Text style={styles.emptyEmoji}>📸</Text>
            </View>
            <Text style={styles.emptyTitle}>No proofs yet</Text>
            <Text style={styles.emptySubtitle}>
              Visual evidence of your progress builds momentum and accountability.
            </Text>
          </Animated.View>
        ) : (
          <FlatList
            data={proofs.slice(0, 6)}
            renderItem={({ item, index }) => (
              <Animated.View entering={FadeIn.delay(index * 50).duration(300)}>
                {renderProof({ item })}
              </Animated.View>
            )}
            keyExtractor={(item) => item.id}
            numColumns={3}
            contentContainerStyle={styles.gridContainer}
            columnWrapperStyle={styles.columnWrapper}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.screen,
    paddingTop: SPACING.section,
    marginBottom: SPACING.lg,
  },
  title: {
    ...TYPOGRAPHY.greeting,
    fontSize: 28,
    color: COLORS.textPrimary,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.screen,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  actionButton: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border + '40',
    ...SHADOWS.md,
    overflow: 'hidden',
  },
  actionButtonIcon: {
    fontSize: 40,
    marginBottom: SPACING.sm,
  },
  actionButtonText: {
    ...TYPOGRAPHY.label,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  sectionHeader: {
    ...TYPOGRAPHY.label,
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  gridContainer: {
    paddingVertical: SPACING.md,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  emptyGrid: {
    flex: 1,
    paddingVertical: SPACING.xl * 2,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 300,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
    borderWidth: 2,
    borderColor: COLORS.primary + '40',
    ...SHADOWS.md,
  },
  emptyEmoji: {
    fontSize: 48,
  },
  emptyTitle: {
    ...TYPOGRAPHY.goalTitle,
    fontSize: 22,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...TYPOGRAPHY.goalMdd,
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
    opacity: 0.8,
    lineHeight: 22,
  },
  proofCard: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    backgroundColor: COLORS.card,
    margin: SPACING.xs / 2,
    borderWidth: 1,
    borderColor: COLORS.border + '40',
    ...SHADOWS.sm,
  },
  proofImage: {
    width: '100%',
    height: '100%',
  },
  proofDate: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.overlay,
    padding: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border + '20',
  },
  proofDateText: {
    fontSize: 11,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
})
