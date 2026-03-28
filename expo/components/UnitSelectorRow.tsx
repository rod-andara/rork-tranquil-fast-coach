import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { useFastStore } from '@/store/fastStore';

interface UnitSelectorRowProps {
  Icon: LucideIcon;
  label: string;
  description: string;
  value: 'lbs' | 'kg';
  onValueChange: (value: 'lbs' | 'kg') => void;
  iconColor?: string;
  textColor?: string;
  subTextColor?: string;
  testID?: string;
}

export default function UnitSelectorRow({
  Icon,
  label,
  description,
  value,
  onValueChange,
  iconColor = '#7C3AED',
  textColor = '#111827',
  subTextColor = '#6B7280',
  testID,
}: UnitSelectorRowProps) {
  const { isDarkMode } = useFastStore();

  return (
    <View className="flex-row items-center" testID={testID}>
      <View
        className="w-10 h-10 rounded-lg items-center justify-center mr-3"
        style={{ backgroundColor: `${iconColor}15` }}
      >
        <Icon size={20} color={iconColor} />
      </View>
      <View className="flex-1">
        <Text
          className="text-base font-semibold mb-0.5"
          style={{ color: textColor }}
        >
          {label}
        </Text>
        <Text
          className="text-sm"
          style={{ color: subTextColor }}
        >
          {description}
        </Text>
      </View>
      <View className="flex-row gap-2">
        <TouchableOpacity
          onPress={() => onValueChange('lbs')}
          className={`px-4 py-2 rounded-lg border ${
            value === 'lbs'
              ? 'bg-primary-600 border-primary-600'
              : isDarkMode
              ? 'bg-transparent border-neutral-600'
              : 'bg-transparent border-neutral-300'
          }`}
          activeOpacity={0.7}
        >
          <Text
            className={`text-sm font-semibold ${
              value === 'lbs'
                ? 'text-white'
                : isDarkMode
                ? 'text-neutral-400'
                : 'text-neutral-600'
            }`}
          >
            lbs
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onValueChange('kg')}
          className={`px-4 py-2 rounded-lg border ${
            value === 'kg'
              ? 'bg-primary-600 border-primary-600'
              : isDarkMode
              ? 'bg-transparent border-neutral-600'
              : 'bg-transparent border-neutral-300'
          }`}
          activeOpacity={0.7}
        >
          <Text
            className={`text-sm font-semibold ${
              value === 'kg'
                ? 'text-white'
                : isDarkMode
                ? 'text-neutral-400'
                : 'text-neutral-600'
            }`}
          >
            kg
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
