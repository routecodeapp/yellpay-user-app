import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  NativeModules,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAppSelector } from '../redux/hooks';
import { RootState } from '../redux/store';
import { colors } from '../theme/colors';
import { YellPayModule } from '../types/YellPay';

const { YellPay }: { YellPay: YellPayModule } = NativeModules;
interface BannerSliderProps {
  images: string[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

const { width: screenWidth } = Dimensions.get('window');

const BannerSlider: React.FC<BannerSliderProps> = ({
  images,
  autoPlay = true,
  autoPlayInterval = 10000,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const { userId, certificates } = useAppSelector((state: RootState) => state.registration);
  const router = useRouter();

  React.useEffect(() => {
    if (!autoPlay) return;

    const interval = setInterval(() => {
      const nextIndex = (activeIndex + 1) % images.length;
      setActiveIndex(nextIndex);
      scrollViewRef.current?.scrollTo({
        x: nextIndex * screenWidth,
        animated: true,
      });
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [activeIndex, autoPlay, autoPlayInterval, images.length]);

  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / (screenWidth - 32));
    setActiveIndex(index);
  };

  const goToSlide = (index: number) => {
    setActiveIndex(index);
    scrollViewRef.current?.scrollTo({
      x: index * (screenWidth - 32),
      animated: true,
    });
  };

  return (
    <View style={{ width: '100%', paddingHorizontal: 16 }}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={{ width: screenWidth - 32, height: 90, borderRadius: 3 }}
      >
        {
          images.find((image) => image.includes('banner-1.png')) && (
            <TouchableOpacity onPress={() => router.push('/user-guide')}>
              <Image
                source={require('../../assets/images/banner-1.png')}
                alt="Banner 1"
                style={{ width: screenWidth - 32, height: 90, resizeMode: 'contain' }}
              />
            </TouchableOpacity>
          )
        }
        {
          images.find((image) => image.includes('banner-2.png')) && (
            <TouchableOpacity
                onPress={async () => {
                  if (!userId) {
                    Alert.alert(
                      'Error',
                      'User not found. Please register/login in Home first.'
                    );
                    return;
                  }

                  // Check if user has an active certificate before attempting to view it
                  const hasActiveCertificate = certificates && certificates.length > 0 && certificates[0].status === 1;
                  if (!hasActiveCertificate) {
                    Alert.alert(
                      'エラー',
                      '有効な証明書がありません。カード登録を行ってください。'
                    );
                    return;
                  }

                  try {
                    const result = await YellPay.viewCertificate(userId);
                    console.log('View Certificate result:', result);

                    // Parse the result if it's a JSON string
                    try {
                      const parsedResult = typeof result === 'string' ? JSON.parse(result) : result;

                      // Check for timeout/error from native module
                      if (parsedResult?.error === true) {
                        console.error('View Certificate Native Error:', parsedResult);
                        Alert.alert(
                          'エラー',
                          parsedResult.message || '証明書の表示中にエラーが発生しました。'
                        );
                        return;
                      }

                      // Check if result indicates successful disable register
                      if (parsedResult?.success === true) {
                      Alert.alert(
                        '成功',
                        '登録無効化が成功しました。',
                        [{ text: 'OK' }]
                      );
                    }
                  } catch (parseError) {
                    console.log('Result is not JSON or already parsed:', parseError);
                    // If parsing fails, the result might be the string itself
                    if (result === 'success' || result?.toString().includes('success')) {
                      Alert.alert(
                        '成功',
                        '登録無効化が成功しました。',
                        [{ text: 'OK' }]
                      );
                    }
                  }
                } catch (error) {
                  console.error('Error viewing certificate', error);
                  Alert.alert(
                    'エラー',
                    '証明書の表示に失敗しました。',
                    [{ text: 'OK' }]
                  );
                }
              }}
            >
              <Image
                source={require('../../assets/images/banner-2.png')}
                alt="Banner 2"
                style={{
                  width: screenWidth - 32,
                  height: 90,
                  resizeMode: 'contain',
                }}
              />
            </TouchableOpacity>
          )
        }

      </ScrollView>

      {/* Round Indicators */}
      {
        images.length > 1 && (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              paddingVertical: 16,
              gap: 8,
            }}
          >
            {images.map((_, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => goToSlide(index)}
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 6,
                  backgroundColor: index === activeIndex ? colors.rd : colors.gr6,
                }}
              />
            ))}
          </View>
        )
      }
    </View>
  );
};

export default BannerSlider;
