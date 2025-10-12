import React, { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Platform } from 'react-native';
import { ChevronRight, LucideIcon } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { colors, spacing, typography } from '@/constants/theme';

interface ListItemProps {
  testID?: string;
  Icon: LucideIcon;
  text: string;
  subtitle?: string;
  onPress: () => void;
  iconColor?: string;
  textColor?: string;
  chevronColor?: string;
  subTextColor?: string;
}

function ListItemComponent({ testID, Icon, text, subtitle, onPress, iconColor = colors.primary, textColor = colors.text, chevronColor = colors.textSecondary, subTextColor = colors.textSecondary }: ListItemProps) {
  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    } else {
      console.log('Haptics not available on web');
    }
    onPress();
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.7} testID={testID}>
      <View style={styles.left}>
        <Icon size={22} color={iconColor} />
        <View style={styles.textContainer}>
          <Text style={[styles.text, { color: textColor }]}>{text}</Text>
          {subtitle ? <Text style={[styles.subtitle, { color: subTextColor }]}>{subtitle}</Text> : null}
        </View>
      </View>
      <ChevronRight size={20} color={chevronColor} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  textContainer: {
    flex: 1,
  },
  text: {
    ...typography.body,
    fontWeight: '600',
  },
  subtitle: {
    ...typography.caption,
  },
});

export default memo(ListItemComponent);
