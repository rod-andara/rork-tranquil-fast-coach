import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { X, Target, TrendingDown, TrendingUp } from 'lucide-react-native';
import { useFastStore } from '@/store/fastStore';
import { WeightGoal } from '@/store/weightStore';

interface WeightGoalModalProps {
  visible: boolean;
  onClose: () => void;
  currentGoal: WeightGoal | null;
  currentWeight: number | null;
  unit: 'lbs' | 'kg';
}

export default function WeightGoalModal({
  visible,
  onClose,
  currentGoal,
  currentWeight,
  unit,
}: WeightGoalModalProps) {
  const { isDarkMode } = useFastStore();
  const [targetWeight, setTargetWeight] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Initialize with current goal or empty
  useEffect(() => {
    if (visible) {
      if (currentGoal) {
        setTargetWeight(currentGoal.targetWeight.toString());
      } else {
        setTargetWeight('');
      }
      setError(null);
    }
  }, [visible, currentGoal]);

  const handleSave = () => {
    // Validation
    const target = parseFloat(targetWeight);

    if (!targetWeight || isNaN(target)) {
      setError('Please enter a valid weight');
      return;
    }

    if (currentWeight === null) {
      setError('Please add your current weight first');
      return;
    }

    const difference = Math.abs(target - currentWeight);
    const minDifference = unit === 'lbs' ? 2 : 1; // 2 lbs or 1 kg

    if (difference < minDifference) {
      setError(`Goal must differ from current weight by at least ${minDifference} ${unit}`);
      return;
    }

    // Save goal
    const newGoal: WeightGoal = {
      targetWeight: target,
      unit,
      startDate: Date.now(),
    };

    // Import setGoal from weightStore
    const { setGoal } = require('@/store/weightStore').useWeightStore.getState();
    setGoal(newGoal);

    onClose();
  };

  const handleDelete = () => {
    const { setGoal } = require('@/store/weightStore').useWeightStore.getState();
    setGoal(null);
    onClose();
  };

  const difference = currentWeight !== null && targetWeight
    ? parseFloat(targetWeight) - currentWeight
    : null;

  const isLosingWeight = difference !== null && difference < 0;
  const isGainingWeight = difference !== null && difference > 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 16,
          }}
          onPress={onClose}
        >
          <Pressable
            style={{
              width: '100%',
              maxWidth: 400,
              backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
              borderRadius: 24,
              padding: 24,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 16,
              elevation: 8,
            }}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    backgroundColor: isDarkMode ? '#7C3AED20' : '#F5F3FF',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Target size={24} color="#7C3AED" />
                </View>
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: '700',
                    color: isDarkMode ? '#F9FAFB' : '#111827',
                  }}
                >
                  {currentGoal ? 'Edit Goal' : 'Set Goal'}
                </Text>
              </View>

              <TouchableOpacity
                onPress={onClose}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: isDarkMode ? '#374151' : '#F3F4F6',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                accessibilityLabel="Close modal"
                accessibilityRole="button"
              >
                <X size={20} color={isDarkMode ? '#D1D5DB' : '#6B7280'} />
              </TouchableOpacity>
            </View>

            {/* Current Weight */}
            {currentWeight !== null && (
              <View
                style={{
                  backgroundColor: isDarkMode ? '#374151' : '#F9FAFB',
                  padding: 16,
                  borderRadius: 12,
                  marginBottom: 16,
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '500',
                    color: isDarkMode ? '#9CA3AF' : '#6B7280',
                    marginBottom: 4,
                  }}
                >
                  Current Weight
                </Text>
                <Text
                  style={{
                    fontSize: 28,
                    fontWeight: '700',
                    color: isDarkMode ? '#F9FAFB' : '#111827',
                  }}
                >
                  {currentWeight.toFixed(1)} {unit}
                </Text>
              </View>
            )}

            {/* Target Weight Input */}
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: isDarkMode ? '#D1D5DB' : '#374151',
                  marginBottom: 8,
                }}
              >
                Target Weight
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: isDarkMode ? '#374151' : '#F9FAFB',
                  borderRadius: 12,
                  borderWidth: 2,
                  borderColor: error
                    ? '#EF4444'
                    : isDarkMode
                    ? '#4B5563'
                    : '#E5E7EB',
                  paddingHorizontal: 16,
                  height: 56,
                }}
              >
                <TextInput
                  value={targetWeight}
                  onChangeText={(text) => {
                    setTargetWeight(text);
                    setError(null);
                  }}
                  placeholder={`Enter target weight`}
                  placeholderTextColor={isDarkMode ? '#6B7280' : '#9CA3AF'}
                  keyboardType="decimal-pad"
                  style={{
                    flex: 1,
                    fontSize: 18,
                    fontWeight: '600',
                    color: isDarkMode ? '#F9FAFB' : '#111827',
                  }}
                  accessibilityLabel="Target weight input"
                  accessibilityHint={`Enter your target weight in ${unit}`}
                />
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: '600',
                    color: isDarkMode ? '#9CA3AF' : '#6B7280',
                    marginLeft: 8,
                  }}
                >
                  {unit}
                </Text>
              </View>

              {error && (
                <Text
                  style={{
                    fontSize: 14,
                    color: '#EF4444',
                    marginTop: 8,
                  }}
                >
                  {error}
                </Text>
              )}
            </View>

            {/* Difference Display */}
            {difference !== null && !error && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: isLosingWeight
                    ? isDarkMode ? '#10B98120' : '#ECFDF5'
                    : isDarkMode ? '#7C3AED20' : '#F5F3FF',
                  padding: 16,
                  borderRadius: 12,
                  marginBottom: 24,
                  gap: 12,
                }}
              >
                {isLosingWeight ? (
                  <TrendingDown size={24} color="#10B981" />
                ) : (
                  <TrendingUp size={24} color="#7C3AED" />
                )}
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '500',
                      color: isDarkMode ? '#9CA3AF' : '#6B7280',
                      marginBottom: 2,
                    }}
                  >
                    {isLosingWeight ? 'Weight to lose' : 'Weight to gain'}
                  </Text>
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: '700',
                      color: isLosingWeight ? '#10B981' : '#7C3AED',
                    }}
                  >
                    {Math.abs(difference).toFixed(1)} {unit}
                  </Text>
                </View>
              </View>
            )}

            {/* Action Buttons */}
            <View style={{ gap: 12 }}>
              {/* Save Button */}
              <TouchableOpacity
                onPress={handleSave}
                style={{
                  backgroundColor: '#7C3AED',
                  paddingVertical: 16,
                  borderRadius: 12,
                  alignItems: 'center',
                  minHeight: 56,
                  justifyContent: 'center',
                }}
                activeOpacity={0.8}
                accessibilityLabel="Save goal"
                accessibilityRole="button"
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '700',
                    color: '#FFFFFF',
                  }}
                >
                  Save Goal
                </Text>
              </TouchableOpacity>

              {/* Delete Goal Button (only if goal exists) */}
              {currentGoal && (
                <TouchableOpacity
                  onPress={handleDelete}
                  style={{
                    backgroundColor: isDarkMode ? '#37415120' : '#F3F4F6',
                    paddingVertical: 16,
                    borderRadius: 12,
                    alignItems: 'center',
                    minHeight: 56,
                    justifyContent: 'center',
                  }}
                  activeOpacity={0.8}
                  accessibilityLabel="Delete goal"
                  accessibilityRole="button"
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: '600',
                      color: '#EF4444',
                    }}
                  >
                    Delete Goal
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}
