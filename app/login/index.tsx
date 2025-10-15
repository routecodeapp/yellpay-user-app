import {
  Button,
  ButtonText,
  Center,
  Icon,
  Text,
  VStack,
} from '@gluestack-ui/themed';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ChevronLeft } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { setRegistration } from '../../src/redux/slice/auth/registrationSlice';
import { useCheckPhoneNumberMutation, usePhoneRegisterMutation, useRequestOtpMutation, useVerifyOtpMutation } from '../../src/services/appApi';
import { colors } from '../../src/theme/colors';
import { textStyle } from '../../src/theme/text-style';
const LoginScreen = () => {
  const [step, setStep] = useState(0);
  const { activeIndex } = useLocalSearchParams();
  const [isRegister, setIsRegister] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(60);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [screenMessage, setScreenMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const otpRefs = useRef<(TextInput | null)[]>([]);
  const [checkPhoneNumber] = useCheckPhoneNumberMutation();
  const [phoneRegister] = usePhoneRegisterMutation();
  const [requestOtp] = useRequestOtpMutation();
  const [verifyOtp] = useVerifyOtpMutation();
  const [otpToken, setOtpToken] = useState<string | null>(null);
  const dispatch = useDispatch();
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

  const handleOtpChange = (rawValue: string, index: number) => {
    if (otpError) {
      setOtpError('');
    }
    const onlyDigits = rawValue.replace(/\D/g, '');

    // Build updated digits synchronously to avoid stale state
    let updated = [...otpDigits];

    if (onlyDigits.length > 1) {
      // Paste/multiple characters: fill forward from current index
      const slice = onlyDigits.slice(0, 6 - index);
      for (let i = 0; i < slice.length; i++) {
        updated[index + i] = slice[i];
      }
      // Move focus to last filled or end
      const nextIndex = Math.min(index + slice.length, 5);
      if (otpRefs.current[nextIndex]) {
        otpRefs.current[nextIndex]?.focus();
      }
    } else {
      // Single character or empty
      const digit = onlyDigits.slice(-1); // '' or '0'-'9'
      updated[index] = digit;
      if (digit && index < 5) {
        otpRefs.current[index + 1]?.focus();
      }
    }

    setOtpDigits(updated);

    // Auto-verify if all 6 positions are filled
    if (updated.every(d => d !== '')) {
      setTimeout(() => handleVerifyOTP(), 200);
    }
  };

  const handleOtpKeyPress = (key: string, index: number) => {
    if (key === 'Backspace') {
      if (otpDigits[index]) {
        // Clear current digit
        const updated = [...otpDigits];
        updated[index] = '';
        setOtpDigits(updated);
      } else if (index > 0) {
        // Move back and clear previous
        otpRefs.current[index - 1]?.focus();
        const updated = [...otpDigits];
        updated[index - 1] = '';
        setOtpDigits(updated);
      }
    }
  };

  const handleSendOTP = async () => {
    setScreenMessage(null);
    if (!phoneNumber.trim()) {
      setPhoneError('電話番号を入力してください');
      return;
    }

    try {
      // For registration flow (step 1), verify phone and conditionally register
      // if (step === 1) {
      //   try {
      //     await phoneRegister({ phone_number: phoneNumber }).unwrap();
      //   } catch (regErr: any) {
      //     const message = regErr?.data?.message || '電話番号登録に失敗しました';
      //     const firstError = regErr?.data?.errors ? (Object.values(regErr.data.errors) as string[][]).flat()[0] : undefined;
      //     setScreenMessage({ type: 'error', text: firstError || message });
      //     console.log(regErr);
      //     return;
      //   }
      // }
      // Request OTP from backend
      try {
        const res = await requestOtp({ phone_number: phoneNumber }).unwrap();
        if (res.status !== 'success') {
          const message = res?.message || 'OTP送信に失敗しました';
          setPhoneError(message);
          return;
        }
        const token = res?.data?.token;
        if (!token) {
          setPhoneError('無効なレスポンスを受信しました');
          return;
        }
        setOtpToken(token);
        setStep(2);
        setCountdown(60);
        setPhoneError('');
        setScreenMessage({ type: 'info', text: '認証コードを送信しました' });
      } catch (reqErr: any) {
        const message = reqErr?.data?.message || 'OTP送信に失敗しました';
        const firstError = reqErr?.data?.errors ? (Object.values(reqErr.data.errors) as string[][]).flat()[0] : undefined;
        setPhoneError(firstError || message);
        console.log(reqErr);
        return;
      }
    } catch (error) {
      console.error('Error preparing OTP step:', error);
      setScreenMessage({ type: 'error', text: 'エラーが発生しました。もう一度お試しください' });
    }
  };

  const handleVerifyOTP = async () => {
    const otpCode = otpDigits.join('');

    if (otpCode.length < 6) {
      setOtpError('6桁の認証コードを入力してください');
      return;
    }

    try {
      if (!otpToken) {
        setScreenMessage({ type: 'error', text: 'セッションが無効です。最初からやり直してください' });
        return;
      }
      const res = await verifyOtp({ otp: otpCode, token: otpToken }).unwrap();
      // Success
      const accessToken = res.data.access_token;
      const user = res.data.user;
      dispatch(setRegistration({
        name: user.name,
        email: user.email,
        token: user.registration_complete === 'NO' ? '' : accessToken,
        user,
      }));
      // Clear temporary OTP token after successful verification
      setOtpToken(null);
      setScreenMessage({ type: 'success', text: '認証が完了しました' });
      if (user.registration_complete === 'NO') {
        router.replace('/registration-form');
      } else {
        // Navigate to confirm-register or home as per app flow
        router.replace('/');
      }
    } catch (error) {
      const message = (error as any)?.data?.message || '認証に失敗しました';
      const firstError = (error as any)?.data?.errors ? (Object.values((error as any).data.errors) as string[][]).flat()[0] : undefined;
      setOtpError(firstError || message);
      // Clear OTP fields
      setOtpDigits(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    }
  };

  const handleResendOtp = async () => {
    if (countdown === 0) {
      try {
        const res = await requestOtp({ phone_number: phoneNumber }).unwrap();
        if (res.status !== 'success') {
          const message = res?.message || 'OTPの再送信に失敗しました';
          setOtpError(message);
          return;
        }
        const token = res?.data?.token;
        if (!token) {
          setOtpError('無効なレスポンスを受信しました');
          return;
        }
        setOtpToken(token);
        setCountdown(60);
        setScreenMessage({ type: 'success', text: '認証コードを再送信しました' });
      } catch (error: any) {
        const message = error?.data?.message || 'OTPの再送信に失敗しました';
        const firstError = error?.data?.errors ? (Object.values(error.data.errors) as string[][]).flat()[0] : undefined;
        setOtpError(firstError || message);
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
            {!!phoneError && (
              <Text sx={{ ...textStyle.H_W6_13, color: colors.rd, width: '100%', textAlign: 'left' }}>
                {phoneError}
              </Text>
            )}
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
            {!!otpError && (
              <Text sx={{ ...textStyle.H_W6_13, color: colors.rd, width: '100%', textAlign: 'left' }}>
                {otpError}
              </Text>
            )}
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
            {screenMessage && (
              <Text
                sx={{
                  ...textStyle.H_W6_13,
                  color: screenMessage.type === 'error' ? colors.rd : screenMessage.type === 'success' ? '#0f9d58' : colors.gr1,
                  textAlign: 'center',
                  mt: 12,
                }}
              >
                {screenMessage.text}
              </Text>
            )}
          </VStack>
        </Center>
      )}
    </SafeAreaView>
  );
};

export default LoginScreen;