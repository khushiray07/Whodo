import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, radii, shadows } from '../../constants/theme';

type Props = {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'tonal';
  style?: ViewStyle;
};

export function Card({ children, variant = 'default', style }: Props) {
  return (
    <View style={[styles.base, variantStyles[variant], style]}>
      {children}
    </View>
  );
}

const variantStyles: Record<string, ViewStyle> = {
  default: {
    backgroundColor: colors.surfaceContainerLowest,
    ...shadows.card,
  },
  elevated: {
    backgroundColor: colors.surfaceContainerLowest,
    ...shadows.card,
  },
  tonal: {
    backgroundColor: colors.surfaceContainerLow,
  },
};

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.default,
    padding: 20,
    overflow: 'hidden',
  },
});
