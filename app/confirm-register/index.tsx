import { Button, Image, Text, VStack } from '@gluestack-ui/themed';
import { useRouter } from 'expo-router';
import { Safe } from '../../src/components/Safe';
import { colors } from '../../src/theme/colors';
import { textStyle } from '../../src/theme/text-style';

const ConfirmRegister = () => {
  const router = useRouter();
  
  return (
    <Safe>
      <VStack flex={1} justifyContent="center" alignItems="center" px={8}>
        <Image
          source={require('../../assets/images/confirm-register.png')}
          alt="confirm-register"
        />
        <Text
          sx={{
            mt: 32,
            mb: 16,
            textAlign: 'center',
            ...textStyle.H_W6_18,
            fontWeight: 'normal',
            lineHeight: 24,
          }}
        >
          会員情報の登録が完了しました
        </Text>
        <Text
          sx={{
            ...textStyle.H_W3_15,
            px: 16,
            textAlign: 'center',
            pb: 40,
          }}
        >
          続けてサービスをご利用いただくために、
          決済利用されるクレジットカードの登録を お願いします。
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
          onPress={() => {
            router.dismissTo('/home');
          }}
        >
          <Text
            sx={{
              ...textStyle.H_W6_15,
              color: colors.wt1,
            }}
          >
            カード登録へ進む
          </Text>
        </Button>
      </VStack>
    </Safe>
  );
};

export default ConfirmRegister;
