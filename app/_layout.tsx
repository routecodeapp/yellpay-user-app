import { View } from '@gluestack-ui/themed';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo } from 'react';
import { ActivityIndicator } from 'react-native';
import 'react-native-reanimated';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { BottomNavigation } from '../src/components/BottomNavigation';
import Providers from '../src/components/Providers';
import { persistor, store } from '../src/redux/store';
import { colors } from '../src/theme/colors';

export default function RootLayout() {
  const [loaded] = useFonts({
    // SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    'Noto Sans JP': require('../assets/fonts/NotoSansJP-Regular.ttf'),
    'Noto Sans JP Bold': require('../assets/fonts/NotoSansJP-Bold.ttf'),
    'Noto Sans JP Medium': require('../assets/fonts/NotoSansJP-Medium.ttf'),
    'Noto Sans JP SemiBold': require('../assets/fonts/NotoSansJP-SemiBold.ttf'),
    'Noto Sans JP Light': require('../assets/fonts/NotoSansJP-Light.ttf'),
    'Noto Sans JP ExtraLight': require('../assets/fonts/NotoSansJP-ExtraLight.ttf'),
    'Noto Sans JP Black': require('../assets/fonts/NotoSansJP-Black.ttf'),
    'Noto Sans JP Thin': require('../assets/fonts/NotoSansJP-Thin.ttf'),
    'Hiragino Sans': require('../assets/fonts/HiraginoKakuGothicProW3.otf'),
    'Hiragino Sans Bold': require('../assets/fonts/HiraginoKakuGothicProW6.otf'),
    'Roboto Regular': require('../assets/fonts/Roboto-Regular.ttf'),
    'Roboto Medium': require('../assets/fonts/Roboto-Medium.ttf'),
  });

  const pathname = usePathname();
  const showBottomNavigation = useMemo(() => {
    return ['/home', '/easy-login', '/announcements', '/settings'].includes(pathname);
  }, [pathname]);

  if (!loaded) {
    // Async font loading only occurs in development.
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.wt,
        }}
      >
        <ActivityIndicator
          size="large"
          color={colors.rd}
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        />
      </View>
    );
  }

  return (
    <ThemeProvider value={DefaultTheme}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <Providers>
            <StatusBar style="auto" />
            <View style={{ flex: 1 }}>
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: colors.wt },
                  animation: 'none',
                }}
              >
                <Stack.Screen name="index" />
                <Stack.Screen name="+not-found" />
              </Stack>
              {showBottomNavigation ? <BottomNavigation /> : null}
            </View>
          </Providers>
        </PersistGate>
      </Provider>
    </ThemeProvider>
  );
}
