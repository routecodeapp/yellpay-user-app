import { Icon, SafeAreaView } from '@gluestack-ui/themed';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ChevronLeft } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';
import YellPayDemo from '../../src/components/YellPayDemo';
import { colors } from '../../src/theme/colors';
const TermsOfServices = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <Stack.Screen
        options={{
          title: 'YellPay SDK Demo',
          headerShown: true,
          headerTitle: 'YellPay SDK Demo',
          headerTitleAlign: 'center',
          headerTitleStyle: {
            fontFamily: 'Roboto Medium',
            fontWeight: '600',
            fontSize: 18,
          },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Icon as={ChevronLeft} color={colors.rd} size="lg" />
            </TouchableOpacity>
          ),
        }}
      />
      {/* <YellPayStepByStepDemo /> */}
      <YellPayDemo />
      {/* <YellPayWorkflow /> */}
    </SafeAreaView>
  );
};

export default TermsOfServices;
