import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { Heart, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react-native';
import { useFastStore } from '@/store/fastStore';
import { useWeightStore } from '@/store/weightStore';
import {
  initHealthKit,
  syncWeightData,
  isHealthKitAvailable,
} from '@/utils/appleHealth';

export default function AppleHealthCard() {
  const { isDarkMode } = useFastStore();
  const { isHealthConnected, setHealthConnected, lastHealthSync } = useWeightStore();

  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncSuccess, setSyncSuccess] = useState(false);

  // Don't show on Android or web
  if (Platform.OS !== 'ios' || !isHealthKitAvailable()) {
    return null;
  }

  const handleConnect = async () => {
    setIsConnecting(true);
    setSyncError(null);

    try {
      const success = await initHealthKit();
      if (success) {
        setHealthConnected(true);
        // Auto-sync after connecting
        handleSync();
      } else {
        setSyncError('Failed to connect to Apple Health');
      }
    } catch (error) {
      console.error('[ERROR] Failed to connect to Health:', error);
      setSyncError('Failed to connect to Apple Health');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncError(null);
    setSyncSuccess(false);

    try {
      const result = await syncWeightData('both');
      setSyncSuccess(true);

      // Hide success message after 3 seconds
      setTimeout(() => {
        setSyncSuccess(false);
      }, 3000);

      console.log(`[SUCCESS] Synced ${result.imported} entries from Health, ${result.exported} entries to Health`);
    } catch (error) {
      console.error('[ERROR] Failed to sync with Health:', error);
      setSyncError('Failed to sync with Apple Health');
    } finally {
      setIsSyncing(false);
    }
  };

  const formatLastSync = () => {
    if (!lastHealthSync) return 'Never';

    const now = Date.now();
    const diff = now - lastHealthSync;

    // Less than 1 minute
    if (diff < 60000) {
      return 'Just now';
    }

    // Less than 1 hour
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    }

    // Less than 1 day
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    }

    // Days ago
    const days = Math.floor(diff / 86400000);
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  };

  return (
    <View
      className={`rounded-2xl p-4 ${
        isDarkMode ? 'bg-neutral-800 border border-neutral-700' : 'bg-white border border-neutral-200'
      }`}
    >
      {/* Header */}
      <View className="flex-row items-center gap-3 mb-4">
        <View
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{ backgroundColor: '#EF444420' }}
        >
          <Heart size={20} color="#EF4444" fill="#EF4444" />
        </View>
        <View className="flex-1">
          <Text
            className={`text-base font-bold ${
              isDarkMode ? 'text-neutral-100' : 'text-neutral-900'
            }`}
          >
            Apple Health
          </Text>
          {isHealthConnected && (
            <View className="flex-row items-center gap-1 mt-1">
              <CheckCircle size={14} color="#10B981" />
              <Text className="text-xs text-success-500">Connected</Text>
            </View>
          )}
        </View>
      </View>

      {/* Description */}
      <Text
        className={`text-sm mb-4 ${
          isDarkMode ? 'text-neutral-400' : 'text-neutral-600'
        }`}
      >
        {isHealthConnected
          ? 'Sync your weight data bidirectionally with Apple Health'
          : 'Connect to automatically import weight from Apple Health and smart scales'}
      </Text>

      {/* Last Sync Info */}
      {isHealthConnected && (
        <View
          className={`rounded-lg p-3 mb-4 ${
            isDarkMode ? 'bg-neutral-900' : 'bg-neutral-50'
          }`}
        >
          <Text
            className={`text-xs font-medium ${
              isDarkMode ? 'text-neutral-400' : 'text-neutral-500'
            }`}
          >
            Last synced: {formatLastSync()}
          </Text>
        </View>
      )}

      {/* Success Message */}
      {syncSuccess && (
        <View className="bg-success-500/10 border border-success-500 rounded-lg p-3 mb-4 flex-row items-center gap-2">
          <CheckCircle size={16} color="#10B981" />
          <Text className="text-success-500 text-sm font-medium flex-1">
            Successfully synced with Apple Health
          </Text>
        </View>
      )}

      {/* Error Message */}
      {syncError && (
        <View className="bg-error-500/10 border border-error-500 rounded-lg p-3 mb-4 flex-row items-center gap-2">
          <AlertCircle size={16} color="#EF4444" />
          <Text className="text-error-500 text-sm font-medium flex-1">
            {syncError}
          </Text>
        </View>
      )}

      {/* Action Buttons */}
      {isHealthConnected ? (
        <TouchableOpacity
          onPress={handleSync}
          disabled={isSyncing}
          className={`flex-row items-center justify-center gap-2 rounded-xl p-3 ${
            isSyncing ? 'bg-neutral-400' : 'bg-primary-600'
          }`}
          activeOpacity={0.8}
        >
          {isSyncing ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <RefreshCw size={18} color="#FFFFFF" />
              <Text className="text-white text-sm font-bold">
                Sync Now
              </Text>
            </>
          )}
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={handleConnect}
          disabled={isConnecting}
          className={`flex-row items-center justify-center gap-2 rounded-xl p-3 ${
            isConnecting ? 'bg-neutral-400' : 'bg-error-500'
          }`}
          activeOpacity={0.8}
        >
          {isConnecting ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Heart size={18} color="#FFFFFF" fill="#FFFFFF" />
              <Text className="text-white text-sm font-bold">
                Connect Apple Health
              </Text>
            </>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}
