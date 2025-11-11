// App.tsx
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import Providers from '../src/components/Providers';
import { useAppSelector } from '../src/redux/hooks';
import { persistor, store } from '../src/redux/store';

const Root = () => {
  const token = useAppSelector(s => s.registration.token);
  console.log("token", token);
  const router = useRouter();

  useEffect(() => {
    if (token) {
      router.replace('/home');
    } else {
      router.replace('/onboarding');
    }
  }, [token, router]);

  return null;
};

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate
        loading={
          <View
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
          >
            <ActivityIndicator />
          </View>
        }
        persistor={persistor}
      >
        <Providers>
          <StatusBar style="dark" />
          <Root />
        </Providers>
      </PersistGate>
    </Provider>
  );
}
