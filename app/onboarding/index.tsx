import {
    KeyboardAvoidingView,
    Text,
    VStack
} from '@gluestack-ui/themed';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Platform } from 'react-native';
import OnboardingSlide from '../../src/components/OnboardingSlide';
import { Safe } from '../../src/components/Safe';
import { colors } from '../../src/theme/colors';

import { RegistrationFormData } from '../../src/types/registration';

const OnboardingScreen = () => {
  const [formData, setFormData] = useState<RegistrationFormData | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const totalSteps = 2;

  const handleNext = () => {
    if (activeIndex < totalSteps - 1) {
      setActiveIndex(activeIndex + 1);
    } else {
      router.push({
        pathname: '/login',
        params: {
          activeIndex: 1,
        },
      });
    }
  };

  const handleLogin = () => {
    router.push('/login');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Safe>
        <VStack flex={1}>
          {activeIndex === 0 && (
            <OnboardingSlide
              topImage={{
                source: require('../../assets/images/onboarding-one.png'),
                width: 302,
                height: 299,
              }}
              logoImage={{
                source: require('../../assets/images/company-logo.png'),
                width: 173,
                height: 56,
              }}
              titlePrimary={{ text: '障がい者手帳をスマホで登録！' }}
              description={
                <>
                  アプリに障がい者手帳を登録しておくと、
                  スマホ決済でも障がい者割引が受けられる! 全国○○○箇所で利用可能!
                </>
              }
              button={{
                text: '次へ',
                variant: 'outline',
                onPress: handleNext,
              }}
            />
          )}

          {activeIndex === 1 && (
            <OnboardingSlide
              topImage={{
                source: require('../../assets/images/onboarding-two.png'),
                width: 302,
                height: 299,
              }}
              titlePrimary={{
                text: 'お買い物完了まで数秒程度の',
                color: colors.gr1,
              }}
              titleSecondary={{ text: 'カンタン決済！' }}
              description={
                <>
                  アプリへのクレジットカード登録することで お買い物の際{' '}
                  <Text sx={{ color: colors.rd }}>
                    “キャッシュレス・カードレス”
                  </Text>{' '}
                  での支払いが可能に！
                </>
              }
              button={{
                text: '新規会員登録へ',
                variant: 'solid',
                onPress: handleNext,
                color: colors.wt1,
              }}
              button2={{
                text: 'ログイン',
                variant: 'outline',
                onPress: handleLogin,
                color: colors.rd,
              }}
            />
          )}
          {/* Registration is handled in /registration-form after OTP verification */}
        </VStack>
        {/* {activeIndex !== 2 && activeIndex !== 3 && (
          <Indicator total={totalSteps} activeIndex={activeIndex} />
        )} */}
      </Safe>
    </KeyboardAvoidingView>
  );
};

export default OnboardingScreen;