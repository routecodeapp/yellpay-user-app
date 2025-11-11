import {
  Divider,
  HStack,
  Icon,
  SafeAreaView,
  ScrollView,
  Text,
  VStack,
} from '@gluestack-ui/themed';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ChevronRight } from 'lucide-react-native';
import { Alert, TouchableOpacity } from 'react-native';
import { useDispatch } from 'react-redux';
import { clearRegistration } from '../../src/redux/slice/auth/registrationSlice';
import { colors } from '../../src/theme/colors';
import { textStyle } from '../../src/theme/text-style';

const Settings = () => {
  const router = useRouter();
  const dispatch = useDispatch();
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
        <VStack paddingHorizontal={16} paddingVertical={24} gap={24}>
          <VStack>
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
                        router.replace('/');
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
