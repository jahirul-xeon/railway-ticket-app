import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';

import { AuthProvider, useAuth } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { AppNavigator } from '@/navigation/AppNavigator';
import { AuthNavigator } from '@/navigation/AuthNavigator';
import { AppSplash } from '@/screens/SplashScreen';
import { AppColors } from '@/constants/appTheme';
import { ensureSeedData } from '@/services/api';

SplashScreen.preventAutoHideAsync().catch(() => {});

const navTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: AppColors.bg, primary: AppColors.primary },
};

const MIN_SPLASH_MS = 1800;

function Root() {
  const { user, initializing } = useAuth();
  const [minTimePassed, setMinTimePassed] = useState(false);

  // Hide the OS splash as soon as JS mounts so our branded splash is visible,
  // and keep the branded splash on screen for at least MIN_SPLASH_MS.
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
    const t = setTimeout(() => setMinTimePassed(true), MIN_SPLASH_MS);
    return () => clearTimeout(t);
  }, []);

  // Seed reference data (stations/trains/fares) into Firestore once the user
  // is authenticated — matches the locked security rules, which require auth.
  // Screens also fall back to bundled data, so trains show even if this fails.
  useEffect(() => {
    if (user) ensureSeedData().catch((e) => console.warn('Seed skipped:', e?.message));
  }, [user]);

  if (initializing || !minTimePassed) {
    return <AppSplash message="Loading…" />;
  }

  return (
    <NavigationContainer theme={navTheme}>
      {user ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <ToastProvider>
          <AuthProvider>
            <Root />
          </AuthProvider>
        </ToastProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
