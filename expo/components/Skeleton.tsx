import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Platform, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface SkeletonProps {
  width: number | string;
  height: number | string;
  borderRadius?: number;
}

export default function Skeleton({ width, height, borderRadius = 8 }: SkeletonProps) {
  const translateX = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(translateX, {
        toValue: 300,
        duration: 1200,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: Platform.OS !== 'web',
      })
    );
    loop.start();
    return () => loop.stop();
  }, [translateX]);

  return (
    <View style={[styles.container, { width: width as any, height: height as any, borderRadius }]}>
      <Animated.View
        style={[
          styles.shimmer,
          {
            transform: [{ translateX }],
          },
        ]}
      >
        <LinearGradient
          colors={["rgba(0,0,0,0)", "rgba(255,255,255,0.45)", "rgba(0,0,0,0)"] as const}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
  },
  shimmer: {
    ...StyleSheet.absoluteFillObject,
  },
});
