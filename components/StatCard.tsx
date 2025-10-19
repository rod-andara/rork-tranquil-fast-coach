import React, { memo } from 'react';
import { View, Text } from 'react-native';
import { LucideIcon } from 'lucide-react-native';

interface StatCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  iconColor?: string;
  iconBgColor?: string;
}

function StatCardComponent({
  icon: Icon,
  value,
  label,
  iconColor = '#7C3AED',
  iconBgColor = '#F3F4F6',
}: StatCardProps) {
  return (
    <View className="bg-neutral-100 dark:bg-neutral-200 p-4 rounded-lg items-center flex-1 min-w-[100px] shadow-sm">
      <View
        className="w-12 h-12 rounded-md justify-center items-center mb-2"
        style={{ backgroundColor: iconBgColor }}
      >
        <Icon size={24} color={iconColor} strokeWidth={2} />
      </View>
      <Text className="text-xl font-bold text-neutral-900 dark:text-neutral-900 mb-1">
        {value}
      </Text>
      <Text className="text-sm text-neutral-500 dark:text-neutral-500 text-center">
        {label}
      </Text>
    </View>
  );
}

export default memo(StatCardComponent);
