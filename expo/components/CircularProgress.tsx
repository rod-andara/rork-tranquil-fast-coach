import React, { ReactNode, memo } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface CircularProgressProps {
  size: number;
  strokeWidth: number;
  progress: number;
  color: string;
  backgroundColor: string;
  isLoading?: boolean;
  isRunning?: boolean;
  children?: ReactNode;
}

function CircularProgressComponent({
  size,
  strokeWidth,
  progress,
  color,
  backgroundColor,
  isLoading = false,
  isRunning = false,
  children,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const center = size / 2;

  const dashLength = (progress / 100) * circumference;
  const gapLength = circumference - dashLength;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={styles.svg}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${dashLength} ${gapLength}`}
          strokeDashoffset={circumference * 0.25}
          strokeLinecap="round"
        />
      </Svg>
      {children && <View style={styles.content}>{children}</View>}
    </View>
  );
}

export default memo(CircularProgressComponent);

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  svg: {
    position: 'absolute',
  },
  content: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
});