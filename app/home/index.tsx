import {
  Center,
  HStack,
  Image,
  ScrollView,
  Text,
  VStack
} from '@gluestack-ui/themed';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, NativeModules, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BannerSlider, Card } from '../../src/components';
import { useAppDispatch, useAppSelector } from '../../src/redux/hooks';
import { clearRegistration, setCertificates, setUserId } from '../../src/redux/slice/auth/registrationSlice';
import { RootState } from '../../src/redux/store';
import { useLazyGetUserProfileQuery } from '../../src/services/appApi';
import { colors } from '../../src/theme/colors';
import { textStyle } from '../../src/theme/text-style';
import type { YellPayModule } from '../../src/types/YellPay';

const { YellPay }: { YellPay: YellPayModule } = NativeModules;

let hasInitializedHome = false;

const Home = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { userId, token, user, certificates, isAuthenticated } = useAppSelector((state: RootState) => state.registration);
  const [getUserProfile, { isLoading: isProfileLoading }] = useLazyGetUserProfileQuery();
  console.log('userId', userId, 'user', user);

  // Combined initialization: Initialize SDK first, then validate token
  useEffect(() => {
    if (hasInitializedHome) {
      setIsLoading(false);
      return;
    }

    const initializeApp = async () => {
      try {
        setIsLoading(true);


        // Note: Authentication is NOT required for getUserInfo or basic SDK operations
        // Authentication is only needed for autoAuth methods, not for getUserInfo
        // Skip authentication entirely - it's not needed

        // Step 2: Initialize SDK (authentication is optional, proceed regardless)
        if (!userId) {
          console.log('Initializing SDK...');

          // Check if we have a registered user with ID from backend
          if (user?.id) {
            console.log('Using existing userId from backend:', user.id);
            try {
              // Use your existing userId from backend
              const sdkUserId = await YellPay.initUserWithIdProduction(user.id);
              dispatch(setUserId(sdkUserId));
              console.log('SDK initialized with existing userId:', sdkUserId);
            } catch (error) {
              console.error('Error initializing with existing userId, falling back to SDK generation:', error);
              // Fallback: Let SDK generate new userId
              const newUserId = await YellPay.initUserProduction();
              dispatch(setUserId(newUserId));
              console.log('SDK generated new userId:', newUserId);
            }
          } else {
            // No existing userId, let SDK generate one
            console.log('No existing userId, generating new one via SDK');
            const newUserId = await YellPay.initUserProduction();
            dispatch(setUserId(newUserId));
            console.log('SDK generated new userId:', newUserId);
          }
        } else {
          console.log('UserId already exists in state:', userId);
        }

        // Get User Info from YellPay SDK (certificates)
        // Note: Certificates are created when user registers a card via registerCard()
        if (userId) {
          try {
            console.log('📊 Calling YellPay.getUserInfo for userId:', userId);
            const certificates = await YellPay.getUserInfo(userId);
            console.log('test data', certificates);
            // Handle both array and string responses
            const certArray = Array.isArray(certificates) ? certificates : [];

            if (certArray.length > 0) {
              console.log(`✅ Found ${certArray.length} certificate(s):`);
              certArray.forEach((cert: any, index: number) => {
                console.log(`   Certificate ${index + 1}:`, cert);
              });

              // Store certificates in Redux
              dispatch(setCertificates(certArray));
              console.log('✅ Certificates stored in Redux state');
            } else {
              console.log('ℹ️  No certificates found. User needs to register a card first via registerCard()');
              // Clear certificates in Redux if empty
              dispatch(setCertificates([]));
            }
          } catch (error) {
            console.error('❌ getUserInfo error:', error);
            // Clear certificates on error
            dispatch(setCertificates([]));
          }
        }

        // Step 2: Validate token if it exists
        if (token) {
          console.log('Validating token...');
          try {
            const result = await getUserProfile().unwrap();
            console.log('Token validation successful:', result);
          } catch (error: any) {
            console.error('Token validation failed:', error);

            // If token is invalid, clear registration and redirect to login
            if (error?.status === 401 || error?.status === 403) {
              Alert.alert(
                'セッション期限切れ',
                'ログインセッションが期限切れです。再度ログインしてください。',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      dispatch(clearRegistration());
                      router.replace('/login');
                    },
                  },
                ]
              );
            } else {
              // Other errors - show generic error
              Alert.alert(
                'エラー',
                'プロフィールの取得に失敗しました。',
                [{ text: 'OK' }]
              );
            }
          }
        } else {
          console.log('No token found, skipping validation');
        }
      } catch (error) {
        console.error('App initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
    hasInitializedHome = true;
  }, []); // Empty deps array - only run once on mount

  // Handle pull-to-refresh
  const onRefresh = async () => {
    try {
      setRefreshing(true);

      // Refresh certificates if userId exists
      if (userId) {
        try {
          console.log('📊 Refreshing certificates for userId:', userId);
          const certificates = await YellPay.getUserInfo(userId);
          console.log('Refreshed certificates:', certificates);
          // Handle both array and string responses
          const certArray = Array.isArray(certificates) ? certificates : [];

          if (certArray.length > 0) {
            console.log(`✅ Found ${certArray.length} certificate(s):`);
            certArray.forEach((cert: any, index: number) => {
              console.log(`   Certificate ${index + 1}:`, cert);
            });

            // Store certificates in Redux
            dispatch(setCertificates(certArray));
            console.log('✅ Certificates stored in Redux state');
          } else {
            console.log('ℹ️  No certificates found.');
            // Clear certificates in Redux if empty
            dispatch(setCertificates([]));
          }
        } catch (error) {
          console.error('❌ getUserInfo error:', error);
          // Clear certificates on error
          dispatch(setCertificates([]));
        }
      }

      // Refresh user profile if token exists
      if (token) {
        try {
          const result = await getUserProfile().unwrap();
          console.log('Profile refresh successful:', result);
        } catch (error: any) {
          console.error('Profile refresh failed:', error);

          // If token is invalid, clear registration and redirect to login
          if (error?.status === 401 || error?.status === 403) {
            Alert.alert(
              'セッション期限切れ',
              'ログインセッションが期限切れです。再度ログインしてください。',
              [
                {
                  text: 'OK',
                  onPress: () => {
                    dispatch(clearRegistration());
                    router.replace('/login');
                  },
                },
              ]
            );
          }
        }
      }
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  };
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

  if (isLoading || isProfileLoading) {
    return <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
      <Center flex={1} justifyContent="center" alignItems="center">
        <ActivityIndicator color={colors.rd} />
      </Center>
    </SafeAreaView>;
  }
  console.log('certificates', certificates);
  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
      <ScrollView
        style={{ backgroundColor: colors.wt, flex: 1 }}
        contentContainerStyle={{ paddingBottom: 120 }}
        contentInsetAdjustmentBehavior="never"
        automaticallyAdjustContentInsets={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.rd}
            colors={[colors.rd]}
          />
        }
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
        <VStack backgroundColor={colors.gr4} >
          {
            certificates && certificates.length > 0 && (certificates[0]?.status === 1) ?
              <Card cardType={"registered"} /> : <Card />
          }
          {/* <Card cardType="visa" /> */}
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
        <VStack gap={16}>
          {
            certificates && certificates.length > 0 && (certificates[0]?.status === 1) ?
              <></> : <BannerSlider
                images={[
                  // '../../assets/images/banner-1.png',
                  '../../assets/images/banner-2.png',
                ]}
              />
          }
          <BannerSlider
            images={[
              '../../assets/images/banner-1.png',
              // '../../assets/images/banner-2.png',
            ]}
          />
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;
