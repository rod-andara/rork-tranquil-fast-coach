import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { X, Save, Scale } from 'lucide-react-native';
import { useFastStore } from '@/store/fastStore';
import { useWeightStore, WeightEntry } from '@/store/weightStore';
import { saveWeightToHealth, isHealthKitReady } from '@/utils/appleHealth';

interface WeightEntryModalProps {
  visible: boolean;
  onClose: () => void;
  editEntry?: WeightEntry;
}

export default function WeightEntryModal({
  visible,
  onClose,
  editEntry,
}: WeightEntryModalProps) {
  const { isDarkMode } = useFastStore();
  const { addEntry, updateEntry, unit, isHealthConnected } = useWeightStore();

  const [weight, setWeight] = useState('');
  const [note, setNote] = useState('');
  const [syncToHealth, setSyncToHealth] = useState(isHealthConnected);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pre-fill form when editing
  useEffect(() => {
    if (editEntry) {
      setWeight(editEntry.weight.toString());
      setNote(editEntry.note || '');
      setSyncToHealth(false); // Don't sync when editing
    } else {
      setWeight('');
      setNote('');
      setSyncToHealth(isHealthConnected);
    }
    setError(null);
  }, [editEntry, visible, isHealthConnected]);

  const handleSave = async () => {
    // Validate weight - normalize comma to dot for locales that use comma as decimal separator
    const normalizedWeight = (weight ?? '').replace(',', '.').trim();
    const weightNum = parseFloat(normalizedWeight);

    if (!Number.isFinite(weightNum) || weightNum <= 0) {
      setError('Please enter a valid weight');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      if (editEntry) {
        // Update existing entry
        updateEntry(editEntry.id, {
          weight: weightNum,
          note: (note ?? '').trim() || undefined,
        });
      } else {
        // Add new entry
        addEntry({
          weight: weightNum,
          date: Date.now(),
          unit: unit,
          note: (note ?? '').trim() || undefined,
          source: 'manual',
        });

        // Wait for Apple Health sync to complete (only if ready and enabled)
        const canSync = syncToHealth && isHealthKitReady();
        if (canSync) {
          try {
            await saveWeightToHealth(weightNum, unit);
            console.log('[SUCCESS] Weight saved to Apple Health');
          } catch (healthError) {
            console.warn('[WARN] Health sync failed:', healthError instanceof Error ? healthError.message : String(healthError));
            // Continue - don't block on Health sync failure
          }
        } else if (syncToHealth && !isHealthKitReady()) {
          console.warn('[WARN] Health sync requested but HealthKit is not ready - saving locally only');
        }
      }

      // ✅ CORRECT: Set isSaving to false BEFORE closing modal
      // This ensures all state updates complete while component is still mounted
      setIsSaving(false);
      onClose();
    } catch (err) {
      console.error('[ERROR] Failed to save weight:', err);
      setError('Failed to save weight. Please try again.');
      setIsSaving(false);
    }
  };

  const handleWeightChange = (text: string) => {
    // Allow only numbers and one decimal point
    const cleaned = text.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      // More than one decimal point
      return;
    }
    setWeight(cleaned);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View
          className="flex-1 justify-end"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}
        >
          <View
            className={`rounded-t-3xl p-6 ${
              isDarkMode ? 'bg-neutral-900' : 'bg-white'
            }`}
            style={{
              minHeight: 400,
              maxHeight: '80%',
            }}
          >
            {/* Header */}
            <View className="flex-row justify-between items-center mb-6">
              <View className="flex-row items-center gap-3">
                <View
                  className="w-10 h-10 rounded-full items-center justify-center"
                  style={{ backgroundColor: '#7C3AED20' }}
                >
                  <Scale size={20} color="#7C3AED" />
                </View>
                <Text
                  className={`text-xl font-bold ${
                    isDarkMode ? 'text-neutral-50' : 'text-neutral-900'
                  }`}
                >
                  {editEntry ? 'Edit Weight' : 'Add Weight'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
                className="w-10 h-10 items-center justify-center"
                activeOpacity={0.7}
              >
                <X
                  size={24}
                  color={isDarkMode ? '#F3F4F6' : '#111827'}
                />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Weight Input */}
              <View className="mb-6">
                <Text
                  className={`text-sm font-semibold mb-2 ${
                    isDarkMode ? 'text-neutral-300' : 'text-neutral-700'
                  }`}
                >
                  Weight ({unit})
                </Text>
                <View
                  className={`flex-row items-center rounded-xl p-4 border ${
                    isDarkMode
                      ? 'bg-neutral-800 border-neutral-700'
                      : 'bg-neutral-50 border-neutral-200'
                  }`}
                >
                  <TextInput
                    value={weight}
                    onChangeText={handleWeightChange}
                    placeholder={`Enter weight in ${unit}`}
                    placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
                    keyboardType="decimal-pad"
                    className={`flex-1 text-lg ${
                      isDarkMode ? 'text-neutral-50' : 'text-neutral-900'
                    }`}
                    autoFocus={true}
                  />
                  <Text
                    className={`text-lg font-semibold ${
                      isDarkMode ? 'text-neutral-400' : 'text-neutral-500'
                    }`}
                  >
                    {unit}
                  </Text>
                </View>
              </View>

              {/* Note Input */}
              <View className="mb-6">
                <Text
                  className={`text-sm font-semibold mb-2 ${
                    isDarkMode ? 'text-neutral-300' : 'text-neutral-700'
                  }`}
                >
                  Note (Optional)
                </Text>
                <TextInput
                  value={note}
                  onChangeText={setNote}
                  placeholder="Add a note about your weight"
                  placeholderTextColor={isDarkMode ? '#9CA3AF' : '#6B7280'}
                  multiline
                  numberOfLines={3}
                  className={`rounded-xl p-4 border ${
                    isDarkMode
                      ? 'bg-neutral-800 border-neutral-700 text-neutral-50'
                      : 'bg-neutral-50 border-neutral-200 text-neutral-900'
                  }`}
                  style={{ textAlignVertical: 'top', minHeight: 80 }}
                />
              </View>

              {/* Sync to Apple Health Toggle */}
              {!editEntry && isHealthConnected && isHealthKitReady() && (
                <TouchableOpacity
                  onPress={() => setSyncToHealth(!syncToHealth)}
                  className={`flex-row items-center justify-between p-4 rounded-xl mb-6 ${
                    isDarkMode ? 'bg-neutral-800' : 'bg-neutral-50'
                  }`}
                  activeOpacity={0.7}
                >
                  <Text
                    className={`text-sm font-medium ${
                      isDarkMode ? 'text-neutral-300' : 'text-neutral-700'
                    }`}
                  >
                    Sync to Apple Health
                  </Text>
                  <View
                    className={`w-12 h-7 rounded-full p-1 ${
                      syncToHealth ? 'bg-primary-600' : 'bg-neutral-300'
                    }`}
                  >
                    <View
                      className={`w-5 h-5 rounded-full bg-white transition-all ${
                        syncToHealth ? 'ml-auto' : 'ml-0'
                      }`}
                    />
                  </View>
                </TouchableOpacity>
              )}

              {/* Error Message */}
              {error && (
                <View className="bg-error-500/10 border border-error-500 rounded-xl p-4 mb-6">
                  <Text className="text-error-500 text-sm font-medium">
                    {error}
                  </Text>
                </View>
              )}

              {/* Save Button */}
              <TouchableOpacity
                onPress={handleSave}
                disabled={isSaving}
                className={`flex-row items-center justify-center gap-2 rounded-xl p-4 ${
                  isSaving ? 'bg-primary-400' : 'bg-primary-600'
                }`}
                activeOpacity={0.8}
              >
                {isSaving ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Save size={20} color="#FFFFFF" />
                    <Text className="text-white text-base font-bold">
                      {editEntry ? 'Update Weight' : 'Save Weight'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
