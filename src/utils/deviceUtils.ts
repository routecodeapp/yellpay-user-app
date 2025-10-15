import { Platform } from 'react-native';

export interface DeviceInfo {
  deviceType: 'android' | 'ios';
  deviceId: string;
}

export const getDeviceInfo = async (): Promise<DeviceInfo> => {
  try {
    const deviceType = Platform.OS === 'ios' ? 'ios' : 'android';
    
    // Generate a unique device ID based on platform and timestamp
    // In production, you might want to use a more secure method like expo-application
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    
    return {
      deviceType,
      deviceId: `${deviceType}_${timestamp}_${randomSuffix}`,
    };
  } catch (error) {
    console.error('Error getting device info:', error);
    // Fallback device info
    return {
      deviceType: Platform.OS === 'ios' ? 'ios' : 'android',
      deviceId: `fallback_device_${Date.now()}`,
    };
  }
};
