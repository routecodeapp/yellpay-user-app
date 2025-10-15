import {
  Button,
  CheckIcon,
  HStack,
  Icon,
  ScrollView,
  Text,
  View,
  VStack,
} from '@gluestack-ui/themed';
import { Checkbox } from 'expo-checkbox';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import { setRegistration } from '../redux/slice/auth/registrationSlice';
import { RegistrationRequest, useRegisterUserMutation } from '../services/appApi';
import { colors } from '../theme/colors';
import { textStyle } from '../theme/text-style';
import { RegistrationFormData } from '../types/registration';
import { getDeviceInfo } from '../utils/deviceUtils';
import Indicator from './Indicator';
import LabelWithRequired from './LabelWIthRequired';

const RegistrationConfirmView = ({
  formData,
  totalSteps,
  activeIndex,
  handleNext,
}: {
  formData: RegistrationFormData;
  totalSteps: number;
  activeIndex: number;
  handleNext: () => void;
}) => {
  const [isAgreed, setIsAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();
  const [registerUser] = useRegisterUserMutation();

  const handleRegistration = async () => {
    if (!isAgreed) {
      Alert.alert('エラー', '利用規約に同意してください');
      return;
    }

    setIsSubmitting(true);

    try {
      // Get device information
      const deviceInfo = await getDeviceInfo();

      // Prepare registration data
      const registrationData: RegistrationRequest = {
        name: formData.name,
        furigana: formData.furigana.toString(),
        phone_number: formData.phoneNumber,
        email: formData.email,
        occupation: formData.work,
        support_classification: formData.employmentSupportClassification,
        device_type: deviceInfo.deviceType,
        device_id: deviceInfo.deviceId,
        postal_code: `${formData.postalCodePart1}${formData.postalCodePart2}`,
        prefecture: formData.prefecture,
        city: formData.city,
        street_number: formData.streetAddress,
        building_name: formData.building || '',
        referrer_code: formData.referralCode || "",
      };
      console.log(registrationData);
      // Call the registration API
      const response = await registerUser(registrationData).unwrap();
      // Store user data in Redux
      dispatch(setRegistration({
        name: response.data.user.name,
        email: response.data.user.email,
        token: response.data.access_token,
        user: response.data.user,
      }));

      // Show success alert
      Alert.alert('登録完了', '会員情報の登録が完了しました', [
        {
          text: 'OK',
          onPress: () => router.dismissTo('/confirm-register'),
        },
      ]);

    } catch (error: any) {
      console.error('Registration error:', error);

      // Handle API errors
      if (error?.data?.errors) {
        // Show validation errors
        const errorMessages = Object.values(error.data.errors).flat();
        Alert.alert('登録エラー', errorMessages.join(', '));
      } else {
        // Show generic error
        Alert.alert('登録エラー', error?.data?.message || '登録に失敗しました。もう一度お試しください。');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{
          paddingBottom: 100,
          flexGrow: 1,
          zIndex: 1000,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <VStack flex={1} px={8}>
          {/* <Text
            sx={{
              ...textStyle.H_W6_20,
              textAlign: 'center',
              py: 48,
              color: colors.rd,
            }}
          >
            会員情報登録
          </Text> */}

          <VStack>
            <LabelWithRequired label="お名前" required={false} />
            <Text
              sx={{
                ...textStyle.H_W3_15,
                color: colors.gr2,
                px: 16,
                pt: 6,
                pb: 16,
              }}
            >
              {formData.name}
            </Text>

            <LabelWithRequired label="ふりがな" required={false} />
            <Text
              sx={{
                ...textStyle.H_W3_15,
                color: colors.gr2,
                px: 16,
                pt: 6,
                pb: 16,
              }}
            >
              {formData.furigana}
            </Text>

            <LabelWithRequired label="電話番号" required={false} />
            <Text
              sx={{
                ...textStyle.H_W3_15,
                color: colors.gr2,
                px: 16,
                pt: 6,
                pb: 16,
              }}
            >
              {formData.phoneNumber.replace(
                /(\d{3})(\d{4})(\d{4}|\d{3})/,
                '$1-$2-$3'
              )}
            </Text>

            <LabelWithRequired label="メールアドレス" required={false} />
            <Text
              sx={{
                ...textStyle.H_W3_15,
                color: colors.gr2,
                px: 16,
                pt: 6,
                pb: 16,
              }}
            >
              {formData.email}
            </Text>

            <LabelWithRequired label="郵便番号" required={false} />
            <Text
              sx={{
                ...textStyle.H_W3_15,
                color: colors.gr2,
                px: 16,
                pt: 6,
                pb: 16,
              }}
            >
              {formData.postalCodePart1}-{formData.postalCodePart2}
            </Text>

            <LabelWithRequired label="都道府県" required={false} />
            <Text
              sx={{
                ...textStyle.H_W3_15,
                color: colors.gr2,
                px: 16,
                pt: 6,
                pb: 16,
              }}
            >
              {formData.prefecture}
            </Text>

            <LabelWithRequired label="市区町村" required={false} />
            <Text
              sx={{
                ...textStyle.H_W3_15,
                color: colors.gr2,
                px: 16,
                pt: 6,
                pb: 16,
              }}
            >
              {formData.city}
            </Text>

            <LabelWithRequired label="番地" required={false} />
            <Text
              sx={{
                ...textStyle.H_W3_15,
                color: colors.gr2,
                px: 16,
                pt: 6,
                pb: 16,
              }}
            >
              {formData.streetAddress}
            </Text>

            <LabelWithRequired label="建物名" required={false} />
            <Text
              sx={{
                ...textStyle.H_W3_15,
                color: colors.gr2,
                px: 16,
                pt: 6,
                pb: 16,
              }}
            >
              {formData.building}
            </Text>

            <LabelWithRequired label="勤務先" required={false} />
            <Text
              sx={{
                ...textStyle.H_W3_15,
                color: colors.gr2,
                px: 16,
                pt: 6,
                pb: 16,
              }}
            >
              {formData.work}
            </Text>

            <LabelWithRequired label="雇用支援区分" required={false} />
            <Text
              sx={{
                ...textStyle.H_W3_15,
                color: colors.gr2,
                px: 16,
                pt: 6,
                pb: 16,
              }}
            >
              {formData.employmentSupportClassification}
            </Text>

            <LabelWithRequired label="招待コード" required={false} />
            <Text
              sx={{
                ...textStyle.H_W3_15,
                color: colors.gr2,
                px: 16,
                pt: 6,
                pb: 16,
              }}
            >
              {formData.referralCode}
            </Text>
          </VStack>

          <VStack alignItems="center" mt={40}>
            <Text
              sx={{
                ...textStyle.H_W6_14,
                color: colors.blu1,
                px: 16,
                pt: 6,
              }}
            >
              利用規約
            </Text>
            <Text
              sx={{
                ...textStyle.H_W6_14,
                color: colors.blu1,
                px: 16,
                pt: 8,
                pb: 16,
              }}
            >
              YELL PAYとプライバシーについて
            </Text>
          </VStack>
        </VStack>
        <HStack
          alignItems="center"
          justifyContent="center"
          mt={16}
          mb={16}
          gap={8}
          onMagicTap={() => setIsAgreed(!isAgreed)}
        >
          <View position="relative">
            <Checkbox
              value={isAgreed}
              onValueChange={setIsAgreed}
              style={{
                width: 24,
                height: 24,
                borderRadius: 4,
                marginTop: 3,
                borderWidth: 2,
                borderColor: colors.gr3,
                zIndex: 1000,
              }}
              color={isAgreed ? colors.rd : colors.gr3}
            />
            {!isAgreed && (
              <View position="absolute" top={5} left={2}>
                <Icon as={CheckIcon} color={colors.gr3} size="lg" />
              </View>
            )}
          </View>
          <Text>利用規約に同意する</Text>
        </HStack>
        <VStack alignItems="center">
          <Button
            mt={30}
            variant="solid"
            isDisabled={!isAgreed || isSubmitting}
            sx={{
              borderColor: isAgreed && !isSubmitting ? colors.rd : colors.gr3,
              backgroundColor: isAgreed && !isSubmitting ? colors.rd : colors.gr3,
              borderRadius: 10,
              paddingHorizontal: 24,
              paddingVertical: 12,
              width: '100%',
              height: 52,
              opacity: 1,
              boxShadow: isAgreed && !isSubmitting ? '0px 0px 10px 0px #D5242A4F' : 'none',
            }}
            onPress={handleRegistration}
          >
            <Text
              sx={{
                ...textStyle.H_W6_15,
                color: colors.wt1,
              }}
            >
              {isSubmitting ? '登録中...' : '登録を完了する'}
            </Text>
          </Button>
        </VStack>
        <View style={{ position: 'absolute', bottom: 0, width: '100%' }}>
          <Indicator total={totalSteps} activeIndex={activeIndex} />
        </View>
      </ScrollView>
    </View>
  );
};

export default RegistrationConfirmView;
