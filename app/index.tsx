// Root index file - handles onboarding navigation
import { useEffect } from 'react'
import { useRouter, useSegments } from 'expo-router'
import { hasCompletedOnboarding } from './onboarding'

export default function Index() {
  const router = useRouter()
  const segments = useSegments()

  useEffect(() => {
    const checkOnboardingAndNavigate = async () => {
      try {
        const completed = await hasCompletedOnboarding()
        
        if (completed) {
          // Onboarding complete - go to main app
          router.replace('/(tabs)')
        } else {
          // First time - show onboarding
          router.replace('/onboarding')
        }
      } catch (error) {
        console.error('Error checking onboarding:', error)
        // On error, show onboarding
        router.replace('/onboarding')
      }
    }

    checkOnboardingAndNavigate()
  }, [])

  return null
}
