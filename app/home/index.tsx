import {
  HStack,
  Image,
  SafeAreaView,
  ScrollView,
  Spinner,
  Text,
  VStack
} from '@gluestack-ui/themed';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { NativeModules, TouchableOpacity } from 'react-native';
import { BannerSlider, BottomNavigation, Card } from '../../src/components';
import { useAppDispatch, useAppSelector } from '../../src/redux/hooks';
import { setUserId } from '../../src/redux/slice/auth/registrationSlice';
import { RootState } from '../../src/redux/store';
import { colors } from '../../src/theme/colors';
import { textStyle } from '../../src/theme/text-style';
import type { YellPayModule } from '../../src/types/YellPay';

const { YellPay }: { YellPay: YellPayModule } = NativeModules;

const Home = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const { userId } = useAppSelector((state: RootState) => state.registration);
  console.log('userId', userId);
  const handleCardManagement = async () => {
    // router.push('/card-management');
    if (!userId) {
      console.error('UserId is not set');
      return;
    }
    const result = await YellPay.cardSelect(userId);
    console.log('result', result);
  };

  const handleTransactionHistory = async () => {
    if (!userId) {
      console.error('UserId is not set');
      return;
    }
    const result = await YellPay.getHistory(userId);
    console.log('result', result);
  };

  const initUser = async () => {
    try {
      setIsLoading(true);
      const userId = await YellPay.initUser('yellpay');
      dispatch(setUserId(userId));
    } catch (error) {
      console.error('Init User', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) {
      setTimeout(() => {
        initUser();
      }, 500);
    } else {
      setIsLoading(false);
    }
  }, [userId]);

  if (isLoading) {
    return <Spinner color={colors.rd} />;
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        style={{ backgroundColor: colors.wt, flex: 1, paddingBottom: 200 }}
      >
        <StatusBar style="dark" />
        <Stack.Screen
          options={{
            title: 'Home',
            headerShown: true,
            headerTitle: 'Home',
            headerTitleAlign: 'center',
            headerTitleStyle: {
              fontFamily: 'Roboto Medium',
              fontWeight: '600',
              fontSize: 18,
            },
            headerLeft: () => <></>,
          }}
        />
        <VStack backgroundColor={colors.gr4}>
          <Card cardType="visa" />
          {/* <Card cardType="mastercard" />
          <Card cardType="jcb" />
          <Card cardType="amex" />
          <Card cardType="diners" /> */}
          {/* <Card /> */}
        </VStack>
        <VStack p={16} gap={16}>
          <HStack>
            <TouchableOpacity
              onPress={handleCardManagement}
              activeOpacity={0.8}
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 16,
                width: '48%',
                backgroundColor: colors.gr4,
                borderRadius: 10,
                marginRight: 11,
              }}
            >
              <Image
                alt="card-management"
                source={require('../../assets/images/card-management.png')}
                style={{ width: 48, height: 52 }}
              />
              <Text
                sx={{
                  ...textStyle.H_W6_13,
                  color: colors.gr1,
                  marginTop: 11,
                  textAlign: 'center',
                }}
              >
                カード管理
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleTransactionHistory}
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 16,
                width: '48%',
                backgroundColor: colors.gr4,
                borderRadius: 10,
              }}
            >
              <Image
                alt="transaction-history"
                source={require('../../assets/images/transaction-history.png')}
                style={{ width: 40, height: 40 }}
              />
              <Text
                sx={{
                  ...textStyle.H_W6_13,
                  color: colors.gr1,
                  paddingTop: 18,
                  textAlign: 'center',
                }}
              >
                取引履歴
              </Text>
            </TouchableOpacity>
          </HStack>
          <TouchableOpacity
            onPress={() => router.push('/shop-search')}
            activeOpacity={0.8}
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 16,
              backgroundColor: colors.gr4,
              borderRadius: 10,
            }}
          >
            <Image
              alt="find-store"
              source={require('../../assets/images/find-store.png')}
              style={{ width: 50, height: 35 }}
            />
            <Text
              sx={{
                ...textStyle.H_W6_13,
                color: colors.gr1,
                paddingTop: 18,
                textAlign: 'center',
              }}
            >
              近くの店舗を探す
            </Text>
          </TouchableOpacity>
        </VStack>
        <BannerSlider
          images={[
            '../../assets/images/banner-1.png',
            '../../assets/images/banner-2.png',
          ]}
        />
      </ScrollView>
      <BottomNavigation />
    </SafeAreaView>
  );
};

export default Home;
