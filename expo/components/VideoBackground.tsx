import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';

interface VideoBackgroundProps {
  source: any; // Video source (require() result)
  children?: React.ReactNode;
  gradientColors?: readonly [string, string, ...string[]];
  gradientOpacity?: number;
}

const { width, height } = Dimensions.get('window');

export default function VideoBackground({
  source,
  children,
  gradientColors = ['rgba(124, 58, 237, 0.7)', 'rgba(31, 41, 55, 0.8)'] as const, // Purple to dark gray
  gradientOpacity = 1,
}: VideoBackgroundProps) {
  const videoRef = useRef<Video>(null);
  const [videoError, setVideoError] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);

  useEffect(() => {
    // Set up video playback when component mounts
    if (videoRef.current) {
      videoRef.current.setIsLoopingAsync(true);
      videoRef.current.setIsMutedAsync(true);
    }
  }, []);

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      if (!isVideoReady && status.durationMillis && status.durationMillis > 0) {
        setIsVideoReady(true);
      }
    } else if (status.error) {
      console.error('Video playback error:', status.error);
      setVideoError(true);
    }
  };

  if (videoError) {
    // Fallback to gradient background if video fails
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#1a1625', '#1F2937', '#7C3AED'] as const}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fallbackGradient}
        />
        {children}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Video Background */}
      <Video
        ref={videoRef}
        source={source}
        style={styles.video}
        resizeMode={ResizeMode.COVER}
        shouldPlay
        isLooping
        isMuted
        onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
        onError={(error) => {
          console.error('Video error:', error);
          setVideoError(true);
        }}
      />

      {/* Purple Gradient Overlay */}
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={[styles.overlay, { opacity: gradientOpacity }]}
      />

      {/* Content */}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: width,
    height: height,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  fallbackGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    position: 'relative',
    zIndex: 10,
  },
});
