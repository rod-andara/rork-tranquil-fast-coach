import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Lock } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useFastStore } from '@/store/fastStore';
import { BlurView } from 'expo-blur';

interface PremiumGateProps {
  children: React.ReactNode;
  feature?: string;
}

export default function PremiumGate({ children, feature }: PremiumGateProps) {
  const { isPremium, isDarkMode } = useFastStore();
  const router = useRouter();

  if (isPremium) {
    return <>{children}</>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.blurContainer}>
        {children}
        <BlurView
          intensity={20}
          tint={isDarkMode ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />
      </View>
      <View style={styles.overlay}>
        <Lock size={24} color="#7C3AED" />
        <Text style={[styles.text, isDarkMode && styles.textDark]}>
          {feature || 'Premium Feature'}
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/paywall')}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Unlock Premium</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'relative', overflow: 'hidden', borderRadius: 12 },
  blurContainer: { opacity: 0.5 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  text: { fontSize: 14, fontWeight: '600', color: '#374151' },
  textDark: { color: '#D1D5DB' },
  button: {
    backgroundColor: '#7C3AED',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 4,
  },
  buttonText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
});
