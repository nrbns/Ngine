import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Shimmer } from './Shimmer'
import { SPACING } from '../lib/design-tokens'

interface LoadingSkeletonProps {
  type?: 'card' | 'list' | 'button' | 'custom'
  count?: number
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  type = 'card',
  count = 1,
}) => {
  if (type === 'card') {
    return (
      <>
        {Array.from({ length: count }).map((_, index) => (
          <View key={index} style={styles.cardContainer}>
            <Shimmer width="40%" height={16} borderRadius={8} style={styles.cardTitle} />
            <Shimmer width="100%" height={24} borderRadius={10} style={styles.cardContent} />
            <Shimmer width="60%" height={14} borderRadius={7} style={styles.cardSubtitle} />
            <View style={styles.cardFooter}>
              <Shimmer width="30%" height={12} borderRadius={6} />
              <Shimmer width="40%" height={12} borderRadius={6} />
            </View>
          </View>
        ))}
      </>
    )
  }

  if (type === 'list') {
    return (
      <>
        {Array.from({ length: count }).map((_, index) => (
          <View key={index} style={styles.listItem}>
            <Shimmer width={50} height={50} borderRadius={25} />
            <View style={styles.listContent}>
              <Shimmer width="70%" height={16} borderRadius={8} />
              <Shimmer width="50%" height={12} borderRadius={6} style={styles.listSubtitle} />
            </View>
          </View>
        ))}
      </>
    )
  }

  if (type === 'button') {
    return (
      <>
        {Array.from({ length: count }).map((_, index) => (
          <Shimmer
            key={index}
            width="100%"
            height={48}
            borderRadius={14}
            style={styles.button}
          />
        ))}
      </>
    )
  }

  return null
}

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: SPACING.lg,
    padding: SPACING.md,
  },
  cardTitle: {
    marginBottom: SPACING.sm,
  },
  cardContent: {
    marginBottom: SPACING.sm,
  },
  cardSubtitle: {
    marginBottom: SPACING.md,
  },
  cardFooter: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.sm,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.md,
  },
  listContent: {
    flex: 1,
  },
  listSubtitle: {
    marginTop: SPACING.xs,
  },
  button: {
    marginBottom: SPACING.md,
  },
})
