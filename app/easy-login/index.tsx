import { Button, Image, ScrollView, Text, VStack } from '@gluestack-ui/themed';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { NativeModules, SafeAreaView, TouchableOpacity } from 'react-native';
import { BottomNavigation } from '../../src/components';
import { colors } from '../../src/theme/colors';
import { textStyle } from '../../src/theme/text-style';
import type { YellPayModule } from '../../src/types/YellPay';

const { YellPay }: { YellPay: YellPayModule } = NativeModules;

const EasyLogin = () => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        style={{ backgroundColor: colors.wt, flex: 1, paddingBottom: 100 }}
      >
        <StatusBar style="dark" />
        <Stack.Screen
          options={{
            title: '認証ログイン',
            headerShown: true,
            headerTitle: '認証ログイン',
            headerTitleAlign: 'center',
            headerTitleStyle: {
              fontFamily: 'Hiragino Sans Bold',
              fontWeight: 600,
              fontSize: 18,
            },
            headerLeft: () => <></>,
          }}
        />
        <VStack
          flex={1}
          justifyContent="center"
          alignItems="center"
          px={16}
          py={40}
        >
          <Image
            source={require('../../assets/images/easy-login-helper.png')}
            alt="confirm-register"
            style={{
              width: 130,
              height: 172,
            }}
          />
          <Text
            sx={{
              ...textStyle.H_W3_15,
              textAlign: 'center',
              pb: 16,
              pt: 40,
            }}
          >
            ID/Password不要で安全な認証・ログインを{'\n'}
            行う「認証ユニバーサルキーTM」機能を{'\n'}
            Yell Pay対応サービスに対して利用できます。
          </Text>
          <Text
            sx={{
              ...textStyle.H_W3_15,
              textAlign: 'center',
              pb: 40,
            }}
          >
            認証するためには、サービス側の画面に表示され
            ているsPINコードを入力してください。
          </Text>
          <Button
            mt={30}
            variant="solid"
            sx={{
              borderColor: colors.rd,
              backgroundColor: colors.rd,
              borderRadius: 10,
              paddingHorizontal: 24,
              paddingVertical: 12,
              width: '100%',
              height: 52,
              opacity: 1,
              boxShadow: '0px 0px 10px 0px #D5242A4F',
            }}
            onPress={async () => {
              const result = await YellPay.authApproval('auth.unid.net');
              console.log('result', result);
            }}
          >
            <Text
              sx={{
                ...textStyle.H_W6_15,
                color: colors.wt1,
              }}
            >
              認証コードを入力する
            </Text>
          </Button>
          <TouchableOpacity
            onPress={async () => {
              const result = await YellPay.authRegister('auth.unid.net');
              console.log('result', result);
            }}
            style={{
              borderRadius: 10,
              height: 56,
              width: '100%',
              borderWidth: 1,
              marginTop: 16,
              borderColor: colors.rd,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              sx={{
                ...textStyle.H_W6_15,
                color: colors.rd,
              }}
            >
              新しい「認証コード」を登録する
            </Text>
          </TouchableOpacity>
        </VStack>
      </ScrollView>
      <BottomNavigation />
    </SafeAreaView>
  );
};

export default EasyLogin;
