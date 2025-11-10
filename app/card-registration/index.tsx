import { HStack, Image, ScrollView, Text, VStack } from '@gluestack-ui/themed';
import { yupResolver } from '@hookform/resolvers/yup';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  NativeModules,
  Platform,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Yup from 'yup';
import { LabelWIthRequired, MonthYearPicker, Step } from '../../src/components';
import { useAppSelector } from '../../src/redux/hooks';
import { RootState } from '../../src/redux/store';
import { colors } from '../../src/theme/colors';
import { textStyle } from '../../src/theme/text-style';
import type { YellPayModule } from '../../src/types/YellPay';
import { validateCardRegistration, validateAndShowError } from '../../src/utils/yellPayFlow';

const { YellPay }: { YellPay: YellPayModule } = NativeModules;

// Validation schema for card registration
const ValidationSchema = Yup.object({
  cardNumber: Yup.string()
    .required('カード番号を入力してください')
    .matches(/^\d{13,19}$/, 'カード番号は13-19桁の数字で入力してください'),
  expiryMonth: Yup.number()
    .required('有効期限の月を選択してください')
    .min(1, '正しい月を選択してください')
    .max(12, '正しい月を選択してください'),
  expiryYear: Yup.number().required('有効期限の年を選択してください'),
  securityCode: Yup.string()
    .required('セキュリティコードを入力してください')
    .matches(/^\d{3,4}$/, 'セキュリティコードは3-4桁の数字で入力してください'),
});

type FormValues = {
  cardNumber: string;
  expiryMonth: number | null;
  expiryYear: number | null;
  securityCode: string;
};

