import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps } from 'react-native';
import { colors, fonts, radii, spacing } from '../../constants/theme';

type Props = TextInputProps & {
  label?: string;
};

export function Input({ label, style, ...props }: Props) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        placeholderTextColor={colors.outlineVariant}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[
          styles.input,
          focused && styles.inputFocused,
          style,
        ]}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  label: {
    fontFamily: fonts.headlineSemiBold,
    fontSize: 12,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  input: {
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: radii.default,
    padding: spacing.md,
    paddingVertical: 18,
    fontSize: 16,
    fontFamily: fonts.body,
    color: colors.onSurface,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  inputFocused: {
    borderColor: colors.primary + '33',
    backgroundColor: colors.surfaceContainerLowest,
  },
});
