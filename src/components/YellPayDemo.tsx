import React, { useState } from 'react';
import {
  Alert,
  NativeModules,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import type { YellPayModule } from '../types/YellPay';

const { YellPay }: { YellPay: YellPayModule } = NativeModules;

// Debug: Check if YellPay module is available
console.log('YellPay module available:', !!YellPay);
console.log(
  'YellPay module methods:',
  YellPay ? Object.keys(YellPay) : 'Module not available'
);

interface DemoState {
  serviceId: string;
  authDomain: string;
  paymentDomain: string;
  userInfo: string;
  userId: string;
  amount: string;

  isQrStart: boolean;
  urlType: string;
  providerId: string;
  waitingId: string;
  userNo: string;
  count: string;
  infoType: string;
  useProductionDefaults: boolean;
}

const YellPayDemo: React.FC = () => {
  const [state, setState] = useState<DemoState>({
    serviceId: 'yellpay',
    authDomain: 'auth.unid.net',
    paymentDomain: 'dev-pay.unid.net',
    userInfo: 'test_user_123',
    userId: '',
    amount: '1000',

    isQrStart: true,
    urlType: '1',
    providerId: 'provider_123',
    waitingId: 'waiting_123',
    userNo: '0',
    count: '10',
    infoType: '1',
    useProductionDefaults: true,
  });

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
      setState(prev => ({
        ...prev,
        serviceId: config.serviceId,
        authDomain: config.authDomain,
        paymentDomain: config.paymentDomain,
      }));
    } catch (error) {
      showError('Load Production Config', error);
    }
  };

  // ===== AUTHENTICATION METHODS =====

  const testAuthRegister = async () => {
    try {
      const result = await YellPay.authRegister(state.authDomain);
      showResult('Auth Register', result);
    } catch (error) {
      showError('Auth Register', error);
    }
  };

  const testAuthApproval = async () => {
    try {
      const result = await YellPay.authApproval(state.authDomain);
      showResult('Auth Approval', result);
    } catch (error) {
      showError('Auth Approval', error);
    }
  };

  const testAuthApprovalWithMode = async () => {
    try {
      const result = await YellPay.authApprovalWithMode(
        state.authDomain,
        state.isQrStart
      );
      showResult('Auth Approval with Mode', result);
    } catch (error) {
      showError('Auth Approval with Mode', error);
    }
  };

  const testAuthUrlScheme = async () => {
    try {
      const result = await YellPay.authUrlScheme(
        state.urlType,
        state.providerId,
        state.waitingId,
        state.authDomain
      );
      showResult('Auth URL Scheme', result);
    } catch (error) {
      showError('Auth URL Scheme', error);
    }
  };

  const testAutoAuthRegister = async () => {
    try {
      const result = await YellPay.autoAuthRegister(
        state.serviceId,
        state.userInfo,
        state.authDomain
      );
      showResult('Auto Auth Register', result);
    } catch (error) {
      showError('Auto Auth Register', error);
    }
  };

  const testAutoAuthApproval = async () => {
    try {
      const result = await YellPay.autoAuthApproval(
        state.serviceId,
        state.authDomain
      );
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

  const testAutoAuthRegisterProduction = async () => {
    try {
      const result = await YellPay.autoAuthRegisterProduction(state.userInfo);
      showResult('Auto Auth Register (Production)', result);
    } catch (error) {
      showError('Auto Auth Register (Production)', error);
    }
  };

  const testAutoAuthApprovalProduction = async () => {
    try {
      const result = await YellPay.autoAuthApprovalProduction();
      showResult('Auto Auth Approval (Production)', result);
      if (result.userInfo) {
        updateState('userInfo', result.userInfo);
      }
    } catch (error) {
      showError('Auto Auth Approval (Production)', error);
    }
  };

  const testInitUserProduction = async () => {
    try {
      const userId = await YellPay.initUserProduction();
      showResult('Init User (Production)', { userId });
      updateState('userId', userId);
    } catch (error) {
      showError('Init User (Production)', error);
    }
  };

  // ===== PAYMENT METHODS =====

  const testInitUser = async () => {
    try {
      const userId = await YellPay.initUser('yellpay');
      showResult('Init User', { userId });
      updateState('userId', userId);
    } catch (error) {
      showError('Init User', error);
    }
  };

  const testRegisterCard = async () => {
    console.log('=== REGISTER CARD FUNCTION CALLED ===');
    console.log('testRegisterCard() - state.userId:', state.userId);
    console.log('testRegisterCard() - state.userNo:', state.userNo);

    if (!state.userId) {
      console.log('testRegisterCard() - FAILED: No userId');
      Alert.alert('Error', 'Please initialize user first');
      return;
    }

    console.log('testRegisterCard() - About to call YellPay.registerCard...');
    console.log('testRegisterCard() - Parameters:', {
      uuid: state.userId,
      userNo: parseInt(state.userNo),
      payUserId: state.userId,
    });

    try {
      console.log('testRegisterCard() - Calling YellPay.registerCard NOW...');
      const result = await YellPay.registerCard(
        state.userId,
        parseInt(state.userNo),
        state.userId // payUserId is the same as userId
      );
      console.log('testRegisterCard() - SUCCESS:', result);
      showResult('Register Card', result);
    } catch (error) {
      console.log('testRegisterCard() - ERROR:', error);
      showError('Register Card', error);
    }
  };

  const testMakePayment = async () => {
    console.log('=== MAKE PAYMENT FUNCTION CALLED ===');
    console.log('testMakePayment() - state.userId:', state.userId);
    console.log('testMakePayment() - state.userNo:', state.userNo);

    if (!state.userId) {
      console.log('testMakePayment() - FAILED: No userId');
      Alert.alert('Error', 'Please initialize user first');
      return;
    }

    console.log('testMakePayment() - About to call YellPay.makePayment...');
    console.log('testMakePayment() - Parameters:', {
      uuid: state.userId,
      userNo: parseInt(state.userNo),
      payUserId: state.userId,
    });

    try {
      console.log('testMakePayment() - Calling YellPay.makePayment NOW...');
      // Note: Amount is handled by the SDK UI, userNo is typically 0
      const result = await YellPay.makePayment(
        state.userId, // uuid
        parseInt(state.userNo), // userNo (typically 0)
        state.userId // payUserId (same as userId)
      );
      console.log('testMakePayment() - SUCCESS:', result);
      showResult('Make Payment', result);
    } catch (error) {
      console.log('testMakePayment() - ERROR:', error);
      showError('Make Payment', error);
    }
  };

  const testPaymentForQR = async () => {
    console.log('=== QR PAYMENT FUNCTION CALLED ===');
    console.log('testPaymentForQR() - state.userId:', state.userId);

    if (!state.userId) {
      console.log('testPaymentForQR() - FAILED: No userId');
      Alert.alert('Error', 'Please initialize user first');
      return;
    }

    console.log('testPaymentForQR() - About to call YellPay.paymentForQR...');
    console.log('testPaymentForQR() - Parameters:', {
      uuid: state.userId,
      userNo: 0,
      payUserId: state.userId,
    });

    try {
      console.log('testPaymentForQR() - Calling YellPay.paymentForQR NOW...');
      // QR Payment will open camera interface for scanning
      const result = await YellPay.paymentForQR(
        state.userId, // uuid
        0, // userNo (typically 0)
        state.userId // payUserId (same as userId)
      );
      console.log('testPaymentForQR() - SUCCESS:', result);
      showResult('QR Payment', result);
    } catch (error) {
      console.log('testPaymentForQR() - ERROR:', error);
      showError('QR Payment', error);
    }
  };

  const testCardSelect = async () => {
    if (!state.userId) {
      Alert.alert('Error', 'Please initialize user first');
      return;
    }
    try {
      const result = await YellPay.cardSelect(state.userId);
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

  // ===== DEBUG METHODS =====

  const testBridge = async () => {
    try {
      console.log('Testing bridge - YellPay available:', !!YellPay);
      if (!YellPay) {
        Alert.alert(
          'Error',
          'YellPay module is not available! Check if the app was rebuilt properly.'
        );
        return;
      }

      // Test if the specific methods exist
      console.log('YellPay.registerCard exists:', typeof YellPay.registerCard);
      console.log('YellPay.makePayment exists:', typeof YellPay.makePayment);
      console.log('YellPay.paymentForQR exists:', typeof YellPay.paymentForQR);

      const result = await YellPay.testBridge();
      showResult('Bridge Test', result);
    } catch (error) {
      showError('Bridge Test', error);
    }
  };

  const testSimpleMethod = async () => {
    try {
      console.log('=== TESTING SIMPLE METHOD ===');
      const result = await YellPay.testSimpleMethod();
      console.log('Simple method result:', result);
      showResult('Simple Method Test', result);
    } catch (error) {
      console.log('Simple method error:', error);
      showError('Simple Method Test', error);
    }
  };

  const testMethodWithParams = async () => {
    try {
      console.log('=== TESTING METHOD WITH PARAMS ===');
      const result = await YellPay.testMethodWithParams('test-param', 123);
      console.log('Method with params result:', result);
      showResult('Method With Params Test', result);
    } catch (error) {
      console.log('Method with params error:', error);
      showError('Method With Params Test', error);
    }
  };

  const testRegisterCardSignature = async () => {
    try {
      console.log('=== TESTING REGISTER CARD SIGNATURE ===');
      const result = await YellPay.testRegisterCardSignature(
        'test-uuid',
        0,
        'test-payUserId'
      );
      console.log('Register card signature result:', result);
      showResult('Register Card Signature Test', result);
    } catch (error) {
      console.log('Register card signature error:', error);
      showError('Register Card Signature Test', error);
    }
  };

  const testAddCard = async () => {
    try {
      console.log('=== TESTING ADD CARD (DIFFERENT METHOD NAME) ===');
      const result = await YellPay.addCard('test-uuid', 0, 'test-payUserId');
      console.log('Add card result:', result);
      showResult('Add Card Test', result);
    } catch (error) {
      console.log('Add card error:', error);
      showError('Add Card Test', error);
    }
  };

  const testRouteCodeSDKClasses = async () => {
    try {
      const result = await YellPay.testRouteCodeSDKClasses();
      showResult('RouteCode SDK Classes Test', result);
    } catch (error) {
      showError('RouteCode SDK Classes Test', error);
    }
  };

  const testSDKMethodAccess = async () => {
    try {
      const result = await YellPay.testSDKMethodAccess();
      showResult('SDK Method Access Test', result);
    } catch (error) {
      showError('SDK Method Access Test', error);
    }
  };

  const testBasicSDKCall = async () => {
    try {
      const result = await YellPay.testBasicSDKCall();
      showResult('Basic SDK Test', result);
      if (result.userId) {
        updateState('userId', result.userId);
      }
    } catch (error) {
      showError('Basic SDK Test', error);
    }
  };

  const testCardRegistrationPrerequisites = async () => {
    if (!state.userId) {
      Alert.alert('Error', 'Please initialize user first to get UUID');
      return;
    }
    try {
      const result = await YellPay.testCardRegistrationPrerequisites(
        state.userId
      );
      showResult('Card Registration Prerequisites', result);
    } catch (error) {
      showError('Card Registration Prerequisites', error);
    }
  };

  const testCheckFrameworkAvailability = async () => {
    try {
      const result = await YellPay.checkFrameworkAvailability();
      showResult('Framework Availability', result);
    } catch (error) {
      showError('Framework Availability', error);
    }
  };

  const testValidateAuthenticationStatus = async () => {
    try {
      const result = await YellPay.validateAuthenticationStatus();
      showResult('Authentication Status', result);
    } catch (error) {
      showError('Authentication Status', error);
    }
  };

  const testGetHistory = async () => {
    if (!state.userId) {
      Alert.alert('Error', 'Please initialize user first');
      return;
    }
    try {
      const result = await YellPay.getHistory(state.userId);
      showResult('Get History', result);
    } catch (error) {
      showError('Get History', error);
    }
  };

  const testGetUserInfo = async () => {
    if (!state.userId) {
      Alert.alert('Error', 'Please initialize user first');
      return;
    }
    try {
      const result = await YellPay.getUserInfo(state.userId);
      showResult('Get User Info', result);
    } catch (error) {
      showError('Get User Info', error);
    }
  };

  const testViewCertificate = async () => {
    if (!state.userId) {
      Alert.alert('Error', 'Please initialize user first');
      return;
    }
    try {
      const result = await YellPay.viewCertificate(state.userId);
      showResult('View Certificate', result);
    } catch (error) {
      showError('View Certificate', error);
    }
  };

  const testGetNotification = async () => {
    if (!state.userId) {
      Alert.alert('Error', 'Please initialize user first');
      return;
    }
    try {
      const result = await YellPay.getNotification(
        state.userId, // payUserId
        parseInt(state.count) // lastUpdate (using count as timestamp)
      );
      showResult('Get Notification', result);
    } catch (error) {
      showError('Get Notification', error);
    }
  };

  const testGetInformation = async () => {
    if (!state.userId) {
      Alert.alert('Error', 'Please initialize user first');
      return;
    }
    try {
      const result = await YellPay.getInformation(
        state.userId,
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

      {/* Configuration Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚙️ Configuration</Text>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={loadProductionConfig}
        >
          <Text style={styles.buttonText}>📡 Load Production Config</Text>
        </TouchableOpacity>

        <View style={styles.switchContainer}>
          <Text style={styles.label}>Use Production Defaults:</Text>
          <Switch
            value={state.useProductionDefaults}
            onValueChange={value => updateState('useProductionDefaults', value)}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Service ID:</Text>
          <TextInput
            style={styles.input}
            value={state.serviceId}
            onChangeText={text => updateState('serviceId', text)}
            placeholder="yellpay (production)"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Auth Domain:</Text>
          <TextInput
            style={styles.input}
            value={state.authDomain}
            onChangeText={text => updateState('authDomain', text)}
            placeholder="auth.unid.net (production)"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Payment Domain:</Text>
          <TextInput
            style={styles.input}
            value={state.paymentDomain}
            onChangeText={text => updateState('paymentDomain', text)}
            placeholder="dev-pay.unid.net (production)"
          />
        </View>

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
          <Text style={styles.label}>Current User ID:</Text>
          <Text style={styles.valueText}>{state.userId || 'Not set'}</Text>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            📡 Auth operations use: {state.authDomain}
          </Text>
          <Text style={styles.infoText}>
            💳 Payment operations use: {state.paymentDomain}
          </Text>
        </View>
      </View>

      {/* Debug Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔍 Debug & Validation</Text>

        <TouchableOpacity style={styles.primaryButton} onPress={testBridge}>
          <Text style={styles.buttonText}>🌉 Test Bridge Connectivity</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={testSimpleMethod}>
          <Text style={styles.buttonText}>🧪 Test Simple Method</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={testMethodWithParams}>
          <Text style={styles.buttonText}>🧪 Test Method With Params</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={testRegisterCardSignature}
        >
          <Text style={styles.buttonText}>🧪 Test Register Card Signature</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={testAddCard}>
          <Text style={styles.buttonText}>
            🧪 Test Add Card (Different Name)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={async () => {
            console.log('=== DIRECT METHOD TEST ===');
            console.log('Testing direct method call...');
            try {
              console.log('Calling YellPay.registerCard directly...');
              const result = await YellPay.registerCard(
                'test-uuid',
                0,
                'test-payUserId'
              );
              console.log('Direct call result:', result);
            } catch (error) {
              console.log('Direct call error:', error);
            }
          }}
        >
          <Text style={styles.buttonText}>🧪 Test Direct Method Call</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={testRouteCodeSDKClasses}
        >
          <Text style={styles.buttonText}>🔍 Test RouteCode SDK Classes</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={testSDKMethodAccess}>
          <Text style={styles.buttonText}>🔍 Test SDK Method Access</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={testBasicSDKCall}>
          <Text style={styles.buttonText}>🧪 Test Basic SDK Call</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={testCheckFrameworkAvailability}
        >
          <Text style={styles.buttonText}>🔧 Check SDK Availability</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={testCardRegistrationPrerequisites}
        >
          <Text style={styles.buttonText}>
            🩺 Test Card Registration Prerequisites
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={testValidateAuthenticationStatus}
        >
          <Text style={styles.buttonText}>🔐 Validate Auth Status</Text>
        </TouchableOpacity>
      </View>

      {/* Authentication Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔐 Authentication Features</Text>

        <TouchableOpacity style={styles.button} onPress={testAuthRegister}>
          <Text style={styles.buttonText}>Register Authentication Key</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={testAuthApproval}>
          <Text style={styles.buttonText}>Authentication Approval</Text>
        </TouchableOpacity>

        <View style={styles.switchContainer}>
          <Text style={styles.label}>Start with QR:</Text>
          <Switch
            value={state.isQrStart}
            onValueChange={value => updateState('isQrStart', value)}
          />
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={testAuthApprovalWithMode}
        >
          <Text style={styles.buttonText}>Auth Approval (With Mode)</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={testAutoAuthRegister}>
          <Text style={styles.buttonText}>Auto Authentication Register</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={testAutoAuthApproval}>
          <Text style={styles.buttonText}>Auto Authentication Approval</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={testAuthUrlScheme}>
          <Text style={styles.buttonText}>Auth URL Scheme</Text>
        </TouchableOpacity>

        <Text style={styles.subSectionTitle}>🚀 Production Quick Methods</Text>

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

        <TouchableOpacity
          style={styles.productionButton}
          onPress={testAutoAuthRegisterProduction}
        >
          <Text style={styles.buttonText}>
            🤖 Auto Auth Register (Production)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.productionButton}
          onPress={testAutoAuthApprovalProduction}
        >
          <Text style={styles.buttonText}>
            🎯 Auto Auth Approval (Production)
          </Text>
        </TouchableOpacity>
      </View>

      {/* Payment Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💳 Payment Features</Text>

        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            ⚠️ IMPORTANT: Payment operations require authentication first!
          </Text>
          <Text style={styles.infoText}>
            1️⃣ Complete Authentication (Auth Register + Approval)
          </Text>
          <Text style={styles.infoText}>2️⃣ Initialize User to get UUID</Text>
          <Text style={styles.infoText}>
            3️⃣ Test Prerequisites before card registration
          </Text>
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={testInitUser}>
          <Text style={styles.buttonText}>1. Initialize User (Custom)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.productionButton}
          onPress={testInitUserProduction}
        >
          <Text style={styles.buttonText}>🚀 Initialize User (Production)</Text>
        </TouchableOpacity>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Amount (¥):</Text>
          <TextInput
            style={styles.input}
            value={state.amount}
            onChangeText={text => updateState('amount', text)}
            placeholder="1000"
            keyboardType="numeric"
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={testRegisterCard}>
          <Text style={styles.buttonText}>
            💳 Register Card (Needs Auth + InitUser)
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

      {/* Information Section */}
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
          <Text style={styles.label}>Notification Count:</Text>
          <TextInput
            style={styles.input}
            value={state.count}
            onChangeText={text => updateState('count', text)}
            placeholder="10"
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
