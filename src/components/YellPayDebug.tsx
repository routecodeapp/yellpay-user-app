import React, { useEffect, useState } from 'react';
import {
  Alert,
  NativeModules,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const YellPayDebug: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<string>('');

  useEffect(() => {
    checkModuleAvailability();
  }, []);

  const checkModuleAvailability = () => {
    let info = '=== YellPay Module Debug Info ===\n\n';

    try {
      // Check if NativeModules is available
      info += `1. NativeModules available: ${typeof NativeModules !== 'undefined'}\n`;

      // Check if YellPay module exists
      const yellPay = NativeModules.YellPay;
      info += `2. YellPay module exists: ${yellPay !== undefined && yellPay !== null}\n`;

      if (yellPay) {
        info += `3. YellPay module type: ${typeof yellPay}\n`;

        // List all available methods
        const methods = Object.getOwnPropertyNames(yellPay);
        info += `4. Available methods (${methods.length}):\n`;
        methods.forEach((method, index) => {
          info += `   ${index + 1}. ${method}: ${typeof yellPay[method]}\n`;
        });

        // Check specific methods we need
        const requiredMethods = [
          'authRegister',
          'authRegisterProduction',
          'authApproval',
          'getProductionConfig',
          'initUser',
        ];

        info += `\n5. Required methods check:\n`;
        requiredMethods.forEach(method => {
          const available = typeof yellPay[method] === 'function';
          info += `   ${method}: ${available ? '✅' : '❌'}\n`;
        });
      } else {
        info += '3. YellPay module is null or undefined!\n';
        info += '4. Available native modules:\n';
        Object.keys(NativeModules).forEach((key, index) => {
          info += `   ${index + 1}. ${key}\n`;
        });
      }
    } catch (error) {
      info += `\nError during check: ${error}\n`;
    }

    setDebugInfo(info);
  };

  const testMethod = async (methodName: string) => {
    try {
      const yellPay = NativeModules.YellPay;
      if (!yellPay) {
        Alert.alert('Error', 'YellPay module is not available');
        return;
      }

      if (typeof yellPay[methodName] !== 'function') {
        Alert.alert('Error', `Method ${methodName} is not available`);
        return;
      }

      // Test simple methods first
      if (methodName === 'getProductionConfig') {
        const result = await yellPay.getProductionConfig();
        Alert.alert(
          'Success',
          `${methodName} result: ${JSON.stringify(result, null, 2)}`
        );
      } else {
        Alert.alert(
          'Info',
          `Method ${methodName} is available but not tested in this debug component`
        );
      }
    } catch (error: any) {
      Alert.alert(
        'Error',
        `${methodName} failed: ${error.message || error.toString()}`
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>YellPay Module Debug</Text>

      <ScrollView style={styles.scrollView}>
        <Text style={styles.debugText}>{debugInfo}</Text>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={checkModuleAvailability}
        >
          <Text style={styles.buttonText}>Refresh Check</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => testMethod('getProductionConfig')}
        >
          <Text style={styles.buttonText}>Test getProductionConfig</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  debugText: {
    fontFamily: 'monospace',
    fontSize: 12,
    lineHeight: 18,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    minWidth: 120,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default YellPayDebug;
