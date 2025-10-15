import { Icon, KeyboardAvoidingView, ScrollView, VStack } from '@gluestack-ui/themed';
import { Stack } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import React, { useState } from 'react';
import { Platform, TouchableOpacity } from 'react-native';
import RegistrationConfirmView from '../../src/components/RegistrationConfirmView';
import RegistrationForm from '../../src/components/RegistrationForm';
import { Safe } from '../../src/components/Safe';
import { colors } from '../../src/theme/colors';
import { RegistrationFormData } from '../../src/types/registration';

const RegistrationFormScreen = () => {
  const [formData, setFormData] = useState<RegistrationFormData | null>(null);
  const [activeIndex, setActiveIndex] = useState(2);
  const totalSteps = 4;

  const handleNext = () => {
    if (activeIndex < totalSteps - 1) {
      setActiveIndex(activeIndex + 1);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Stack.Screen options={{
        headerShown: true,
        headerLeft: () =>
          activeIndex === 2 ?
            <></> : (
              <TouchableOpacity
                onPress={() => {
                  setActiveIndex(activeIndex - 1);
                }}
              >
                <Icon as={ChevronLeft} color={colors.rd} size="lg" />
              </TouchableOpacity>
            ),
        headerTitle: '会員情報登録',
        headerTitleAlign: 'center',
        headerTitleStyle: {
          fontFamily: 'Hiragino Sans Bold',
          fontWeight: 600,
          color: colors.rd,
          fontSize: 18,
        },
      }} />
      <Safe>
        <VStack flex={1}>
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              zIndex: 1000,
            }}
          >
            {activeIndex === 2 && (
              <RegistrationForm
                totalSteps={totalSteps}
                activeIndex={activeIndex}
                handleNext={handleNext}
                setFormData={setFormData}
              />
            )}
            {activeIndex === 3 && formData && (
              <RegistrationConfirmView
                formData={formData}
                totalSteps={totalSteps}
                activeIndex={activeIndex}
                handleNext={handleNext}
              />
            )}
          </ScrollView>
        </VStack>
      </Safe>
    </KeyboardAvoidingView>
  );
};

export default RegistrationFormScreen;