const CardRegistration = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isRegistering, setIsRegistering] = useState(false);
  const router = useRouter();
  const scrollViewRef = useRef<any>(null);
  const { userId, isAuthenticated } = useAppSelector((state: RootState) => state.registration);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    trigger,
  } = useForm<FormValues>({
    resolver: yupResolver(ValidationSchema) as any,
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      cardNumber: '',
      expiryMonth: null,
      expiryYear: null,
      securityCode: '',
    },
  });

  const watchedValues = watch();

  // Scroll helper function
  const scrollToInput = (yOffset: number = 0) => {
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        y: yOffset,
        animated: true,
      });
    }, 100);
  };

  // Form submission handler
  const onSubmit = (values: FormValues) => {
    Keyboard.dismiss();
    console.log('Card registration data:', values);
    setCurrentStep(1);
  };

  const steps = [
    {
      id: 1,
      label: '入力画面',
      isActive: currentStep === 0,
      isVisited: currentStep > 0,
    },
    {
      id: 2,
      label: '確認画面',
      isActive: currentStep === 1,
      isVisited: currentStep > 1,
    },
    {
      id: 3,
      label: '完了画面',
      isActive: currentStep === 2,
      isVisited: false,
    },
  ];

  return (
    <SafeAreaProvider>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            ref={scrollViewRef}
            style={{ backgroundColor: colors.wt, flex: 1, marginBottom: 72 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <StatusBar style="dark" />
            <Stack.Screen
              options={{
                title: 'クレジットカード情報',
                headerShown: true,
                headerTitle: 'クレジットカード情報',
                headerTitleAlign: 'center',

                headerTitleStyle: {
                  fontFamily: 'Hiragino Sans Bold',
                  fontWeight: 600,
                  fontSize: 18,
                },
                headerLeft: () => <></>,
              }}
            />
            <VStack width="100%">
              <Step
                steps={steps}
                currentStep={currentStep}
                //   onStepPress={stepIndex => setCurrentStep(stepIndex)}
                style={{ marginHorizontal: 16, marginTop: 16 }}
              />
              {currentStep === 0 && (
                <VStack padding={16} gap={12}>
                  {currentStep === 0 && (
                    <VStack>
                      <Text
                        sx={{ ...textStyle.H_W6_15, color: colors.gr2, mb: 24 }}
                      >
                        ご利用頂けるカード
                      </Text>
                      <Image
                        source={require('../../assets/images/card-group-icon.png')}
                        height={29}
                        width={167}
                        alt="card-registration"
                      />
                      <VStack mt={32} marginHorizontal={1}>
                        <LabelWIthRequired
                          label="カードを登録"
                          required={false}
                        />
                        <Controller
                          control={control}
                          name="cardNumber"
                          render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                              onChangeText={text => {
                                // Remove any non-digit characters
                                const numericText = text.replace(/\D/g, '');
                                onChange(numericText);
                                // Only trigger validation if there are existing errors
                                if (errors.cardNumber) {
                                  trigger('cardNumber');
                                }
                              }}
                              onBlur={onBlur}
                              onFocus={() => {
                                scrollToInput(200);
                              }}
                              value={value}
                              placeholder="123456789123456"
                              keyboardType="numeric"
                              placeholderTextColor={colors.line}
                              style={{
                                borderWidth: 1,
                                padding: 8,
                                borderRadius: 5,
                                borderColor: errors.cardNumber
                                  ? colors.rd
                                  : colors.line,
                                height: 48,
                                marginTop: 24,
                                marginBottom: errors.cardNumber ? 6 : 12,
                              }}
                            />
                          )}
                        />
                        {errors.cardNumber && (
                          <Text
                            sx={{
                              color: colors.wt,
                              ...textStyle.H_W3_13,
                              mb: 16,
                              px: 4,
                              py: 2,
                              borderRadius: 4,
                              backgroundColor: colors.rd,
                            }}
                          >
                            {errors.cardNumber.message}
                          </Text>
                        )}
                        <Text
                          sx={{
                            ...textStyle.H_W6_12,
                            color: colors.gr2,
                            mb: 32,
                          }}
                        >
                          ※ハイフン(-)抜きで入力してください。
                        </Text>
                        <LabelWIthRequired
                          label="カード有効期限"
                          required={false}
                        />
                        <HStack mt={24}>
                          <MonthYearPicker
                            onDateChange={(month, year) => {
                              console.log(
                                'Selected month:',
                                month,
                                'year:',
                                year
                              );
                              setValue('expiryMonth', month);
                              setValue('expiryYear', year);
                              // Only trigger validation if there are existing errors
                              if (errors.expiryMonth || errors.expiryYear) {
                                trigger(['expiryMonth', 'expiryYear']);
                              }
                            }}
                            minYear={2020}
                            maxYear={2050}
                            selectedMonth={watchedValues.expiryMonth}
                            selectedYear={watchedValues.expiryYear}
                            setSelectedMonth={month =>
                              setValue('expiryMonth', month)
                            }
                            setSelectedYear={year =>
                              setValue('expiryYear', year)
                            }
                          />
                        </HStack>
                        {(errors.expiryMonth || errors.expiryYear) && (
                          <Text
                            sx={{
                              color: colors.wt,
                              ...textStyle.H_W3_13,
                              mb: 16,
                              px: 4,
                              py: 2,
                              borderRadius: 4,
                              backgroundColor: colors.rd,
                              mt: 8,
                            }}
                          >
                            {errors.expiryMonth?.message ||
                              errors.expiryYear?.message}
                          </Text>
                        )}
                        <VStack mt={32}>
                          <LabelWIthRequired
                            label="セキュリティコード"
                            required={false}
                          />
                          <Controller
                            control={control}
                            name="securityCode"
                            render={({
                              field: { onChange, onBlur, value },
                            }) => (
                              <TextInput
                                onChangeText={text => {
                                  // Remove any non-digit characters
                                  const numericText = text.replace(/\D/g, '');
                                  onChange(numericText);
                                  // Only trigger validation if there are existing errors
                                  if (errors.securityCode) {
                                    trigger('securityCode');
                                  }
                                }}
                                onBlur={onBlur}
                                onFocus={() => {
                                  scrollToInput(400);
                                }}
                                value={value}
                                placeholder="123"
                                keyboardType="numeric"
                                maxLength={4}
                                placeholderTextColor={colors.line}
                                style={{
                                  borderWidth: 1,
                                  padding: 8,
                                  borderRadius: 5,
                                  borderColor: errors.securityCode
                                    ? colors.rd
                                    : colors.line,
                                  height: 48,
                                  marginTop: 24,
                                  marginBottom: errors.securityCode ? 6 : 12,
                                }}
                              />
                            )}
                          />
                          {errors.securityCode && (
                            <Text
                              sx={{
                                color: colors.wt,
                                ...textStyle.H_W3_13,
                                mb: 16,
                                px: 4,
                                py: 2,
                                borderRadius: 4,
                                backgroundColor: colors.rd,
                              }}
                            >
                              {errors.securityCode.message}
                            </Text>
                          )}
                        </VStack>
                        <Text
                          sx={{
                            ...textStyle.H_W6_12,
                            color: colors.gr2,
                            mb: 32,
                            lineHeight: 20,
                          }}
                        >
                          ※セキュリティコードはクレジットカード裏面の末尾3桁(一部4桁)の数字です。
                        </Text>
                      </VStack>
                      <TouchableOpacity
                        onPress={handleSubmit(onSubmit)}
                        disabled={isSubmitting}
                        style={{
                          borderRadius: 10,
                          height: 56,
                          width: '100%',
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: isSubmitting ? 0.7 : 1,
                          ...Platform.select({
                            ios: {
                              shadowColor: '#000',
                              shadowOffset: {
                                width: 0,
                                height: -1,
                              },
                              shadowOpacity: 0.1,
                              shadowRadius: 20,
                            },
                            android: {
                              elevation: 3,
                            },
                          }),
                        }}
                      >
                        <LinearGradient
                          colors={['#F6575D', '#D5242A']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 0, y: 0 }}
                          style={{
                            position: 'absolute',
                            borderRadius: 10,
                            height: 56,
                            width: '100%',
                          }}
                        />
                        <Text
                          sx={{
                            ...textStyle.H_W6_15,
                            color: colors.wt1,
                          }}
                        >
                          確認画面
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => {
                          router.back();
                        }}
                        style={{
                          borderRadius: 10,
                          height: 56,
                          width: '100%',
                          borderWidth: 1,
                          marginTop: 16,
                          borderColor: colors.rd,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Text
                          sx={{
                            ...textStyle.H_W6_15,
                            color: colors.rd,
                          }}
                        >
                          キャンセル
                        </Text>
                      </TouchableOpacity>
                    </VStack>
                  )}
                </VStack>
              )}

              {currentStep === 1 && (
                <VStack
                  paddingHorizontal={16}
                  paddingVertical={32}
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text
                    sx={{
                      ...textStyle.H_W6_15,
                      color: colors.gr2,
                      mb: 24,
                      flexWrap: 'wrap',
                      textAlign: 'center',
                    }}
                  >
                    入力いただいた内容は下記となります。{'\n'}
                    よろしければ「送信」ボタンを押してください。{'\n'}
                    内容を変更する場合は{'\n'}
                    「戻る」ボタンを押してください。
                  </Text>
                  {Platform.OS === 'ios' && (
                    <Text
                      sx={{
                        ...textStyle.H_W3_12,
                        color: colors.rd,
                        mb: 16,
                        textAlign: 'center',
                        paddingHorizontal: 16,
                      }}
                    >
                      ※iOSでは、SDKのカード登録画面が表示されます。
                    </Text>
                  )}

                  <HStack
                    alignItems="center"
                    justifyContent="space-between"
                    gap={8}
                    mt={24}
                    width="100%"
                  >
                    <Text
                      sx={{
                        ...textStyle.H_W6_15,
                        color: colors.gr2,
                      }}
                    >
                      カード番号
                    </Text>
                    <Text
                      sx={{
                        ...textStyle.R_18_M,
                        color: colors.gr2,
                      }}
                    >
                      {watchedValues.cardNumber}
                    </Text>
                  </HStack>
                  <HStack
                    alignItems="center"
                    justifyContent="space-between"
                    mt={24}
                    gap={8}
                    width="100%"
                  >
                    <Text
                      sx={{
                        ...textStyle.H_W6_15,
                        color: colors.gr2,
                      }}
                    >
                      カード有効期限
                    </Text>
                    <Text
                      sx={{
                        ...textStyle.R_18_M,
                        color: colors.gr2,
                      }}
                    >
                      {watchedValues.expiryYear} /{' '}
                      {watchedValues?.expiryMonth &&
                      watchedValues?.expiryMonth < 10
                        ? `0${watchedValues.expiryMonth}`
                        : watchedValues.expiryMonth}
                    </Text>
                  </HStack>
                  <TouchableOpacity
                    onPress={async () => {
                      // Validate flow before proceeding (iOS only)
                      if (Platform.OS === 'ios') {
                        const validation = validateCardRegistration(isAuthenticated, userId);
                        if (!validateAndShowError(validation)) {
                          return;
                        }
                      }

                      setIsRegistering(true);
                      try {
                        if (Platform.OS === 'ios' && userId) {
                          // On iOS, call the SDK registerCard method
                          // The SDK will show its own UI for card input
                          console.log('Calling YellPay.registerCard for iOS...');
                          const result = await YellPay.registerCard(
                            userId, // uuid
                            0, // userNo (typically 0)
                            userId // payUserId (same as userId)
                          );
                          console.log('Card registration result:', result);
                          setCurrentStep(2);
                        } else {
                          // On Android or if no userId, just proceed to completion
                          setCurrentStep(2);
                        }
                      } catch (error: any) {
                        console.error('Card registration error:', error);
                        Alert.alert(
                          'エラー',
                          error?.message || 'カード登録に失敗しました。もう一度お試しください。',
                          [{ text: 'OK' }]
                        );
                      } finally {
                        setIsRegistering(false);
                      }
                    }}
                    disabled={isSubmitting || isRegistering}
                    style={{
                      borderRadius: 10,
                      height: 56,
                      marginTop: 40,
                      width: '100%',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: (isSubmitting || isRegistering) ? 0.7 : 1,
                      ...Platform.select({
                        ios: {
                          shadowColor: '#000',
                          shadowOffset: {
                            width: 0,
                            height: -1,
                          },
                          shadowOpacity: 0.1,
                          shadowRadius: 20,
                        },
                        android: {
                          elevation: 3,
                        },
                      }),
                    }}
                  >
                    <LinearGradient
                      colors={['#F6575D', '#D5242A']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 0, y: 0 }}
                      style={{
                        position: 'absolute',
                        borderRadius: 10,
                        height: 56,
                        width: '100%',
                      }}
                    />
                    {isRegistering ? (
                      <ActivityIndicator color={colors.wt1} />
                    ) : (
                      <Text
                        sx={{
                          ...textStyle.H_W6_15,
                          color: colors.wt1,
                        }}
                      >
                        送信
                      </Text>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      setCurrentStep(0);
                    }}
                    style={{
                      borderRadius: 10,
                      height: 56,
                      width: '100%',
                      borderWidth: 1,
                      marginTop: 16,
                      borderColor: colors.rd,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text
                      sx={{
                        ...textStyle.H_W6_15,
                        color: colors.rd,
                      }}
                    >
                      戻る
                    </Text>
                  </TouchableOpacity>
                </VStack>
              )}

              {currentStep === 2 && (
                <VStack paddingHorizontal={16}>
                  <Text
                    sx={{
                      ...textStyle.H_W6_15,
                      color: colors.gr2,
                      mt: 32,
                      mb: 40,
                      flexWrap: 'wrap',
                      textAlign: 'center',
                    }}
                  >
                    クレジットカードの登録が終了しました。
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      router.back();
                    }}
                    style={{
                      borderRadius: 10,
                      height: 56,
                      width: '100%',
                      borderWidth: 1,
                      marginTop: 16,
                      borderColor: colors.rd,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text
                      sx={{
                        ...textStyle.H_W6_15,
                        color: colors.rd,
                      }}
                    >
                      閉じる
                    </Text>
                  </TouchableOpacity>
                </VStack>
              )}
            </VStack>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaProvider>
  );
};

export default CardRegistration;
