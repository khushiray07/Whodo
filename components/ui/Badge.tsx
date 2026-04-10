import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, fonts, radii } from '../../constants/theme';

type Props = {
  text: string;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'surface';
  style?: ViewStyle;
};

const variantColors = {
  primary: { bg: colors.primary + '1A', text: colors.primary },
  secondary: { bg: colors.secondaryContainer, text: colors.onSecondaryContainer },
  tertiary: { bg: colors.tertiary + '1A', text: colors.tertiary },
  surface: { bg: colors.surfaceContainer, text: colors.onSurfaceVariant },
};

export function Badge({ text, variant = 'surface', style }: Props) {
  const v = variantColors[variant];

  return (
    <View style={[styles.badge, { backgroundColor: v.bg }, style]}>
      <Text style={[styles.text, { color: v.text }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radii.full,
  },
  text: {
    fontFamily: fonts.headlineSemiBold,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
