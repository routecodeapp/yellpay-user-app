import { Text } from '@gluestack-ui/themed';
import { LinearGradient } from 'expo-linear-gradient';
import { Platform, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import { textStyle } from '../theme/text-style';

interface GradientButtonProps {
  title: string;
  onPress: () => void;
  style?: any;
  gradientColors?: [string, string];
  disabled?: boolean;
}

export const GradientButton = ({
  title,
  onPress,
  style,
  gradientColors = ['#F6575D', '#D5242A'] as [string, string],
  disabled = false,
}: GradientButtonProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={{
        marginTop: 24,
        borderRadius: 10,
        height: 56,
        width: '100%',
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
        ...style,
      }}
    >
      <LinearGradient
        colors={disabled ? ['#CCCCCC', '#999999'] : gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 0 }}
        style={{
          position: 'absolute',
          borderRadius: 10,
          height: 56,
          width: '100%',
        }}
      />
      <Text
        sx={{
          ...textStyle.H_W6_15,
          color: colors.wt1,
        }}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};
