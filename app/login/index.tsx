import {
  Button,
  ButtonText,
  Center,
  Icon,
  Text,
  VStack,
} from '@gluestack-ui/themed';
import { Stack, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ChevronLeft } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors } from '../../src/theme/colors';
import { textStyle } from '../../src/theme/text-style';
const LoginScreen = () => {
  const [step, setStep] = useState(0);
  const { activeIndex } = useLocalSearchParams();
  const [isRegister, setIsRegister] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(60);
  const [phoneNumber, setPhoneNumber] = useState('');
  const otpRefs = useRef<(TextInput | null)[]>([]);
  useEffect(() => {
    if (activeIndex && activeIndex === '1') {
      setStep(activeIndex as unknown as number);
      setIsRegister(true);
    } else {
      setIsRegister(false);
    }
  }, [activeIndex]);

  // Countdown timer effect
  useEffect(() => {
    let interval: any;

    if (step === 2 && countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [step, countdown]);

  // Reset countdown when step changes to 2
  useEffect(() => {
    if (step === 2) {
      setCountdown(60);
    }
  }, [step]);

  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) {
      // Handle paste or multiple characters
      const digits = value.split('').slice(0, 6);
      const newOtpDigits = [...otpDigits];
      digits.forEach((digit, i) => {
        if (index + i < 6) {
          newOtpDigits[index + i] = digit;
        }
      });
      setOtpDigits(newOtpDigits);

      // Focus on the last filled field or next empty field
      const nextIndex = Math.min(index + digits.length, 5);
      if (nextIndex < 6 && otpRefs.current[nextIndex]) {
        otpRefs.current[nextIndex]?.focus();
      }

      // Auto-verify if all 6 digits are filled
      if (
        newOtpDigits.every(digit => digit !== '') &&
        newOtpDigits.length === 6
      ) {
        setTimeout(() => handleVerifyOTP(), 500);
      }
    } else {
      // Handle single character input
      const newOtpDigits = [...otpDigits];
      newOtpDigits[index] = value;
      setOtpDigits(newOtpDigits);

      // Move to next field if value is entered
      if (value && index < 5) {
        otpRefs.current[index + 1]?.focus();
      }

      // Auto-verify if all 6 digits are filled
      if (
        newOtpDigits.every(digit => digit !== '') &&
        newOtpDigits.length === 6
      ) {
        setTimeout(() => handleVerifyOTP(), 500);
      }
    }
  };

  const handleOtpKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otpDigits[index] && index > 0) {
      // Move to previous field if current field is empty and backspace is pressed
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleSendOTP = async () => {
    if (!phoneNumber.trim()) {
      Alert.alert('エラー', '電話番号を入力してください');
      return;
    }

    try {
      console.log('Sending OTP to:', phoneNumber);
      setStep(2);
      setCountdown(60);
      console.log('OTP sent successfully');
    } catch (error) {
      console.error('Error sending OTP:', error);
      Alert.alert('エラー', 'OTPの送信に失敗しました');
    }
  };

  const handleVerifyOTP = async () => {
    const otpCode = otpDigits.join('');

    if (otpCode.length !== 6) {
      Alert.alert('エラー', '6桁の認証コードを入力してください');
      return;
    }

    try {
      console.log('Verifying OTP:', otpCode);

      // Mock verification - accept any 6-digit code
      if (otpCode.length === 6) {
        console.log('OTP Verification Status: SUCCESS');
        Alert.alert('成功', '認証が完了しました');
        // Here you would typically navigate to the next screen or complete login
      } else {
        console.log('OTP Verification Status: FAILED');
        Alert.alert('エラー', '認証コードが正しくありません');
        // Clear OTP fields
        setOtpDigits(['', '', '', '', '', '']);
        otpRefs.current[0]?.focus();
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      Alert.alert('エラー', '認証に失敗しました');
    }
  };

  const handleResendOtp = async () => {
    if (countdown === 0) {
      try {
        console.log('Resending OTP to:', phoneNumber);
        setCountdown(60);
        Alert.alert('成功', '認証コードを再送信しました');
        console.log('OTP resent successfully');
      } catch (error) {
        console.error('Error resending OTP:', error);
        Alert.alert('エラー', '再送信に失敗しました');
      }
    }
  };
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <Stack.Screen
        options={{
          title: !isRegister ? 'ログイン' : '電話番号の登録',
          headerShown: true,
          headerTitle: !isRegister ? 'ログイン' : '電話番号の登録',
          headerTitleAlign: 'center',
          headerTitleStyle: {
            fontFamily: 'Roboto Medium',
            fontWeight: '600',
            fontSize: 18,
          },
          headerLeft: () =>
            step !== 2 ? (
              <></>
            ) : (
              <TouchableOpacity
                onPress={() => {
                  if (isRegister) {
                    setStep(1);
                  } else {
                    setIsRegister(false);
                    setStep(0);
                  }
                }}
              >
                <Icon as={ChevronLeft} color={colors.rd} size="lg" />
              </TouchableOpacity>
            ),
        }}
      />
      {step !== 2 ? (
        <Center flex={1} justifyContent="space-between" alignItems="center">
          <VStack space="md" pt={80} w="100%" px={16} alignItems="center">
            <Text sx={{ ...textStyle.H_W6_18 }}>
              {step === 0 ? '電話番号を入力し' : '電話番号の登録'}
            </Text>
            <Text sx={{ ...textStyle.H_W6_18 }}>
              {step === 0
                ? '認証コードを受け取ってください'
                : '認証コードを受け取ってください'}
            </Text>
            <TextInput
              placeholder="電話番号"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              style={{
                width: '100%',
                borderWidth: 1,
                borderColor: colors.line,
                borderRadius: 5,
                height: 48,
                padding: 10,
                marginTop: 24,
                marginBottom: 16,
              }}
            />
            <Button
              onPress={handleSendOTP}
              disabled={false}
              sx={{
                borderColor: colors.rd,
                backgroundColor: colors.rd,
                borderRadius: 10,
                paddingHorizontal: 24,
                paddingVertical: 12,
                width: '100%',
                height: 52,
                opacity: 1,
                boxShadow: '0px 0px 10px 0px #D5242A4F',
              }}
            >
              <ButtonText>次へ</ButtonText>
            </Button>
          </VStack>

          {step === 0 && (
            <VStack width="100%" px={16} pb={80}>
              <Text
                sx={{
                  ...textStyle.H_W6_18,
                  textAlign: 'center',
                  mb: 16,
                }}
              >
                会員登録はまだ行っていない方へ
              </Text>
              <Button
                onPress={() => {
                  setIsRegister(true);
                  setStep(1);
                }}
                variant="outline"
                sx={{
                  borderColor: colors.rd,
                  backgroundColor: 'transparent',
                  borderRadius: 10,
                  paddingHorizontal: 24,
                  paddingVertical: 12,
                  width: '100%',
                  height: 52,
                  boxShadow: '0px 0px 10px 0px #D5242A4F',
                }}
              >
                <ButtonText color={colors.rd}>新規会員登録</ButtonText>
              </Button>
            </VStack>
          )}
        </Center>
      ) : (
        <Center
          flex={1}
          justifyContent="space-between"
          alignItems="center"
          px={16}
        >
          <VStack
            space="md"
            width="100%"
            px={16}
            pt={80}
            pb={80}
            alignItems="center"
          >
            <Text sx={{ ...textStyle.H_W6_18 }}>認証コードを</Text>
            <Text sx={{ ...textStyle.H_W6_18 }}>入力してください</Text>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                width: '100%',
                marginTop: 24,
                marginBottom: 16,
              }}
            >
              {otpDigits.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={ref => {
                    if (ref) {
                      otpRefs.current[index] = ref;
                    }
                  }}
                  value={digit}
                  onChangeText={value => handleOtpChange(value, index)}
                  onKeyPress={({ nativeEvent }) =>
                    handleOtpKeyPress(nativeEvent.key, index)
                  }
                  keyboardType="numeric"
                  maxLength={1}
                  style={{
                    width: 45,
                    height: 48,
                    borderWidth: 1,
                    borderColor: colors.line,
                    borderRadius: 5,
                    textAlign: 'center',
                    fontSize: 18,
                    fontFamily: 'Roboto Medium',
                  }}
                />
              ))}
            </View>
            <Button
              onPress={handleVerifyOTP}
              disabled={otpDigits.some(digit => digit === '')}
              sx={{
                borderColor: colors.rd,
                backgroundColor: colors.rd,
                borderRadius: 10,
                paddingHorizontal: 24,
                paddingVertical: 12,
                width: '100%',
                height: 52,
                marginTop: 24,
                opacity: otpDigits.some(digit => digit === '') ? 0.5 : 1,
                boxShadow: '0px 0px 10px 0px #D5242A4F',
              }}
            >
              <ButtonText>認証する</ButtonText>
            </Button>
            <View style={{ alignItems: 'center', marginTop: 16 }}>
              {countdown > 0 ? (
                <>
                  <Text sx={{ ...textStyle.H_W6_18 }}>{countdown}s</Text>
                  <Text sx={{ ...textStyle.H_W6_13 }}>
                    60秒以内に送信ください
                  </Text>
                </>
              ) : (
                <TouchableOpacity onPress={handleResendOtp} disabled={false}>
                  <Text
                    sx={{
                      ...textStyle.H_W6_18,
                      textDecorationLine: 'underline',
                      opacity: 1,
                    }}
                  >
                    再送信する
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </VStack>
        </Center>
      )}
    </SafeAreaView>
  );
};

export default LoginScreen;
