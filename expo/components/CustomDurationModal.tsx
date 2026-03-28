import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Pressable,
  ScrollView,
  Platform,
} from 'react-native';
import { X, Check } from 'lucide-react-native';

interface CustomDurationModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (hours: number, minutes: number) => void;
  initialHours?: number;
  initialMinutes?: number;
}

export const CustomDurationModal: React.FC<CustomDurationModalProps> = ({
  visible,
  onClose,
  onSave,
  initialHours = 16,
  initialMinutes = 0,
}) => {
  const [selectedHours, setSelectedHours] = useState(initialHours);
  const [selectedMinutes, setSelectedMinutes] = useState(initialMinutes);
  const [error, setError] = useState<string | null>(null);

  // Hours: 4-48
  const hours = Array.from({ length: 45 }, (_, i) => i + 4);
  // Minutes: 0, 15, 30, 45
  const minutes = [0, 15, 30, 45];

  // Reset state when modal opens
  useEffect(() => {
    if (visible) {
      setSelectedHours(initialHours);
      setSelectedMinutes(initialMinutes);
      setError(null);
    }
  }, [visible, initialHours, initialMinutes]);

  const handleSave = () => {
    // Validation: ensure duration is at least 4 hours
    const totalHours = selectedHours + selectedMinutes / 60;
    console.log(`[CustomDurationModal] handleSave: ${selectedHours}h ${selectedMinutes}m = ${totalHours} hours`);

    if (totalHours < 4) {
      setError('Fasting duration must be at least 4 hours');
      return;
    }

    // Validation: ensure duration is at most 48 hours
    if (totalHours > 48) {
      setError('Fasting duration cannot exceed 48 hours');
      return;
    }

    setError(null);
    console.log(`[CustomDurationModal] Calling onSave with hours=${selectedHours}, minutes=${selectedMinutes}`);
    onSave(selectedHours, selectedMinutes);
    onClose();
  };

  const formatDuration = (hours: number, minutes: number) => {
    if (minutes === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${minutes}m`;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Backdrop */}
      <Pressable
        className="flex-1 bg-black/50"
        onPress={onClose}
        accessibilityLabel="Close custom duration modal"
        accessibilityRole="button"
      >
        {/* Modal Content */}
        <View className="flex-1 justify-center items-center px-6">
          <Pressable
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md"
            onPress={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-2xl font-bold text-gray-900 dark:text-white">
                Custom Duration
              </Text>
              <TouchableOpacity
                onPress={onClose}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-700"
                style={{ minHeight: 44, minWidth: 44 }}
                accessibilityLabel="Close modal"
                accessibilityRole="button"
              >
                <X size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Current Selection Display */}
            <View className="bg-brand-50 dark:bg-brand-900/30 rounded-xl p-4 mb-6">
              <Text className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Selected Duration
              </Text>
              <Text className="text-3xl font-bold text-brand-700 dark:text-brand-200">
                {formatDuration(selectedHours, selectedMinutes)}
              </Text>
            </View>

            {/* Pickers */}
            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Select Duration
              </Text>

              <View className="flex-row gap-4">
                {/* Hours Picker */}
                <View className="flex-1">
                  <Text className="text-xs text-gray-600 dark:text-gray-400 mb-2 text-center">
                    Hours
                  </Text>
                  <View className="border border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden">
                    <ScrollView
                      className="h-40"
                      showsVerticalScrollIndicator={true}
                      accessibilityLabel="Select hours"
                      accessibilityRole="adjustable"
                    >
                      {hours.map((hour) => (
                        <TouchableOpacity
                          key={hour}
                          onPress={() => setSelectedHours(hour)}
                          className={`py-3 px-4 ${
                            selectedHours === hour
                              ? 'bg-brand-600'
                              : 'bg-white dark:bg-gray-800'
                          }`}
                          style={{ minHeight: 44 }}
                          accessibilityLabel={`${hour} hours`}
                          accessibilityRole="button"
                          accessibilityState={{ selected: selectedHours === hour }}
                        >
                          <Text
                            className={`text-center font-semibold ${
                              selectedHours === hour
                                ? 'text-white'
                                : 'text-gray-900 dark:text-gray-100'
                            }`}
                          >
                            {hour}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                </View>

                {/* Minutes Picker */}
                <View className="flex-1">
                  <Text className="text-xs text-gray-600 dark:text-gray-400 mb-2 text-center">
                    Minutes
                  </Text>
                  <View className="border border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden">
                    <ScrollView
                      className="h-40"
                      showsVerticalScrollIndicator={false}
                      accessibilityLabel="Select minutes"
                      accessibilityRole="adjustable"
                    >
                      {minutes.map((minute) => (
                        <TouchableOpacity
                          key={minute}
                          onPress={() => setSelectedMinutes(minute)}
                          className={`py-3 px-4 ${
                            selectedMinutes === minute
                              ? 'bg-brand-600'
                              : 'bg-white dark:bg-gray-800'
                          }`}
                          style={{ minHeight: 44 }}
                          accessibilityLabel={`${minute} minutes`}
                          accessibilityRole="button"
                          accessibilityState={{ selected: selectedMinutes === minute }}
                        >
                          <Text
                            className={`text-center font-semibold ${
                              selectedMinutes === minute
                                ? 'text-white'
                                : 'text-gray-900 dark:text-gray-100'
                            }`}
                          >
                            {minute}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                </View>
              </View>
            </View>

            {/* Error Message */}
            {error && (
              <View className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 rounded-lg">
                <Text className="text-sm text-red-600 dark:text-red-400 text-center">
                  {error}
                </Text>
              </View>
            )}

            {/* Action Buttons */}
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={onClose}
                className="flex-1 py-3 px-4 rounded-xl bg-gray-100 dark:bg-gray-700"
                style={{ minHeight: 44 }}
                accessibilityLabel="Cancel"
                accessibilityRole="button"
              >
                <Text className="text-center text-gray-700 dark:text-gray-300 font-semibold">
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSave}
                className="flex-1 py-3 px-4 rounded-xl bg-brand-600 flex-row items-center justify-center gap-2"
                style={{ minHeight: 44 }}
                accessibilityLabel="Save custom duration"
                accessibilityRole="button"
              >
                <Check size={18} color="#FFFFFF" />
                <Text className="text-center text-white font-semibold">
                  Save
                </Text>
              </TouchableOpacity>
            </View>

            {/* Helper Text */}
            <Text className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
              Choose a fasting duration between 4 and 48 hours
            </Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
};
