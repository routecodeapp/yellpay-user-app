// App.tsx
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import Providers from '../src/components/Providers';
import { useAppSelector } from '../src/redux/hooks';
import { persistor, store } from '../src/redux/store';
import Home from './home';
import OnboardingScreen from './onboarding';

const Root = () => {
  const token = useAppSelector(s => s.registration.token);
  console.log("token", token);
  return !token ? <OnboardingScreen /> : <Home />;
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
