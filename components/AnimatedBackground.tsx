import React, { useEffect, useRef } from 'react'
import { View, StyleSheet, Animated, Dimensions } from 'react-native'

const { width, height } = Dimensions.get('window')

export const AnimatedBackground: React.FC = () => {
  const gradient1 = useRef(new Animated.Value(0)).current
  const gradient2 = useRef(new Animated.Value(0)).current
  const particles = useRef(
    Array.from({ length: 8 }, () => ({
      x: useRef(new Animated.Value(Math.random() * width)).current,
      y: useRef(new Animated.Value(Math.random() * height)).current,
      opacity: useRef(new Animated.Value(0.1 + Math.random() * 0.1)).current,
    }))
  ).current

  useEffect(() => {
    // Animate gradient colors
    const gradientAnimation = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(gradient1, {
            toValue: 1,
            duration: 8000,
            useNativeDriver: false,
          }),
          Animated.timing(gradient1, {
            toValue: 0,
            duration: 8000,
            useNativeDriver: false,
          }),
        ]),
        Animated.sequence([
          Animated.timing(gradient2, {
            toValue: 1,
            duration: 10000,
            useNativeDriver: false,
          }),
          Animated.timing(gradient2, {
            toValue: 0,
            duration: 10000,
            useNativeDriver: false,
          }),
        ]),
      ])
    )
    gradientAnimation.start()

    // Animate floating particles
    const particleAnimations = particles.map((particle, index) => {
      const moveX = Animated.loop(
        Animated.sequence([
          Animated.timing(particle.x, {
            toValue: Math.random() * width,
            duration: 15000 + index * 2000,
            useNativeDriver: true,
          }),
          Animated.timing(particle.x, {
            toValue: Math.random() * width,
            duration: 15000 + index * 2000,
            useNativeDriver: true,
          }),
        ])
      )

      const moveY = Animated.loop(
        Animated.sequence([
          Animated.timing(particle.y, {
            toValue: Math.random() * height,
            duration: 12000 + index * 1500,
            useNativeDriver: true,
          }),
          Animated.timing(particle.y, {
            toValue: Math.random() * height,
            duration: 12000 + index * 1500,
            useNativeDriver: true,
          }),
        ])
      )

      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(particle.opacity, {
            toValue: 0.2,
            duration: 3000 + index * 500,
            useNativeDriver: true,
          }),
          Animated.timing(particle.opacity, {
            toValue: 0.05,
            duration: 3000 + index * 500,
            useNativeDriver: true,
          }),
        ])
      )

      return Animated.parallel([moveX, moveY, pulse])
    })

    particleAnimations.forEach(anim => anim.start())

    return () => {
      gradientAnimation.stop()
      particleAnimations.forEach(anim => anim.stop())
    }
  }, [])

  const gradientColor1 = gradient1.interpolate({
    inputRange: [0, 1],
    outputRange: ['#f8fafc', '#f1f5f9'],
  })

  const gradientColor2 = gradient2.interpolate({
    inputRange: [0, 1],
    outputRange: ['#f8fafc', '#eef2ff'],
  })

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Dark background with subtle gradient */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: '#0E0F13' }]} />
      
      {/* Subtle animated gradient overlay - more refined */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: gradientColor1,
            opacity: 0.15, // Reduced opacity for subtlety
          },
        ]}
      />
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: gradientColor2,
            opacity: 0.1, // Reduced opacity
          },
        ]}
      />

      {/* Floating particles */}
      {particles.map((particle, index) => (
        <Animated.View
          key={index}
          style={[
            styles.particle,
            {
              transform: [
                { translateX: particle.x },
                { translateY: particle.y },
              ],
              opacity: particle.opacity,
            },
          ]}
        />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  particle: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#6C6FF5', // Match primary color
    opacity: 0.08, // More subtle particles
    // Subtle blur effect would be nice but requires extra library
  },
})

