// Onboarding Flow - First Time User Experience
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function OnboardingScreen() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: 'Welcome to NGINE',
      emoji: '🚀',
      subtitle: 'Finish what you start',
      description: 'Track your resolutions with honesty, discipline, and recovery.',
      button: 'Get Started',
    },
    {
      title: 'How It Works',
      emoji: null,
      subtitle: null,
      description: null,
      content: (
        <View>
          <View style={styles.step}>
            <Text style={styles.stepNumber}>1</Text>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Identity</Text>
              <Text style={styles.stepDescription}>
                Define who you're becoming. This anchors everything.
              </Text>
            </View>
          </View>
          <View style={styles.step}>
            <Text style={styles.stepNumber}>2</Text>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Aims</Text>
              <Text style={styles.stepDescription}>
                Set 3-5 long-term life directions. Resolutions connect to these.
              </Text>
            </View>
          </View>
          <View style={styles.step}>
            <Text style={styles.stepNumber}>3</Text>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Resolutions</Text>
              <Text style={styles.stepDescription}>
                Create resolutions linked to aims. Set your Minimum Daily Discipline.
              </Text>
            </View>
          </View>
          <View style={styles.step}>
            <Text style={styles.stepNumber}>4</Text>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Daily Reality</Text>
              <Text style={styles.stepDescription}>
                Check in daily. Be honest. Track energy and blockers.
              </Text>
            </View>
          </View>
          <View style={styles.step}>
            <Text style={styles.stepNumber}>5</Text>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Recovery</Text>
              <Text style={styles.stepDescription}>
                If you drift, use recovery mode. No guilt, just reset.
              </Text>
            </View>
          </View>
        </View>
      ),
      button: 'Next',
    },
    {
      title: 'Ethics & Trust',
      emoji: null,
      subtitle: null,
      description: null,
      content: (
        <View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Honest Tracking</Text>
            <Text style={styles.sectionText}>
              We believe in honest self-assessment. No judgment, just data to help you improve.
            </Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Data</Text>
            <Text style={styles.sectionText}>
              Your data stays private. We don't sell it. You can delete everything anytime.
            </Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ads Fund the App</Text>
            <Text style={styles.sectionText}>
              NGINE is free. Minimal ads keep it running. We never show ads during check-ins or failures.
            </Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>AI Insights</Text>
            <Text style={styles.sectionText}>
              AI helps explain why resolutions fail. It's honest, non-judgmental, and actionable.
            </Text>
          </View>
        </View>
      ),
      button: 'I Understand',
    },
  ];

  const handleNext = async () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      // Complete onboarding
      await AsyncStorage.setItem('onboarding_complete', 'true');
      router.replace('/profile');
    }
  };

  const currentStep = steps[step];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {currentStep.emoji && (
          <Text style={styles.emoji}>{currentStep.emoji}</Text>
        )}
        <Text style={styles.title}>{currentStep.title}</Text>
        {currentStep.subtitle && (
          <Text style={styles.subtitle}>{currentStep.subtitle}</Text>
        )}
        {currentStep.description && (
          <Text style={styles.description}>{currentStep.description}</Text>
        )}
        {currentStep.content && (
          <View style={styles.customContent}>{currentStep.content}</View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {steps.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === step && styles.dotActive,
              ]}
            />
          ))}
        </View>
        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>{currentStep.button}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100%',
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    color: '#6b7280',
    marginBottom: 24,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  customContent: {
    width: '100%',
    marginTop: 32,
  },
  step: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  stepNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#3b82f6',
    marginRight: 16,
    width: 32,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e5e7eb',
  },
  dotActive: {
    backgroundColor: '#3b82f6',
    width: 24,
  },
  button: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
});

