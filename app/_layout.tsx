import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts, PlusJakartaSans_500Medium, PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold, PlusJakartaSans_800ExtraBold } from '@expo-google-fonts/plus-jakarta-sans';
import { BeVietnamPro_400Regular, BeVietnamPro_500Medium, BeVietnamPro_600SemiBold, BeVietnamPro_700Bold } from '@expo-google-fonts/be-vietnam-pro';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, fonts } from '../constants/theme';
import { useAuth } from '../hooks/useAuth';
import { registerForPushNotifications } from '../lib/push';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { Toast } from '../components/Toast';
import { ConfirmModal } from '../components/ConfirmModal';
import { ActionSheet } from '../components/ActionSheet';

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
  const [isReady, setIsReady] = useState(false);
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [onboardingSeen, setOnboardingSeen] = useState(true); // default true to avoid flash

  // Check onboarding status once
  useEffect(() => {
    AsyncStorage.getItem('onboarding_seen').then((val) => {
      setOnboardingSeen(val === 'true');
      setOnboardingChecked(true);
    });
  }, []);

  useEffect(() => {
    if (loading || !fontsLoaded || !onboardingChecked) return;

    const inAuthGroup = segments[0] === '(auth)';
    const onLanding = segments[0] === 'landing';
    const onJoin = segments[0] === 'join';
    const onOnboarding = segments[0] === 'onboarding';
    const isDeepLink = segments[0] === 'plan' || segments[0] === 'share';

    if (!isAuthenticated && !inAuthGroup && !onLanding && !onJoin && !onOnboarding) {
      if (Platform.OS === 'web') {
        if (isDeepLink) {
          const path = '/' + segments.join('/');
          router.replace(`/(auth)/login?redirect=${encodeURIComponent(path)}`);
        } else {
          router.replace('/landing');
        }
      } else {
        // Native: show onboarding for first-time users
        if (!onboardingSeen) {
          router.replace('/onboarding');
        } else {
          router.replace('/(auth)/login');
        }
      }
    } else if (isAuthenticated && (inAuthGroup || onLanding || onOnboarding)) {
      router.replace('/(tabs)');
    }

    setIsReady(true);
  }, [isAuthenticated, loading, segments, fontsLoaded, onboardingChecked, onboardingSeen]);

  // Register for push notifications after successful auth
  useEffect(() => {
    if (isAuthenticated) {
      registerForPushNotifications().catch(() => {});
    }
  }, [isAuthenticated]);

  // Show branded splash while loading
  if (!fontsLoaded || loading || !onboardingChecked || !isReady) {
    return (
      <View style={splashStyles.container}>
        <StatusBar style="light" />
        <Text style={splashStyles.logo}>Whodo</Text>
        <Text style={splashStyles.tagline}>Jiska naam, uska kaam</Text>
      </View>
    );
  }

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
        <Stack.Screen name="onboarding" options={{ headerShown: false, animation: 'fade' }} />
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
      <ActionSheet />
    </ErrorBoundary>
  );
}

const splashStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0c0a14',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logo: {
    fontFamily: Platform.OS === 'web' ? "'Plus Jakarta Sans', sans-serif" : undefined,
    fontSize: 52,
    fontWeight: '800',
    color: '#ffffff',
    textShadowColor: 'rgba(107, 30, 243, 0.5)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 20,
  },
  tagline: {
    fontFamily: Platform.OS === 'web' ? "'Be Vietnam Pro', sans-serif" : undefined,
    fontSize: 16,
    color: '#c4b5fd',
    fontStyle: 'italic',
  },
});
