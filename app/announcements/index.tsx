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
import { TouchableOpacity } from 'react-native';
import { colors } from '../../src/theme/colors';
import { textStyle } from '../../src/theme/text-style';

const Announcements = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        style={{ backgroundColor: colors.wt, flex: 1, paddingBottom: 100 }}
      >
        <StatusBar style="dark" />
        <Stack.Screen
          options={{
            title: 'お知らせ',
            headerShown: true,
            headerTitle: 'お知らせ',
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
            <TouchableOpacity
              onPress={() => {
                router.push('/announcement-detail/1');
              }}
            >
              <HStack
                justifyContent="space-between"
                alignItems="center"
                paddingHorizontal={1}
              >
                <VStack>
                  <HStack alignItems="center" gap={12} mb={8} maxWidth={'80%'}>
                    <Text sx={{ ...textStyle.R_16_R, color: colors.gr5 }}>
                      2022.12.01
                    </Text>
                    <Text
                      sx={{
                        ...textStyle.H_W3_13,
                        color: colors.rd,
                        borderWidth: 1,
                        borderColor: colors.rd,
                        paddingHorizontal: 6,
                        paddingVertical: 3,
                        borderRadius: 20,
                      }}
                    >
                      メンテナンス
                    </Text>
                  </HStack>
                  <Text
                    sx={{
                      ...textStyle.H_W6_15,
                      color: colors.gr1,
                    }}
                  >
                    システムメンテナンス終了のお知らせ
                  </Text>
                </VStack>
                <Icon as={ChevronRight} color={colors.rd} size="lg" />
              </HStack>
            </TouchableOpacity>
            <Divider my={16} />
            <TouchableOpacity
              onPress={() => {
                router.push('/announcement-detail/2');
              }}
            >
              <HStack
                justifyContent="space-between"
                alignItems="center"
                paddingHorizontal={1}
              >
                <VStack>
                  <HStack alignItems="center" gap={12} mb={8} maxWidth={'80%'}>
                    <Text sx={{ ...textStyle.R_16_R, color: colors.gr5 }}>
                      2022.12.01
                    </Text>
                    <Text
                      sx={{
                        ...textStyle.H_W3_13,
                        color: colors.rd,
                        borderWidth: 1,
                        borderColor: colors.rd,
                        paddingHorizontal: 6,
                        paddingVertical: 3,
                        borderRadius: 20,
                      }}
                    >
                      メンテナンス
                    </Text>
                  </HStack>
                  <Text
                    sx={{
                      ...textStyle.H_W6_15,
                      color: colors.gr1,
                    }}
                  >
                    キャンペーンのお知らせ
                  </Text>
                </VStack>
                <Icon as={ChevronRight} color={colors.rd} size="lg" />
              </HStack>
            </TouchableOpacity>
            <Divider my={16} />
            <TouchableOpacity
              onPress={() => {
                router.push('/announcement-detail/3');
              }}
            >
              <HStack
                justifyContent="space-between"
                alignItems="center"
                paddingHorizontal={1}
              >
                <VStack>
                  <HStack alignItems="center" gap={12} mb={8}>
                    <Text sx={{ ...textStyle.R_16_R, color: colors.gr5 }}>
                      2022.12.01
                    </Text>
                    <Text
                      sx={{
                        ...textStyle.H_W3_13,
                        color: colors.rd,
                        borderWidth: 1,
                        borderColor: colors.rd,
                        paddingHorizontal: 6,
                        paddingVertical: 3,
                        borderRadius: 20,
                      }}
                    >
                      メンテナンス
                    </Text>
                  </HStack>
                  <Text
                    sx={{
                      ...textStyle.H_W6_15,
                      color: colors.gr1,
                      maxWidth: '94%',
                    }}
                  >
                    2022年11月30日から12月01日：システムメンテナンスのお知らせ
                  </Text>
                </VStack>
                <Icon as={ChevronRight} color={colors.rd} size="lg" />
              </HStack>
            </TouchableOpacity>
            <Divider my={16} />
          </VStack>
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Announcements;
