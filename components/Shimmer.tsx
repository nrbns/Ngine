import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';

interface ShimmerProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: ViewStyle;
  testID?: string;
}

export default function Shimmer({ width = '100%', height = 120, borderRadius = 8, style, testID = 'shimmer' }: ShimmerProps) {
  const translateX = useRef(new Animated.Value(-1)).current;

  useEffect(() => {
    // Avoid starting the continuous animation during Jest tests because React Native's
    // Animated timers can schedule callbacks after Jest tears down the environment,
    // causing noisy warnings and flaky tests.
    if (typeof process !== 'undefined' && process.env && process.env.JEST_WORKER_ID) {
      return;
    }

    const loop = Animated.loop(
      Animated.timing(translateX, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [translateX]);

  const translate = translateX.interpolate({
    inputRange: [-1, 1],
    outputRange: [-200, 200],
  });

  const boxStyle: ViewStyle = { width, height, borderRadius };

  return (
    <View testID={testID} style={[styles.container, style, boxStyle]}>
      <Animated.View
        style={[
          styles.shimmer,
          {
            transform: [{ translateX: translate }],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#263238',
    overflow: 'hidden',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: -50,
    width: 100,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
});
