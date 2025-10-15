import { HStack, Text, VStack } from '@gluestack-ui/themed';
import { LinearGradient } from 'expo-linear-gradient';
import { usePathname, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Image,
  NativeModules,
  Platform,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAppSelector } from '../redux/hooks';
import { RootState } from '../redux/store';
import { colors } from '../theme/colors';
import { textStyle } from '../theme/text-style';
import type { YellPayModule } from '../types/YellPay';

const { YellPay }: { YellPay: YellPayModule } = NativeModules;

interface BottomNavigationProps {
  onPress?: () => void;
  disabled?: boolean;
  backgroundColor?: string;
  textColor?: string;
  height?: number;
  borderRadius?: number;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  onPress,
  disabled = false,
  backgroundColor = colors.wt,
  textColor = colors.gr5,
  height = 84,
  borderRadius = 20,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const router = useRouter();
  const pathname = usePathname();
  const { userId } = useAppSelector((state: RootState) => state.registration);

  useEffect(() => {
    setActiveIndex(
      pathname === '/home'
        ? 0
        : pathname === '/settings'
          ? 3
          : pathname === '/announcements'
            ? 2
            : pathname === '/easy-login'
              ? 1
              : 0
    );
  }, [pathname]);

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={1}
      style={{
        backgroundColor: colors.whtShadow,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
      }}
    >
      <View
        style={{
          backgroundColor,
          height,
          justifyContent: 'center',
          paddingHorizontal: 22,
          borderRadius: borderRadius,
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: -1,
              },
              shadowOpacity: 0.1,
              shadowRadius: 20,
            },
            android: {
              elevation: 10,
            },
          }),
        }}
      >
        <HStack justifyContent="space-between">
          <HStack justifyContent="space-between" space="md">
            <TouchableOpacity
              onPress={() => {
                setActiveIndex(0);
                router.push('/home');
              }}
              activeOpacity={0.8}
            >
              <VStack alignItems="center">
                <Image
                  source={
                    activeIndex === 0
                      ? require('../../assets/images/home-selected.png')
                      : require('../../assets/images/home.png')
                  }
                  style={{ width: 22, height: 22 }}
                />
                <Text
                  sx={{
                    ...textStyle.H_W6_12,
                    color: activeIndex === 0 ? colors.rd : textColor,
                    mt: 10,
                  }}
                >
                  HOME
                </Text>
              </VStack>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                router.push('/easy-login');
                setActiveIndex(1);
              }}
              activeOpacity={0.8}
            >
              <VStack alignItems="center">
                <Image
                  source={
                    activeIndex === 1
                      ? require('../../assets/images/easy-login-selected.png')
                      : require('../../assets/images/easy-login.png')
                  }
                  style={{ width: 22, height: 22 }}
                />
                <Text
                  sx={{
                    ...textStyle.H_W6_12,
                    color: activeIndex === 1 ? colors.rd : textColor,
                    mt: 10,
                  }}
                >
                  簡単ログイン
                </Text>
              </VStack>
            </TouchableOpacity>
          </HStack>
          <View>
            <TouchableOpacity
              onPress={async () => {
                if (!userId) {
                  console.error('UserId is not set');
                  return;
                }
                const result = await YellPay.paymentForQR(
                  userId, // uuid
                  0, // userNo (typically 0)
                  userId // payUserId (same as userId)
                );
                console.log('testPaymentForQR() - SUCCESS:', result);
              }}
              disabled={!userId}
              style={{
                position: 'absolute',
                left: '50%',
                transform: [{ translateX: '-50%' }],
                top: -40,
                borderRadius: 50,
                height: 58,
                width: 58,
                alignItems: 'center',
                justifyContent: 'center',
                ...Platform.select({
                  ios: {
                    shadowColor: '#000',
                    shadowOffset: {
                      width: 0,
                      height: -1,
                    },
                    shadowOpacity: 0.1,
                    shadowRadius: 20,
                  },
                  android: {
                    elevation: 3,
                  },
                }),
              }}
            >
              <LinearGradient
                colors={['#dd3136', '#F7575D']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 0 }}
                style={{
                  position: 'absolute',
                  borderRadius: 100,
                  height: 58,
                  width: 58,
                }}
              />
              {/* Additional gradient layer for more radial effect */}
              <LinearGradient
                colors={['#F7575D', '#D5242A']}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.1, y: 0.5 }}
                style={{
                  position: 'absolute',
                  borderRadius: 100,
                  height: 58,
                  width: 58,
                  top: 0,
                }}
              />
              <Image
                source={require('../../assets/images/card-payment.png')}
                style={{ width: 25, height: 25 }}
              />
            </TouchableOpacity>
            <Text
              sx={{
                ...textStyle.H_W6_12,
                color: textColor,
                textAlign: 'center',
                marginTop: 31.5,
                zIndex: 100,
              }}
            >
              支払う
            </Text>
          </View>
          <HStack justifyContent="space-between" width="33.3333333333%">
            <TouchableOpacity
              onPress={() => {
                setActiveIndex(2);
                router.push('/announcements');
              }}
              activeOpacity={0.8}
            >
              <VStack alignItems="center">
                <Image
                  source={
                    activeIndex === 2
                      ? require('../../assets/images/notification-selected.png')
                      : require('../../assets/images/notification.png')
                  }
                  style={{ width: 22, height: 22 }}
                />
                <Text
                  sx={{
                    ...textStyle.H_W6_12,
                    color: activeIndex === 2 ? colors.rd : textColor,
                    mt: 10,
                  }}
                >
                  お知らせ
                </Text>
              </VStack>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setActiveIndex(3);
                router.push('/settings');
              }}
              activeOpacity={0.8}
            >
              <VStack alignItems="center">
                <Image
                  source={
                    activeIndex === 3
                      ? require('../../assets/images/settings-selected.png')
                      : require('../../assets/images/settings.png')
                  }
                  style={{ width: 22, height: 22 }}
                />
                <Text
                  sx={{
                    ...textStyle.H_W6_12,
                    color: activeIndex === 3 ? colors.rd : textColor,
                    mt: 10,
                  }}
                >
                  設定
                </Text>
              </VStack>
            </TouchableOpacity>
          </HStack>
        </HStack>
      </View>
    </TouchableOpacity>
  );
};
