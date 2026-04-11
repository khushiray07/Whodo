import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, fonts, spacing, radii } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    emoji: '🎯',
    gradientColors: ['#f3e8ff', '#ede0ff', '#e4d4ff'] as const,
    accentColor: colors.primary,
    title: 'Plan karo,\nsab milke.',
    subtitle: 'Birthday bash, Goa trip, flatmate groceries...\none plan, puri gang sorted.',
    detail: '6 ready templates · custom plans · auto tasks',
  },
  {
    emoji: '💪',
    gradientColors: ['#e6fbef', '#d4f7e2', '#c8f0d8'] as const,
    accentColor: '#006a28',
    title: 'Jiska naam,\nuska kaam.',
    subtitle: 'Assign tasks. Track kharcha.\nNo more "baad mein karta hoon" excuses.',
    detail: 'Claim tasks · split expenses · smart settlements',
  },
  {
    emoji: '🚀',
    gradientColors: ['#fff0e6', '#ffe8d6', '#ffdfc6'] as const,
    accentColor: '#c65100',
    title: 'Share karo,\nshuru karo.',
    subtitle: 'WhatsApp pe share karo, QR scan karo,\nfriends 5 second mein join.',
    detail: 'WhatsApp · QR code · invite link',
  },
];

export default function OnboardingScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    setActiveIndex(index);
  };

  const handleGetStarted = async () => {
    await AsyncStorage.setItem('onboarding_seen', 'true');
    router.replace('/(auth)/login');
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem('onboarding_seen', 'true');
    router.replace('/(auth)/login');
  };

  const goNext = () => {
    scrollRef.current?.scrollTo({ x: (activeIndex + 1) * width, animated: true });
  };

  const isLast = activeIndex === SLIDES.length - 1;
  const slide = SLIDES[activeIndex];

  return (
    <View style={styles.container}>
      {/* Skip */}
      <TouchableOpacity onPress={handleSkip} style={styles.skipBtn}>
        <Text style={styles.skipText}>Skip →</Text>
      </TouchableOpacity>

      {/* Slides */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        bounces={false}
      >
        {SLIDES.map((s, i) => (
          <View key={i} style={[styles.slide, { width }]}>
            {/* Big emoji with gradient bg */}
            <LinearGradient
              colors={[...s.gradientColors]}
              style={styles.emojiCircle}
            >
              <Text style={styles.emoji}>{s.emoji}</Text>
            </LinearGradient>

            {/* Title */}
            <Text style={[styles.title, { color: s.accentColor }]}>{s.title}</Text>

            {/* Subtitle */}
            <Text style={styles.subtitle}>{s.subtitle}</Text>

            {/* Detail chip */}
            <View style={[styles.detailChip, { backgroundColor: s.accentColor + '10' }]}>
              <Text style={[styles.detailText, { color: s.accentColor }]}>{s.detail}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Bottom section */}
      <View style={styles.bottom}>
        {/* Dots */}
        <View style={styles.dots}>
          {SLIDES.map((s, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  width: i === activeIndex ? 28 : 8,
                  backgroundColor: i === activeIndex ? slide.accentColor : colors.outlineVariant,
                },
              ]}
            />
          ))}
        </View>

        {/* CTA */}
        {isLast ? (
          <TouchableOpacity onPress={handleGetStarted} activeOpacity={0.85}>
            <LinearGradient
              colors={[colors.primary, '#9333ea']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.ctaBtn}
            >
              <Text style={styles.ctaText}>Chalo shuru karte hain →</Text>
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={goNext} style={styles.nextBtn} activeOpacity={0.8}>
            <Text style={styles.nextText}>Aage dekho →</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  skipBtn: {
    position: 'absolute',
    top: 60,
    right: 24,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.surfaceContainer,
    borderRadius: radii.full,
  },
  skipText: {
    fontFamily: fonts.headlineSemiBold,
    fontSize: 13,
    color: colors.onSurfaceVariant,
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: 20,
    paddingBottom: 60,
  },
  emojiCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emoji: {
    fontSize: 80,
  },
  title: {
    fontFamily: fonts.headlineExtra,
    fontSize: 38,
    textAlign: 'center',
    lineHeight: 46,
    letterSpacing: -1,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 25,
  },
  detailChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: radii.full,
    marginTop: 4,
  },
  detailText: {
    fontFamily: fonts.headlineSemiBold,
    fontSize: 12,
    letterSpacing: 0.5,
  },
  bottom: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 56,
    gap: 28,
    alignItems: 'center',
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  ctaBtn: {
    paddingHorizontal: 48,
    paddingVertical: 20,
    borderRadius: radii.full,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 8,
  },
  ctaText: {
    fontFamily: fonts.headlineExtra,
    fontSize: 17,
    color: '#ffffff',
    textAlign: 'center',
  },
  nextBtn: {
    backgroundColor: colors.surfaceContainerHigh,
    paddingHorizontal: 44,
    paddingVertical: 18,
    borderRadius: radii.full,
  },
  nextText: {
    fontFamily: fonts.headlineSemiBold,
    fontSize: 16,
    color: colors.onSurface,
  },
});
