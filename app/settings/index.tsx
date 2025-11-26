import {
  Divider,
  HStack,
  Icon,
  Image,
  SafeAreaView,
  ScrollView,
  Spinner,
  Text,
  VStack,
} from '@gluestack-ui/themed';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ChevronRight, Pen, User } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Alert, AppState, InteractionManager, Linking, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../../src/redux/hooks';
import { clearRegistration, setUser } from '../../src/redux/slice/auth/registrationSlice';
import { RootState } from '../../src/redux/store';
import { useLazyGetUserProfileQuery, useUpdateAvatarMutation } from '../../src/services/appApi';
import { colors } from '../../src/theme/colors';
import { textStyle } from '../../src/theme/text-style';

const styles = StyleSheet.create({
  avatarContainer: {
    position: 'relative',
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    backgroundColor: colors.line || '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 32,
    fontWeight: '600',
    color: colors.wt,
    fontFamily: 'Roboto Medium',
  },
  penIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.rd,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.wt,
  },
});

const Settings = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, token } = useAppSelector((state: RootState) => state.registration);
  const [profileImage, setProfileImage] = useState<string | null>(
    user?.avatar || null
  );
  const [updateAvatar, { isLoading: isUploading }] = useUpdateAvatarMutation();
  const [getUserProfile] = useLazyGetUserProfileQuery();

  // Update profile image when user changes
  useEffect(() => {
    if (user?.avatar) {
      setProfileImage(user.avatar);
    }
  }, [user?.avatar]);

  const uploadAvatar = async (imageUri: string) => {
    try {
      const result = await updateAvatar({ avatarUri: imageUri }).unwrap();
      if (result.status === 'success' && result.data) {
        // Update user in Redux store with all fields from API response
        dispatch(setUser(result.data));
        setProfileImage(result.data.avatar || imageUri);

        // Also refresh the full profile to ensure we have all the latest data
        try {
          const profileResult = await getUserProfile(undefined, false).unwrap();
          if (profileResult.status === 'success' && profileResult.data) {
            dispatch(setUser(profileResult.data));
            setProfileImage(profileResult.data.avatar || imageUri);
          }
        } catch (profileError) {
          console.error('Error refreshing profile:', profileError);
          // Don't show error for profile refresh, avatar upload was successful
        }

        Alert.alert('成功', 'プロフィール画像を更新しました。');
      }
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      Alert.alert(
        'エラー',
        error?.data?.message || '画像のアップロード中にエラーが発生しました。'
      );
    }
  };

  const handleCameraCapture = async () => {
    try {
      console.log('Requesting camera permissions...');
      console.log('Platform:', Platform.OS);

      // Verify ImagePicker module is available
      if (!ImagePicker || typeof ImagePicker.launchCameraAsync !== 'function') {
        console.error('ImagePicker module not available!');
        Alert.alert(
          'エラー',
          'カメラモジュールが利用できません。アプリを再ビルドしてください。'
        );
        return;
      }

      // Check if camera is available (Android specific check)
      if (Platform.OS === 'android') {
        const cameraAvailable = await ImagePicker.getCameraPermissionsAsync();
        console.log('Camera availability check:', cameraAvailable);
      }

      const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
      console.log('Camera permission status:', JSON.stringify(cameraStatus, null, 2));

      // expo-image-picker returns { granted: boolean, canAskAgain: boolean } or { status: string }
      const isGranted = cameraStatus.granted === true || cameraStatus.status === 'granted';

      if (!isGranted) {
        console.warn('Camera permission not granted:', cameraStatus);
        const canAskAgain = cameraStatus.canAskAgain !== false;
        if (!canAskAgain) {
          Alert.alert(
            '権限が必要',
            'カメラへのアクセス権限が必要です。設定アプリからカメラの許可を有効にしてください。',
            [
              { text: 'キャンセル', style: 'cancel' },
              {
                text: '設定を開く',
                onPress: async () => {
                  try {
                    await Linking.openSettings();
                  } catch (err) {
                    console.error('Error opening settings:', err);
                  }
                }
              },
            ]
          );
        } else {
          Alert.alert(
            '権限が必要',
            'カメラへのアクセス権限が必要です。'
          );
        }
        return;
      }

      console.log('Opening camera...');
      const cameraOptions: ImagePicker.ImagePickerOptions = {
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      };

      console.log('Camera options:', JSON.stringify(cameraOptions, null, 2));
      console.log('Platform:', Platform.OS);
      console.log('About to call launchCameraAsync...');
      console.log('App state:', AppState.currentState);

      // On Android, ensure we're not in an Alert context when launching camera
      if (Platform.OS === 'android') {
        // Small delay to ensure any Alert dialogs are fully dismissed
        await new Promise(resolve => setTimeout(resolve, 300));

        // Ensure app is in foreground
        if (AppState.currentState !== 'active') {
          console.warn('App is not in foreground, waiting...');
          await new Promise(resolve => {
            const subscription = AppState.addEventListener('change', (nextAppState) => {
              if (nextAppState === 'active') {
                subscription.remove();
                resolve(undefined);
              }
            });
            // Timeout after 2 seconds
            setTimeout(() => {
              subscription.remove();
              resolve(undefined);
            }, 2000);
          });
        }
      }

      // Wait for all interactions to complete before launching camera
      await new Promise(resolve => InteractionManager.runAfterInteractions(() => resolve(undefined)));

      // Additional delay for Android to ensure everything is ready
      if (Platform.OS === 'android') {
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      let result;
      try {
        console.log('Calling launchCameraAsync now...');
        console.log('ImagePicker module check:', {
          hasLaunchCameraAsync: typeof ImagePicker.launchCameraAsync === 'function',
          hasRequestPermissions: typeof ImagePicker.requestCameraPermissionsAsync === 'function',
          ImagePickerKeys: Object.keys(ImagePicker),
        });
        console.log('App state before launch:', AppState.currentState);

        // For Android, the native module might not be responding
        // This usually means the native module isn't properly linked
        if (Platform.OS === 'android') {
          console.log('Launching camera on Android...');

          // First, try to verify the module is actually callable
          try {
            // Test if we can call a simpler method first
            const permissions = await ImagePicker.getCameraPermissionsAsync();
            console.log('Camera permissions check successful:', permissions);
          } catch (permError) {
            console.error('Failed to check camera permissions - native module may not be linked:', permError);
            Alert.alert(
              'エラー',
              'カメラモジュールが正しくリンクされていません。アプリを再ビルドしてください。\n\nPlease rebuild the app: cd android && ./gradlew clean && cd .. && npx expo run:android'
            );
            return;
          }

          // Wrap in a promise that we can actually track
          result = await new Promise<ImagePicker.ImagePickerResult>((resolve, reject) => {
            // Set a timeout as backup
            const timeoutId = setTimeout(() => {
              console.error('Camera launch timeout - native module not responding');
              console.error('This usually means the native module is not properly linked.');
              console.error('Please rebuild the Android app: cd android && ./gradlew clean && cd .. && npx expo run:android');
              reject(new Error('Camera launch timeout - the native module may not be properly linked. Please rebuild the app.'));
            }, 10000);

            // Call the native function
            console.log('About to call launchCameraAsync...');
            const startTime = Date.now();
            ImagePicker.launchCameraAsync(cameraOptions)
              .then((cameraResult) => {
                const duration = Date.now() - startTime;
                console.log(`launchCameraAsync resolved after ${duration}ms:`, cameraResult);
                clearTimeout(timeoutId);
                resolve(cameraResult);
              })
              .catch((error) => {
                const duration = Date.now() - startTime;
                console.error(`launchCameraAsync rejected after ${duration}ms:`, error);
                clearTimeout(timeoutId);
                reject(error);
              });
          });

          console.log('launchCameraAsync returned successfully');
        } else {
          result = await ImagePicker.launchCameraAsync(cameraOptions);
          console.log('launchCameraAsync returned');
        }
      } catch (launchError) {
        console.error('launchCameraAsync threw an error:', launchError);
        console.error('Error type:', typeof launchError);
        if (launchError instanceof Error) {
          console.error('Error message:', launchError.message);
          console.error('Error stack:', launchError.stack);
        }
        console.error('Error details:', JSON.stringify(launchError, Object.getOwnPropertyNames(launchError), 2));

        // On Android, if camera fails, try alternative approach
        if (Platform.OS === 'android' && launchError instanceof Error) {
          if (launchError.message.includes('timeout')) {
            Alert.alert(
              'エラー',
              'カメラの起動に時間がかかりすぎています。アプリを再起動するか、もう一度お試しください。'
            );
            return;
          }
        }

        throw launchError;
      }

      console.log('Camera result:', JSON.stringify(result, null, 2));
      console.log('Camera result canceled:', result.canceled);
      console.log('Camera result assets:', result.assets);

      if (!result.canceled && result.assets && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        console.log('Image captured:', imageUri);
        setProfileImage(imageUri);
        await uploadAvatar(imageUri);
      } else if (result.canceled) {
        console.log('User canceled camera');
      } else {
        console.log('No image captured - result:', result);
      }
    } catch (error) {
      console.error('Camera error:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Camera error details:', {
        message: errorMessage,
        error: error,
        stack: error instanceof Error ? error.stack : undefined,
      });
      Alert.alert(
        'エラー',
        'カメラを開く際にエラーが発生しました。' + errorMessage
      );
    }
  };

  const handleImagePicker = async () => {
    try {
      // Show action sheet first, then request permissions when needed
      Alert.alert(
        'プロフィール画像を選択',
        '画像の選択方法を選んでください',
        [
          {
            text: 'キャンセル',
            style: 'cancel',
          },
          {
            text: 'カメラで撮影',
            onPress: () => {
              // Use setTimeout to ensure Alert is fully dismissed before launching camera
              setTimeout(() => {
                handleCameraCapture();
              }, Platform.OS === 'android' ? 300 : 100);
            },
          },
          {
            text: 'ライブラリから選択',
            onPress: () => {
              // Use setTimeout to ensure Alert is fully dismissed
              setTimeout(async () => {
                try {
                  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                  if (status !== 'granted') {
                    Alert.alert(
                      '権限が必要',
                      '画像を選択するには、写真ライブラリへのアクセス権限が必要です。'
                    );
                    return;
                  }

                  const result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ['images'],
                    allowsEditing: true,
                    aspect: [1, 1],
                    quality: 0.8,
                  });

                  if (!result.canceled && result.assets && result.assets[0]) {
                    const imageUri = result.assets[0].uri;
                    setProfileImage(imageUri);
                    await uploadAvatar(imageUri);
                  }
                } catch (error) {
                  console.error('Image library error:', error);
                  Alert.alert('エラー', '画像の選択中にエラーが発生しました。');
                }
              }, Platform.OS === 'android' ? 300 : 100);
            },
          },
        ],
        { cancelable: true }
      );
    } catch (error) {
      console.error('Error in handleImagePicker:', error);
      Alert.alert('エラー', '画像の選択中にエラーが発生しました。');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        style={{ backgroundColor: colors.wt, flex: 1, paddingBottom: 100 }}
      >
        <StatusBar style="dark" />
        <Stack.Screen
          options={{
            title: '設定',
            headerShown: true,
            headerTitle: '設定',
            headerTitleAlign: 'center',
            headerTitleStyle: {
              fontFamily: 'Roboto Medium',
              fontWeight: '600',
              fontSize: 18,
            },
            headerLeft: () => <></>,
          }}
        />
        <VStack paddingHorizontal={16} paddingVertical={24} gap={24} paddingBottom={'$40'}>
          {/* Profile Section */}
          <VStack gap={16}>
            <HStack alignItems="center" gap={16}>
              {/* Profile Avatar */}
              <View style={styles.avatarContainer}>
                <TouchableOpacity onPress={handleImagePicker} activeOpacity={0.8}>
                  <View style={styles.avatarWrapper}>
                    {profileImage ? (
                      <Image
                        source={{ uri: profileImage }}
                        style={styles.avatar}
                        alt="Profile"
                      />
                    ) : (
                      <View style={[styles.avatar, styles.avatarPlaceholder]}>
                        <Icon as={User} color={colors.gr1} size="xl" />
                      </View>
                    )}
                    {/* Pen Icon or Loading Spinner */}
                    <View style={styles.penIconContainer}>
                      {isUploading ? (
                        <Spinner size="small" color={colors.wt} />
                      ) : (
                        <Icon as={Pen} color={colors.wt} size="sm" />
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Username and Edit Button */}
              <VStack flex={1} gap={8}>
                <Text
                  sx={{
                    ...textStyle.H_W6_18,
                    color: colors.gr1,
                  }}
                >
                  {user?.name || 'ユーザー'}
                </Text>
                <TouchableOpacity onPress={() => router.push('/settings/profile-edit')}>
                  <Text
                    sx={{
                      ...textStyle.H_W6_15,
                      color: colors.rd,
                    }}
                  >
                    アカウント情報を変更する
                  </Text>
                </TouchableOpacity>
              </VStack>
            </HStack>
          </VStack>

          <VStack>

            <Divider my={16} />
            <Text
              sx={{
                ...textStyle.H_W6_18,
                color: colors.rd,
              }}
            >
              設定
            </Text>
            <Divider my={16} />
            <TouchableOpacity onPress={() => { }}>
              <HStack
                justifyContent="space-between"
                alignItems="center"
                paddingHorizontal={1}
              >
                <Text
                  sx={{
                    ...textStyle.H_W6_15,
                    color: colors.gr1,
                  }}
                >
                  セキュリティ設定
                </Text>
                <Icon as={ChevronRight} color={colors.rd} size="lg" />
              </HStack>
            </TouchableOpacity>
            <Divider my={16} />
          </VStack>
          <VStack>
            <Text
              sx={{
                ...textStyle.H_W6_18,
                color: colors.rd,
              }}
            >
              情報
            </Text>
            <Divider my={16} />
            <TouchableOpacity onPress={() => router.push('/terms-of-services')}>
              <HStack
                justifyContent="space-between"
                alignItems="center"
                paddingHorizontal={1}
              >
                <Text
                  sx={{
                    ...textStyle.H_W6_15,
                    color: colors.gr1,
                  }}
                >
                  利用規約
                </Text>
                <Icon as={ChevronRight} color={colors.rd} size="lg" />
              </HStack>
            </TouchableOpacity>
            <Divider my={16} />
            <TouchableOpacity onPress={() => router.push('/privacy-policy')}>
              <HStack
                justifyContent="space-between"
                alignItems="center"
                paddingHorizontal={1}
              >
                <Text
                  sx={{
                    ...textStyle.H_W6_15,
                    color: colors.gr1,
                  }}
                >
                  プライバシーポリシー
                </Text>
                <Icon as={ChevronRight} color={colors.rd} size="lg" />
              </HStack>
            </TouchableOpacity>
            <Divider my={16} />
            <TouchableOpacity
              onPress={() => router.push('/license-information')}
            >
              <HStack
                justifyContent="space-between"
                alignItems="center"
                paddingHorizontal={1}
              >
                <Text
                  sx={{
                    ...textStyle.H_W6_15,
                    color: colors.gr1,
                  }}
                >
                  ライセンス情報
                </Text>
                <Icon as={ChevronRight} color={colors.rd} size="lg" />
              </HStack>
            </TouchableOpacity>
            <Divider my={16} />
          </VStack>
          <VStack>
            <Text
              sx={{
                ...textStyle.H_W6_18,
                color: colors.rd,
              }}
            >
              レビュー
            </Text>
            <Divider my={16} />
            <TouchableOpacity onPress={() => { }}>
              <HStack
                justifyContent="space-between"
                alignItems="center"
                paddingHorizontal={1}
              >
                <Text
                  sx={{
                    ...textStyle.H_W6_15,
                    color: colors.gr1,
                  }}
                >
                  アプリレビューを記載する
                </Text>
                <Icon as={ChevronRight} color={colors.rd} size="lg" />
              </HStack>
            </TouchableOpacity>
            <Divider my={16} />
            <TouchableOpacity onPress={() => router.push('/account-delete')}>
              <HStack
                justifyContent="space-between"
                alignItems="center"
                paddingHorizontal={1}
              >
                <Text
                  sx={{
                    ...textStyle.H_W6_15,
                    color: colors.rd,
                  }}
                >
                  アカウント削除
                </Text>
                <Icon as={ChevronRight} color={colors.rd} size="lg" />
              </HStack>
            </TouchableOpacity>
            <Divider my={16} />
            <TouchableOpacity
              onPress={() => {
                Alert.alert(
                  'ログアウト確認',
                  'ログアウトしますか？',
                  [
                    {
                      text: 'キャンセル',
                      style: 'cancel',
                    },
                    {
                      text: 'はい',
                      style: 'destructive',
                      onPress: () => {
                        dispatch(clearRegistration());
                        router.replace({
                          pathname: '/onboarding',
                          params: { activeIndex: '1' },
                        });
                      },
                    },
                  ],
                  { cancelable: true }
                );
              }}
            >
              <Text sx={{ ...textStyle.H_W6_15, color: colors.gr1, }}>ログアウト</Text>
            </TouchableOpacity>
            <Divider my={16} />
          </VStack>
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Settings;
