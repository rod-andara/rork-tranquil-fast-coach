import React from 'react';
import { StyleSheet, Text } from 'react-native';

/** Credit for the owner's Grok-generated onboarding backgrounds (SPEC-31). */
export default function MediaAttribution() {
  return <Text style={styles.credit}>Background visuals · Created with Grok</Text>;
}

const styles = StyleSheet.create({
  credit: {
    color: '#FFFFFF',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 8,
  },
});
