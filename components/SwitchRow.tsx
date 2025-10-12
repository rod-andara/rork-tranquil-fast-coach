import React, { memo, useCallback } from 'react';
import { StyleSheet, Text, View, Switch, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { LucideIcon } from 'lucide-react-native';
import { colors, spacing, typography } from '@/constants/theme';

interface SwitchRowProps {
  testID?: string;
  Icon: LucideIcon;
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (val: boolean) => void;
  iconColor?: string;
  textColor?: string;
  subTextColor?: string;
}

function SwitchRowComponent({ testID, Icon, label, description, value, onValueChange, iconColor = colors.primary, textColor = colors.text, subTextColor = colors.textSecondary }: SwitchRowProps) {
  const handleChange = useCallback((v: boolean) => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    } else {
      console.log('Haptics not available on web');
    }
    onValueChange(v);
  }, [onValueChange]);

  return (
    <View style={styles.container} testID={testID}>
      <Icon size={22} color={iconColor} />
      <View style={styles.texts}>
        <Text style={[styles.label, { color: textColor }]}>{label}</Text>
        {description ? <Text style={[styles.desc, { color: subTextColor }]}>{description}</Text> : null}
      </View>
      <Switch
        testID={`${testID}-switch`}
        value={value}
        onValueChange={handleChange}
        trackColor={{ false: '#D1D5DB', true: colors.primaryLight }}
        thumbColor={value ? colors.primary : '#FFFFFF'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  texts: {
    flex: 1,
  },
  label: {
    ...typography.body,
    fontWeight: '600',
  },
  desc: {
    ...typography.caption,
  },
});

export default memo(SwitchRowComponent);
