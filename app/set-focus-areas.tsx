import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Pressable,
} from 'react-native'
import { useRouter } from 'expo-router'
import Animated, { FadeInUp } from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { COLORS } from '../lib/colors'
import { SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../lib/design-tokens'

interface FocusArea {
  id: string
  name: string
  selected: boolean
}

const defaultFocusAreas: FocusArea[] = [
  { id: '1', name: 'Health & Fitness', selected: false },
  { id: '2', name: 'Career Growth', selected: false },
  { id: '3', name: 'Reading & Learning', selected: false },
  { id: '4', name: 'Personal Development', selected: false },
]

export default function SetFocusAreasScreen() {
  const router = useRouter()
  const [focusAreas, setFocusAreas] = useState<FocusArea[]>(defaultFocusAreas)
  const [newArea, setNewArea] = useState('')

  const toggleFocusArea = (id: string) => {
    Haptics.selectionAsync()
    setFocusAreas(prev =>
      prev.map(area =>
        area.id === id ? { ...area, selected: !area.selected } : area
      )
    )
  }

  const addFocusArea = () => {
    if (newArea.trim()) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      setFocusAreas(prev => [
        ...prev,
        { id: Date.now().toString(), name: newArea.trim(), selected: true },
      ])
      setNewArea('')
    }
  }

  const removeFocusArea = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setFocusAreas(prev => prev.filter(area => area.id !== id))
  }

  const handleSave = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    router.back()
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Set Focus Areas</Text>
        <Text style={styles.prompt}>What areas of life do you want to focus on?</Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={newArea}
            onChangeText={setNewArea}
            placeholder="Add a focus area..."
            placeholderTextColor={COLORS.textTertiary}
            onSubmitEditing={addFocusArea}
          />
          <Pressable onPress={addFocusArea} style={styles.addButton}>
            <Text style={styles.addButtonText}>+</Text>
          </Pressable>
        </View>

        <View style={styles.chipsContainer}>
          {focusAreas.map((area, index) => (
            <Animated.View
              key={area.id}
              entering={FadeInUp.delay(index * 50).duration(200)}
            >
              <Pressable
                style={[
                  styles.chip,
                  area.selected && styles.chipSelected,
                ]}
                onPress={() => toggleFocusArea(area.id)}
              >
                {area.selected && (
                  <View style={styles.chipIcon}>
                    <Text style={styles.chipIconText}>●</Text>
                  </View>
                )}
                <Text
                  style={[
                    styles.chipText,
                    area.selected && styles.chipTextSelected,
                  ]}
                >
                  {area.name}
                </Text>
                {area.selected && (
                  <Pressable
                    onPress={() => removeFocusArea(area.id)}
                    style={styles.removeButton}
                  >
                    <Text style={styles.removeButtonText}>✕</Text>
                  </Pressable>
                )}
              </Pressable>
            </Animated.View>
          ))}
        </View>

        <View style={styles.spacer} />

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          activeOpacity={0.8}
        >
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
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
    fontSize: 28,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  prompt: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
    lineHeight: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  input: {
    flex: 1,
    borderWidth: 2,
    borderColor: COLORS.border + '60',
    borderRadius: BORDER_RADIUS.button,
    padding: SPACING.md,
    fontSize: 16,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.card,
    minHeight: SPACING.button,
    ...SHADOWS.sm,
  },
  addButton: {
    width: SPACING.button,
    height: SPACING.button,
    borderRadius: BORDER_RADIUS.button,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.md,
    overflow: 'hidden',
  },
  addButtonText: {
    fontSize: 24,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.pill,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border + '40',
    gap: SPACING.xs,
    ...SHADOWS.sm,
  },
  chipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    ...SHADOWS.md,
  },
  chipIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.textPrimary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipIconText: {
    fontSize: 8,
    color: COLORS.primary,
  },
  chipText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: COLORS.textPrimary,
  },
  removeButton: {
    marginLeft: SPACING.xs,
    padding: 4,
  },
  removeButtonText: {
    fontSize: 16,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  spacer: {
    flex: 1,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.button,
    alignItems: 'center',
    marginBottom: SPACING.screen,
    ...SHADOWS.primary,
    minHeight: SPACING.button,
    overflow: 'hidden',
  },
  saveButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.textPrimary,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
})
