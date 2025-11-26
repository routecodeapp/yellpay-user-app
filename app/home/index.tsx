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
import { clearRegistration, setCertificates, setUser, setUserId } from '../../src/redux/slice/auth/registrationSlice';
import { RootState } from '../../src/redux/store';
import { useLazyGetUserProfileQuery, useUpdateSdkIdMutation } from '../../src/services/appApi';
import { colors } from '../../src/theme/colors';
import { textStyle } from '../../src/theme/text-style';
import type { YellPayModule } from '../../src/types/YellPay';

const { YellPay }: { YellPay: YellPayModule } = NativeModules;

let hasInitializedHome = false;

// Reset initialization flag when needed (e.g., after logout)
export const resetHomeInitialization = () => {
  hasInitializedHome = false;
};

const Home = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { token, user, certificates, isAuthenticated, userId } = useAppSelector((state: RootState) => state.registration);
  const [getUserProfile, { isLoading: isProfileLoading }] = useLazyGetUserProfileQuery();
  const [updateSdkId] = useUpdateSdkIdMutation();
  console.log('user', user);

  // Combined initialization: Initialize SDK first, then validate token
  useEffect(() => {
    // Always initialize if we don't have a userId, even if hasInitializedHome is true
    // This ensures userId is generated after login/registration
    if (hasInitializedHome && userId) {
      setIsLoading(false);
      return;
    }

    const initializeApp = async () => {
      try {
        setIsLoading(true);


        // Note: Authentication is NOT required for getUserInfo or basic SDK operations
        // Authentication is only needed for autoAuth methods, not for getUserInfo
        // Skip authentication entirely - it's not needed

        // Step 1: Determine User ID (Local -> Backend -> SDK New)
        let resolvedUserId: string | null = userId;

        // If no local ID, try to recover from backend if we have a token
        if (!resolvedUserId && token) {
          console.log('No local userId, attempting to recover from profile...');
          try {
            const result = await getUserProfile(undefined, false).unwrap();
            if (result.status === 'success' && result.data) {
              dispatch(setUser(result.data));
              if (result.data.yellpay_sdk_id) {
                resolvedUserId = result.data.yellpay_sdk_id;
                dispatch(setUserId(resolvedUserId));
                console.log('✅ Recovered userId from profile:', resolvedUserId);
              }
            }
          } catch (err) {
            console.warn('Failed to recover userId from profile:', err);
          }
        }

        // If STILL no ID, generate new one from SDK
        if (!resolvedUserId) {
          console.log('Initializing SDK (generating new userId)...');
          try {
            // Always obtain the active userId directly from the SDK
            const newSdkId = await YellPay.initUserProduction();
            if (newSdkId) {
              resolvedUserId = newSdkId;
              dispatch(setUserId(resolvedUserId));
              console.log('SDK generated new userId:', resolvedUserId);
            }
          } catch (error) {
            console.error('Error initializing SDK userId:', error);
            throw error;
          }
        } else {
          console.log('Using existing userId:', resolvedUserId);
        }

        // Get User Info from YellPay SDK (certificates)
        // Note: Certificates are created when user registers a card via registerCard()
        if (resolvedUserId) {
          try {
            console.log('📊 Calling YellPay.getUserInfo for userId:', resolvedUserId);
            const certificates = await YellPay.getUserInfo(resolvedUserId);
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

        // Step 2: Validate token if it exists and sync SDK ID
        if (token) {
          console.log('Validating token...');
          try {
            const result = await getUserProfile(undefined, false).unwrap();
            console.log('Token validation successful:', result);

            // Update user data in Redux store with all the new fields
            if (result.status === 'success' && result.data) {
              dispatch(setUser(result.data));
              console.log('User data updated in Redux:', result.data);

              // Step 3: Check and sync SDK ID if needed
              if (resolvedUserId && result.data.id) {
                const profileSdkId = result.data.yellpay_sdk_id || null;
                const needsUpdate = !profileSdkId || resolvedUserId !== profileSdkId;

                console.log('🔍 Comparing SDK IDs:', {
                  sdkUserId: resolvedUserId,
                  profileSdkId: profileSdkId,
                  match: !needsUpdate,
                  needsUpdate: needsUpdate,
                });

                if (needsUpdate) {
                  console.log('⚠️ SDK IDs do not match or missing. Updating backend...');
                  console.log('📋 Update details:', {
                    userId: result.data.id,
                    sdkId: resolvedUserId,
                    hasToken: !!token,
                    userRegistered: result.data.registration_complete === 'YES',
                  });

                  // Only update if user is registered and we have a valid SDK ID
                  if (!resolvedUserId || !token) {
                    console.warn('⚠️ Skipping SDK ID update - missing SDK ID or token');
                  } else if (result.data.registration_complete !== 'YES') {
                    console.warn('⚠️ Skipping SDK ID update - user registration not complete');
                  } else {
                    // Add a small delay to ensure backend is ready
                    await new Promise(resolve => setTimeout(resolve, 500));

                    try {
                      console.log('📤 Calling updateSdkId with:', {
                        sdkid: resolvedUserId,
                        userId: result.data.id,
                        registrationComplete: result.data.registration_complete,
                      });

                      const updateResult = await updateSdkId({
                        yellpayUserId: result.data.id, // Not used in URL but kept for consistency
                        sdkid: resolvedUserId, // SDK user ID in body
                      }).unwrap();

                      console.log('✅ SDK ID update response:', updateResult);

                      if (updateResult.status === 'success' && updateResult.data?.user) {
                        console.log('✅ SDK ID updated successfully:', updateResult.data.user);
                        dispatch(setUser(updateResult.data.user));
                      }
                    } catch (sdkUpdateError: any) {
                      console.error('❌ Failed to update SDK ID:', {
                        error: sdkUpdateError,
                        status: sdkUpdateError?.status,
                        message: sdkUpdateError?.data?.message,
                        url: sdkUpdateError?.url,
                        responseData: sdkUpdateError?.data,
                      });
                      // Don't show error to user, just log it - backend might not be ready yet
                    }
                  }
                } else {
                  console.log('✅ SDK IDs match, no update needed');
                }
              }
            }
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
                      hasInitializedHome = false; // Reset initialization flag on logout
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
  }, [token, userId]); // Re-run if token or userId changes (e.g., after login/registration)

  // Handle pull-to-refresh
  const onRefresh = async () => {
    try {
      setRefreshing(true);

      // Use existing userId instead of generating a new one
      let refreshSdkUserId: string | null = userId;
      
      if (!refreshSdkUserId) {
         console.log('⚠️ No userId found during refresh. Attempting to recover...');
         // Try to generate if missing
         try {
             refreshSdkUserId = await YellPay.initUserProduction();
             if (refreshSdkUserId) {
                 dispatch(setUserId(refreshSdkUserId));
             }
         } catch (e) {
             console.error('Failed to generate userId during refresh:', e);
         }
      }

      if (refreshSdkUserId) {
        try {
          console.log('📊 Refreshing certificates for SDK userId:', refreshSdkUserId);

          const certificates = await YellPay.getUserInfo(refreshSdkUserId);
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
          console.error('❌ Error getting SDK userId or certificates:', error);
          // Clear certificates on error
          dispatch(setCertificates([]));
        }
      }

      // Refresh user profile if token exists
      if (token && refreshSdkUserId) {
        try {
          const result = await getUserProfile(undefined, false).unwrap();
          console.log('Profile refresh successful:', result);

          // Update user data in Redux store with all the new fields
          if (result.status === 'success' && result.data) {
            dispatch(setUser(result.data));
            console.log('User data updated in Redux:', result.data);

            // Check and sync SDK ID if needed - use fresh SDK ID from refresh
            if (refreshSdkUserId && result.data.id) {
              const profileSdkId = result.data.yellpay_sdk_id || null;
              const needsUpdate = !profileSdkId || refreshSdkUserId !== profileSdkId;

              console.log('🔍 Comparing SDK IDs (refresh):', {
                sdkUserId: refreshSdkUserId,
                profileSdkId: profileSdkId,
                match: !needsUpdate,
                needsUpdate: needsUpdate,
              });

              if (needsUpdate) {
                console.log('⚠️ SDK IDs do not match or missing. Updating backend...');
                console.log('📋 Update details (refresh):', {
                  userId: result.data.id,
                  sdkId: refreshSdkUserId,
                  hasToken: !!token,
                  userRegistered: result.data.registration_complete === 'YES',
                });

                // Only update if user is registered and we have a valid SDK ID
                if (!refreshSdkUserId || !token) {
                  console.warn('⚠️ Skipping SDK ID update (refresh) - missing SDK ID or token');
                } else if (result.data.registration_complete !== 'YES') {
                  console.warn('⚠️ Skipping SDK ID update (refresh) - user registration not complete');
                } else {
                  // Add a small delay to ensure backend is ready
                  await new Promise(resolve => setTimeout(resolve, 500));

                  try {
                    console.log('📤 Calling updateSdkId (refresh) with:', {
                      sdkid: refreshSdkUserId,
                      userId: result.data.id,
                      registrationComplete: result.data.registration_complete,
                    });

                    const updateResult = await updateSdkId({
                      yellpayUserId: result.data.id, // Not used in URL but kept for consistency
                      sdkid: refreshSdkUserId, // SDK user ID in body
                    }).unwrap();

                    console.log('✅ SDK ID update response (refresh):', updateResult);

                    if (updateResult.status === 'success' && updateResult.data?.user) {
                      console.log('✅ SDK ID updated successfully (refresh):', updateResult.data.user);
                      dispatch(setUser(updateResult.data.user));
                    }
                  } catch (sdkUpdateError: any) {
                    console.error('❌ Failed to update SDK ID (refresh):', {
                      error: sdkUpdateError,
                      status: sdkUpdateError?.status,
                      message: sdkUpdateError?.data?.message,
                      url: sdkUpdateError?.url,
                      responseData: sdkUpdateError?.data,
                    });
                    // Don't show error to user, just log it - backend might not be ready yet
                  }
                }
              } else {
                console.log('✅ SDK IDs match, no update needed (refresh)');
              }
            }
          }
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
                    hasInitializedHome = false; // Reset initialization flag on logout
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
    try {
      const sdkUserId = await YellPay.initUserProduction();
      if (!sdkUserId) {
        console.error('SDK UserId is not available');
        return;
      }
      const result = await YellPay.cardSelect(sdkUserId);
      console.log('result', result);
    } catch (error) {
      console.error('Error in handleCardManagement:', error);
    }
  };

  const handleTransactionHistory = async () => {
    try {
      const sdkUserId = await YellPay.initUserProduction();
      if (!sdkUserId) {
        console.error('SDK UserId is not available');
        return;
      }
      const result = await YellPay.getHistory(sdkUserId);
      console.log('result', result);
    } catch (error) {
      console.error('Error in handleTransactionHistory:', error);
    }
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
            title: 'HOME',
            headerShown: true,
            headerTitle: 'HOME',
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
