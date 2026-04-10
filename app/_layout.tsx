import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts, PlusJakartaSans_500Medium, PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold, PlusJakartaSans_800ExtraBold } from '@expo-google-fonts/plus-jakarta-sans';
import { BeVietnamPro_400Regular, BeVietnamPro_500Medium, BeVietnamPro_600SemiBold, BeVietnamPro_700Bold } from '@expo-google-fonts/be-vietnam-pro';
import { colors } from '../constants/theme';
import { useAuth } from '../hooks/useAuth';
import { registerForPushNotifications } from '../lib/push';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { Toast } from '../components/Toast';
import { ConfirmModal } from '../components/ConfirmModal';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
    BeVietnamPro_400Regular,
    BeVietnamPro_500Medium,
    BeVietnamPro_600SemiBold,
    BeVietnamPro_700Bold,
  });

  const { isAuthenticated, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading || !fontsLoaded) return;

    const inAuthGroup = segments[0] === '(auth)';
    const onLanding = segments[0] === 'landing';
    const onJoin = segments[0] === 'join';

    if (!isAuthenticated && !inAuthGroup && !onLanding && !onJoin) {
      // On web, show landing page; on native, go straight to login
      if (Platform.OS === 'web') {
        router.replace('/landing');
      } else {
        router.replace('/(auth)/login');
      }
    } else if (isAuthenticated && (inAuthGroup || onLanding)) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, loading, segments, fontsLoaded]);

  // Register for push notifications after successful auth
  useEffect(() => {
    if (isAuthenticated) {
      registerForPushNotifications().catch(() => {
        // Silently fail — push is optional
      });
    }
  }, [isAuthenticated]);

  if (!fontsLoaded || loading) return null;

  return (
    <ErrorBoundary>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="landing" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="create-plan" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="create-task" options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="plan/[id]" />
        <Stack.Screen name="share/[id]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="join/[code]" />
      </Stack>
      <Toast />
      <ConfirmModal />
    </ErrorBoundary>
  );
}
