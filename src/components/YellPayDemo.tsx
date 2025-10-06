import React, { useState } from 'react';
import {
  Alert,
  NativeModules,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAppSelector } from '../redux/hooks';
import type { YellPayModule } from '../types/YellPay';

const { YellPay }: { YellPay: YellPayModule } = NativeModules;

interface DemoState {
  userInfo: string;
  lastUpdate: string;
  infoType: string;
}

const YellPayDemo: React.FC = () => {
  const [state, setState] = useState<DemoState>({
    userInfo: 'test_user_123',
    lastUpdate: '0',
    infoType: '1',
  });
  const userId = useAppSelector(s => s.registration.userId) || '';

  const updateState = (key: keyof DemoState, value: string | boolean) => {
    setState(prev => ({ ...prev, [key]: value }));
  };

  const showResult = (title: string, result: any) => {
    console.log(`${title}:`, result);
    Alert.alert(title, JSON.stringify(result, null, 2));
  };

  const showError = (title: string, error: any) => {
    console.error(`${title}:`, error);
    Alert.alert(`${title} Error`, error.message || error.toString());
  };

  // ===== CONFIGURATION METHODS =====

  const loadProductionConfig = async () => {
    try {
      const config = await YellPay.getProductionConfig();
      showResult('Production Config', config);
    } catch (error) {
      showError('Load Production Config', error);
    }
  };

  // ===== AUTHENTICATION METHODS (Production variants) =====

  const testAutoAuthRegister = async () => {
    try {
      const result = await YellPay.autoAuthRegisterProduction(state.userInfo);
      showResult('Auto Auth Register', result);
    } catch (error) {
      showError('Auto Auth Register', error);
    }
  };

  const testAutoAuthApproval = async () => {
    try {
      const result = await YellPay.autoAuthApprovalProduction();
      showResult('Auto Auth Approval', result);
      if (result.userInfo) {
        updateState('userInfo', result.userInfo);
      }
    } catch (error) {
      showError('Auto Auth Approval', error);
    }
  };

  // ===== PRODUCTION CONVENIENCE METHODS =====

  const testAuthRegisterProduction = async () => {
    try {
      const result = await YellPay.authRegisterProduction();
      showResult('Auth Register (Production)', result);
    } catch (error) {
      showError('Auth Register (Production)', error);
    }
  };

  const testAuthApprovalProduction = async () => {
    try {
      const result = await YellPay.authApprovalProduction();
      showResult('Auth Approval (Production)', result);
    } catch (error) {
      showError('Auth Approval (Production)', error);
    }
  };

  // Removed explicit production variants for auto auth to keep API surface minimal

  // No need to init user in demo; userId is read from Redux on Home

  // ===== PAYMENT METHODS =====

  const testRegisterCard = async () => {
    if (!userId) {
      Alert.alert(
        'Error',
        'User not found. Please register/login in Home first.'
      );
      return;
    }

    try {
      const result = await YellPay.registerCard(userId, 0, userId);
      showResult('Register Card', result);
    } catch (error) {
      showError('Register Card', error);
    }
  };

  const testMakePayment = async () => {
    if (!userId) {
      Alert.alert(
        'Error',
        'User not found. Please register/login in Home first.'
      );
      return;
    }

    try {
      const result = await YellPay.makePayment(userId, 0, userId);
      showResult('Make Payment', result);
    } catch (error) {
      showError('Make Payment', error);
    }
  };

  const testPaymentForQR = async () => {
    if (!userId) {
      Alert.alert(
        'Error',
        'User not found. Please register/login in Home first.'
      );
      return;
    }

    try {
      const result = await YellPay.paymentForQR(userId, 0, userId);
      showResult('QR Payment', result);
    } catch (error) {
      showError('QR Payment', error);
    }
  };

  const testCardSelect = async () => {
    if (!userId) {
      Alert.alert(
        'Error',
        'User not found. Please register/login in Home first.'
      );
      return;
    }
    try {
      const result = await YellPay.cardSelect(userId);
      showResult('Card Select', result);
    } catch (error) {
      showError('Card Select', error);
    }
  };

  const testGetMainCreditCard = async () => {
    try {
      const result = await YellPay.getMainCreditCard();
      showResult('Get Main Credit Card', result);
    } catch (error) {
      showError('Get Main Credit Card', error);
    }
  };

  // Debug and experimental methods removed for simplicity

  const testGetHistory = async () => {
    if (!userId) {
      Alert.alert(
        'Error',
        'User not found. Please register/login in Home first.'
      );
      return;
    }
    try {
      const result = await YellPay.getHistory(userId);
      showResult('Get History', result);
    } catch (error) {
      showError('Get History', error);
    }
  };

  const testGetUserInfo = async () => {
    if (!userId) {
      Alert.alert(
        'Error',
        'User not found. Please register/login in Home first.'
      );
      return;
    }
    try {
      const result = await YellPay.getUserInfo(userId);
      showResult('Get User Info', result);
    } catch (error) {
      showError('Get User Info', error);
    }
  };

  const testViewCertificate = async () => {
    if (!userId) {
      Alert.alert(
        'Error',
        'User not found. Please register/login in Home first.'
      );
      return;
    }
    try {
      const result = await YellPay.viewCertificate(userId);
      showResult('View Certificate', result);
    } catch (error) {
      showError('View Certificate', error);
    }
  };

  const testGetNotification = async () => {
    if (!userId) {
      Alert.alert(
        'Error',
        'User not found. Please register/login in Home first.'
      );
      return;
    }
    try {
      const result = await YellPay.getNotification(
        userId,
        parseInt(state.lastUpdate)
      );
      showResult('Get Notification', result);
    } catch (error) {
      showError('Get Notification', error);
    }
  };

  const testGetInformation = async () => {
    if (!userId) {
      Alert.alert(
        'Error',
        'User not found. Please register/login in Home first.'
      );
      return;
    }
    try {
      const result = await YellPay.getInformation(
        userId,
        parseInt(state.infoType)
      );
      showResult('Get Information', result);
    } catch (error) {
      showError('Get Information', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>YellPay SDK Demo</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚙️ Configuration</Text>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={loadProductionConfig}
        >
          <Text style={styles.buttonText}>📡 Load Production Config</Text>
        </TouchableOpacity>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>User Info:</Text>
          <TextInput
            style={styles.input}
            value={state.userInfo}
            onChangeText={text => updateState('userInfo', text)}
            placeholder="User identifier"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Current User ID (from Redux):</Text>
          <Text style={styles.valueText}>{userId || 'Not set'}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔐 Authentication Features</Text>
        <TouchableOpacity
          style={styles.productionButton}
          onPress={testAuthRegisterProduction}
        >
          <Text style={styles.buttonText}>🔑 Auth Register (Production)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.productionButton}
          onPress={testAuthApprovalProduction}
        >
          <Text style={styles.buttonText}>✅ Auth Approval (Production)</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={testAutoAuthRegister}>
          <Text style={styles.buttonText}>🤖 Auto Auth Register</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={testAutoAuthApproval}>
          <Text style={styles.buttonText}>🎯 Auto Auth Approval</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💳 Payment Features</Text>

        <TouchableOpacity style={styles.button} onPress={testRegisterCard}>
          <Text style={styles.buttonText}>
            💳 Register Card (Needs Auth + User)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={testMakePayment}>
          <Text style={styles.buttonText}>💰 Make Payment (Needs Cards)</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={testPaymentForQR}>
          <Text style={styles.buttonText}>📱 QR Payment (Camera)</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={testCardSelect}>
          <Text style={styles.buttonText}>Card Selection</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={testGetMainCreditCard}>
          <Text style={styles.buttonText}>Get Main Credit Card</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Information Features</Text>

        <TouchableOpacity style={styles.button} onPress={testGetHistory}>
          <Text style={styles.buttonText}>Get Payment History</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={testGetUserInfo}>
          <Text style={styles.buttonText}>Get User Information</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={testViewCertificate}>
          <Text style={styles.buttonText}>View Certificate</Text>
        </TouchableOpacity>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Last Update (timestamp):</Text>
          <TextInput
            style={styles.input}
            value={state.lastUpdate}
            onChangeText={text => updateState('lastUpdate', text)}
            placeholder="0"
            keyboardType="numeric"
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={testGetNotification}>
          <Text style={styles.buttonText}>Get Notifications</Text>
        </TouchableOpacity>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Info Type:</Text>
          <TextInput
            style={styles.input}
            value={state.infoType}
            onChangeText={text => updateState('infoType', text)}
            placeholder="1"
            keyboardType="numeric"
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={testGetInformation}>
          <Text style={styles.buttonText}>Get Information</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  section: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2c3e50',
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
    paddingBottom: 5,
  },
  inputContainer: {
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
    color: '#34495e',
  },
  input: {
    borderWidth: 1,
    borderColor: '#bdc3c7',
    borderRadius: 5,
    padding: 10,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  valueText: {
    fontSize: 14,
    color: '#7f8c8d',
    fontStyle: 'italic',
  },
  infoContainer: {
    backgroundColor: '#ecf0f1',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  infoText: {
    fontSize: 12,
    color: '#2c3e50',
    marginBottom: 2,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#3498db',
    padding: 12,
    borderRadius: 5,
    marginBottom: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#e74c3c',
    padding: 12,
    borderRadius: 5,
    marginBottom: 8,
    alignItems: 'center',
  },
  productionButton: {
    backgroundColor: '#27ae60',
    padding: 12,
    borderRadius: 5,
    marginBottom: 8,
    alignItems: 'center',
  },
  subSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
    color: '#27ae60',
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
    paddingTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default YellPayDemo;
